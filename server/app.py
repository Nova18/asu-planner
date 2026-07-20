from flask import Flask
from flask import request
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv
from db import get_db_connection
from collections import defaultdict
import os

#load environment
load_dotenv()

app = Flask(__name__)
#react frontend connection to Flask backend
CORS(app, resources={r"/*": {"origins": "*"}})

# health check for running server
@app.route('/health')
def health():
    return {'status': 'ok'}

# check for database connection
@app.route('/db-test')
def db_test():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM courses')
    conn.close()
    return {'status': 'database connected'}

# return all CS major courses in order of recommended terms
@app.route('/courses')
def get_courses():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('''
        SELECT course_id, code, name, credits, is_required,
                term_recommended, requirement_group
        FROM courses
        ORDER BY term_recommended        
    ''')

    rows = cur.fetchall()
    cur.close()
    conn.close()

    # build list of course dicts based on query rows
    courses = []
    for row in rows:
        courses.append({
            'course_id': row[0],
            'code': row[1],
            'name': row[2],
            'credits': row[3],
            'is_required': row[4],
            'term_recommended': row[5],
            'requirement_group': row[6]
        })

    return {'course': courses}

# Get all courses with their statuse: complete, available, lcoked
# prereq checking logic
@app.route('/courses/available/<int:user_id>')
def get_available_courses(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # gets all courses student has passed with a set
    cur.execute('''
        SELECT course_id, user_course_id FROM user_courses
        WHERE user_id = %s AND passed = true       
    ''', (user_id,))
    completed = {row[0]: row[1] for row in cur.fetchall()}

    # gets all courses along with their prereqs (if applicable)
    cur.execute('''
        SELECT c.course_id, c.code, c.name, c.credits,
                c.term_recommended, c.requirement_group, p.prereq_course_id, p.prereq_group
        FROM courses c
        LEFT JOIN prereqs p ON c.course_id = p.course_id
        ORDER BY c.course_id, p.prereq_group        
    ''')

    # Collapses rows into one object per course
    rows = cur.fetchall()
    cur.close()
    conn.close()

    course_map = {}

    for row in rows:
        cid = row[0]

        #makes sure course object built only once
        if cid not in course_map:
            course_map[cid] = {
                'course_id': row[0],
                'code': row[1],
                'name': row[2],
                'credits': row[3],
                'term_recommended': row[4],
                'requirement_group': row[5],
                'prereq_groups': {}
            }

        # add prereq to map if row has one, but NULL if not
        if row[6] is not None:
            group = str(row[7])     # use string key for JSON
            if group not in course_map[cid]['prereq_groups']:
                course_map[cid]['prereq_groups'][group] = []
            course_map[cid]['prereq_groups'][group].append(row[6])

    # checks and assigns status for each course
    result = []
    for cid, course in course_map.items():
        prereq_groups = course['prereq_groups']
        
        if cid in completed:
            status = 'completed'
            course['user_course_id'] = completed[cid]


        elif not prereq_groups:
            status = 'available'
            course['user_course_id'] = None

        else:
            # check all prereqs are satisfied
            all_groups_satisfied = all(
                any(prereq_id in completed for prereq_id in group_prereqs)
                for group_prereqs in prereq_groups.values()
            )
            status = 'available' if all_groups_satisfied else 'locked'
            course['user_course_id'] = None

        course['status'] = status
        result.append(course)

    #return courses along with statuses
    return {'courses': result}

# called when a completed course is added by user
@app.route('/user-courses', methods=['POST'])
def add_user_course():
    data = request.get_json()

    user_id = data['user_id']
    course_id = data['course_id']
    grade = data.get('grade')
    term_taken = int(data.get('term_taken')) if data.get('term_taken') else None

    # check if passed
    passing_grades = {'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'}
    passed = grade in passing_grades if grade else False

    conn = get_db_connection()
    cur = conn.cursor()

    # add completed course into records
    cur.execute('''
        INSERT INTO user_courses (user_id, course_id, grade, passed, term_taken) 
        VALUES (%s, %s, %s, %s, %s)
        RETURNING user_course_id       
    ''', (user_id, course_id, grade, passed, term_taken))
    
    user_course_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {'user_course_id': user_course_id, 'passed': passed}, 201

# called when student removes a completed class
@app.route('/user-courses/<int:user_course_id>', methods=['DELETE'])
def delete_user_course(user_course_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute('''
        DELETE FROM user_courses
        WHERE user_course_id = %s 
    ''', (user_course_id,))

    conn.commit()
    cur.close()
    conn.close()

    return {'status': 'deleted'}


# =====================
# GET PLANNER FOR A USER
# Returns all terms and their courses for a student
# =====================
@app.route('/planner/<int:user_id>', methods=['GET'])
def get_planner(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # get all terms with their courses
    cur.execute('''
        SELECT t.term_id, t.term_number, t.is_summer,
               c.course_id, c.code, c.name, c.credits,
               c.requirement_group, pc.position,
               p.prereq_course_id, p.prereq_group
        FROM planner_terms t
        LEFT JOIN planner_courses pc ON t.term_id = pc.term_id
        LEFT JOIN courses c ON pc.course_id = c.course_id
        LEFT JOIN prereqs p ON c.course_id = p.course_id
        WHERE t.user_id = %s
        ORDER BY t.term_number, pc.position, p.prereq_group
    ''', (user_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    # collapse into terms with course lists
    terms = {}
    course_map = {}

    for row in rows:
        tid = row[0]
        if tid not in terms:
            terms[tid] = {
                'term_id': row[0],
                'term_number': row[1],
                'is_summer': row[2],
                'courses': []
            }

        if row[3] is not None:
            cid = row[3]
            if cid not in course_map:
                course = {
                    'course_id': row[3],
                    'code': row[4],
                    'name': row[5],
                    'credits': row[6],
                    'requirement_group': row[7],
                    'position': row[8],
                    'prereq_groups': {}
                }
                course_map[cid] = course
                terms[tid]['courses'].append(course)

            # add prereq data
            if row[9] is not None:
                group = str(row[10])
                if group not in course_map[cid]['prereq_groups']:
                    course_map[cid]['prereq_groups'][group] = []
                if row[9] not in course_map[cid]['prereq_groups'][group]:
                    course_map[cid]['prereq_groups'][group].append(row[9])

    return {'terms': list(terms.values())}


# =====================
# INITIALIZE DEFAULT PLANNER
# Creates default 8-term plan based on ASU major map
# =====================
@app.route('/planner/<int:user_id>/init', methods=['POST'])
def init_planner(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # check if planner already exists
    cur.execute('SELECT term_id FROM planner_terms WHERE user_id = %s', (user_id,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {'status': 'already exists'}

    # create 8 default terms
    # create sidebar term (term 0)
    cur.execute('''
        INSERT INTO planner_terms (user_id, term_number, is_summer)
        VALUES (%s, 0, false)
        RETURNING term_id
    ''', (user_id,))

    for term_num in range(1, 9):
        cur.execute('''
            INSERT INTO planner_terms (user_id, term_number, is_summer)
            VALUES (%s, %s, false)
            RETURNING term_id
        ''', (user_id, term_num))
        term_id = cur.fetchone()[0]

        # add courses recommended for this term
        cur.execute('''
            SELECT course_id FROM courses
            WHERE term_recommended = %s
        ''', (term_num,))
        courses = cur.fetchall()

        for i, course in enumerate(courses):
            cur.execute('''
                INSERT INTO planner_courses (term_id, course_id, position)
                VALUES (%s, %s, %s)
            ''', (term_id, course[0], i))

    conn.commit()
    cur.close()
    conn.close()

    return {'status': 'initialized'}


# =====================
# MOVE COURSE TO DIFFERENT TERM
# Called when student drags a course to a new term
# =====================
@app.route('/planner/move', methods=['POST'])
def move_course():
    data = request.get_json()
    course_id = data['course_id']
    new_term_id = data['new_term_id']
    position = data.get('position', 0)

    conn = get_db_connection()
    cur = conn.cursor()

    # update the course's term
    cur.execute('''
        UPDATE planner_courses
        SET term_id = %s, position = %s
        WHERE course_id = %s
    ''', (new_term_id, position, course_id))

    conn.commit()
    cur.close()
    conn.close()

    return {'status': 'moved'}


# =====================
# ADD A NEW TERM TO PLANNER
# Called when student clicks "Add Term"
# =====================
@app.route('/planner/<int:user_id>/terms', methods=['POST'])
def add_term(user_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # get current highest term number
    cur.execute('''
        SELECT MAX(term_number) FROM planner_terms WHERE user_id = %s
    ''', (user_id,))
    max_term = cur.fetchone()[0] or 0

    data = request.get_json()
    is_summer = data.get('is_summer', False)

    cur.execute('''
        INSERT INTO planner_terms (user_id, term_number, is_summer)
        VALUES (%s, %s, %s)
        RETURNING term_id, term_number
    ''', (user_id, max_term + 1, is_summer))

    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {'term_id': row[0], 'term_number': row[1]}

if __name__ == '__main__':
    app.run(debug=True)