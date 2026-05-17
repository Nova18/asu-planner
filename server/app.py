from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from db import get_db_connection
import os

#load environment
load_dotenv()

app = Flask(__name__)
#react frontend connection to Flask backend
CORS(app)

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
            'terms_recommended': row[5],
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
        SELECT course_id FROM user_courses
        WHERE user_id = %s AND passed = true       
    ''', (user_id,))
    completed = set(row[0] for row in cur.fetchall())
    
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

    from collections import defaultdict
    course_map = {}
    prereq_map = defaultdict(lambda: defaultdict(list))

    for row in rows:
        cid = row[0]

        #makes sure course object built only once
        if cid not in course_map:
            course_map[cid] = {
                'course_id': row[0],
                'code': row[1],
                'name': row[2],
                'credits': row[3],
                'terms_recommended': row[5],
                'requirement_group': row[6]
            }

        # add prereq to map if row has one, but NULL if not
        if row[6] is not None:
            prereq_map[cid][row[7]].append(row[6])

    # checks and assigns status for each course
    result = []
    for cid, course in course_map.items():
        
        if cid in completed:
            status = 'completed'
        
        elif not prereq_map[cid]:
            status = 'available'
        
        else:
            # check all prereqs are satisfied
            all_groups_satisfied = all(
                any(prereq_id in completed for prereq_id in group_prereqs)
                for group_prereqs in prereq_map[cid].values()
            )
            status = 'available' if all_groups_satisfied else 'locked'

        course['status'] = status
        result.append(course)

    #return courses along with statuses
    return {'courses': result}

if __name__ == '__main__':
    app.run(debug=True)