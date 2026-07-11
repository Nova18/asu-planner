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
    semester_taken = data.get('semester_taken')

    # check if passed
    passing_grades = {'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'}
    passed = grade in passing_grades if grade else False

    conn = get_db_connection()
    cur = conn.cursor()

    # add completed course into records
    cur.execute('''
        INSERT INTO user_courses (user_id, course_id, grade, passed, semester_taken) 
        VALUES (%s, %s, %s, %s, %s)
        RETURNING user_course_id       
    ''', (user_id, course_id, grade, passed, semester_taken))
    
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

if __name__ == '__main__':
    app.run(debug=True)