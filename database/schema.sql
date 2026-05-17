-- COURSES: Stores all the CS Major map courses
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    term_recommended INTEGER,
    requirement_group VARCHAR(20) DEFAULT NULL
);

-- PREREQS: keeps track of prereq relations between courses
-- AND logic between the groups, as well as OR logic within a group itself for alternative prereqs
CREATE TABLE prereqs (
    prereq_id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(course_id),
    prereq_course_id INTEGER REFERENCES courses(course_id),
    prereq_group INTEGER NOT NULL DEFAULT 1
);

-- USERS: keep track of student accounts
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USER_COURSES: track completed courses for a user
CREATE TABLE user_courses (
    user_course_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    course_id INTEGER REFERENCES courses(course_id),
    grade VARCHAR(2),
    passed BOOLEAN NOT NULL,
    semester_taken VARCHAR(20)
);

-- USER_PLANS: keep track of student's degree plan
CREATE TABLE user_plans (
    plan_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    plan_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PLANNED_COURSES: drag and drop tracker for which course is dropped into which semester
CREATE TABLE planned_courses (
    planned_course_id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES user_plans(plan_id),
    course_id INTEGER REFERENCES courses(course_id),
    planned_semester VARCHAR(10) NOT NULL,
    planned_year INTEGER NOT NULL
);

