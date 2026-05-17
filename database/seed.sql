-- CORE CS COURSES LIST (2025-2026)
-- Extracted from https://degrees.apps.asu.edu/checksheet/2025/CES/ESCSEBS/null
-- Extracted from https://degrees.apps.asu.edu/major-map/ASU00/ESCSEBS/null/ALL/2024
INSERT INTO courses (code, name, credits, is_required, term_recommended) VALUES
('ASU 101', 'The ASU Experience', 1, true, 1),
('CSE 110', 'Principles of Programming', 3, true, 1),
('EEE 120', 'Digital Design Fundamentals', 3, true, 3),
('MAT 265', 'Calculus for Engineers I', 3, true, 1),
('MAT 266', 'Calculus for Engineers II', 3, true, 2),
('CSE 205', 'Object-Oriented Programming and Data Structures', 3, true, 2),
('CSE 230', 'Computer Organization and Assembly Language Programming', 3, true, 4),
('CSE 240', 'Introduction to Programming Languages', 3, true, 3),
('FSE 100', 'Introduction to Engineering', 2, true, 1),
('CSE 301', 'Computing Ethics', 1, true, 5),
('CSE 310', 'Data Structures and Algorithms', 3, true, 4),
('CSE 330', 'Operating Systems', 3, true, 6),
('CSE 340', 'Principles of Programming Languages', 3, true, 6),
('CSE 355', 'Introduction to Theoretical Computer Science', 3, true, 5),
('CSE 360', 'Introduction to Software Engineering', 3, true, 5),
('CSE 365', 'Information Assurance', 3, true, 5),
('CSE 485', 'Computer Science Capstone Project I', 3, true, 7),
('CSE 486', 'Computer Science Capstone Project II', 3, true, 8),
('IEE 380', 'Probability and Statistics for Engineering Problem Solving', 3, true, 4),
('MAT 343', 'Applied Linear Algebra', 3, true, 5),
('MAT 243', 'Discrete Mathematical Structures', 3, true, 3);

--CORE CS COURSES LIST: Courses with alternative
INSERT INTO courses (code, name, credits, is_required, term_recommended, requirement_group) VALUES
('MAT 267', 'Calculus for Engineers III', 3, true, 3, 'term3_math'),
('CSE 259', 'Logic in Computer Science', 3, true, 3, 'term3_math'),
('CSE 412', 'Database Management', 3, true, 6, 'cs_elective_set1'),
('CSE 434', 'Computer Networks', 3, true, 6, 'cs_elective_set1'),
('CSE 445', 'Distributed Software Development', 3, true, 6, 'cs_elective_set1');

-- GEN ED COURSES LIST
INSERT INTO courses (code, name, credits, is_required, term_recommended, requirement_group) VALUES
('HUAD 1', 'Humanities, Arts and Design I', 3, true, 1, 'huad'),
('HUAD 2', 'Humanities, Arts and Design II', 3, true, 2, 'huad'),
('ENG COMP 1', 'First-Year Composition I', 3, true, 1, 'eng_comp'),
('ENG COMP 2', 'First-Year Composition II', 3, true, 2, 'eng_comp'),
('SCIT 1', 'Natural Sciences I', 4, true, 3, 'scit'),
('SCIT 2', 'Natural Sciences II', 4, true, 4, 'scit'),
('SOBE 1', 'Social and Behavioral Sciences', 3, true, 4, 'sobe'),
('AMIT 1', 'American Institutions', 3, true, 5, 'amit'),
('CIVI 1', 'Governance and Civic Engagement', 3, true, 6, 'civi'),
('GCSI 1', 'Global Communities, Societies and Individuals', 3, true, 6, 'gcsi'),
('SUST 1', 'Sustainability', 3, true, 7, 'sust');

-- PREREQUISITES LIST: Connecting courses together

-- Handling single prereq classes (not counting recursive prereqs)

-- CSE 205 Needs CSE 110
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 205'),
    (SELECT course_id FROM courses WHERE code = 'CSE 110'),
    1
);

-- CSE 240 Needs CSE 205
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 240'),
    (SELECT course_id FROM courses WHERE code = 'CSE 205'),
    1
);

-- MAT 243 Needs MAT 265
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'MAT 243'),
    (SELECT course_id FROM courses WHERE code = 'MAT 265'),
    1
);

-- MAT 266 Needs MAT 265
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'MAT 266'),
    (SELECT course_id FROM courses WHERE code = 'MAT 265'),
    1
);

-- MAT 267 Needs MAT 266
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'MAT 267'),
    (SELECT course_id FROM courses WHERE code = 'MAT 266'),
    1
);

-- CSE 259 Needs MAT 266
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 259'),
    (SELECT course_id FROM courses WHERE code = 'MAT 266'),
    1
);

-- MAT 343 Needs MAT 266
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'MAT 343'),
    (SELECT course_id FROM courses WHERE code = 'MAT 266'),
    1
);

-- IEE 380 Needs MAT 266
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'IEE 380'),
    (SELECT course_id FROM courses WHERE code = 'MAT 266'),
    1
);

-- CSE 365 Needs CSE 240
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 365'),
    (SELECT course_id FROM courses WHERE code = 'CSE 240'),
    1
);

-- CSE 360 Needs CSE 240
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 360'),
    (SELECT course_id FROM courses WHERE code = 'CSE 240'),
    1
);

-- CSE 355 Needs CSE 310
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 355'),
    (SELECT course_id FROM courses WHERE code = 'CSE 310'),
    1
);

-- CSE 340 Needs CSE 310
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 340'),
    (SELECT course_id FROM courses WHERE code = 'CSE 310'),
    1
);

-- CSE 486 Needs CSE 485
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 486'),
    (SELECT course_id FROM courses WHERE code = 'CSE 485'),
    1
);

-- Handling Multiple Prereq classes (not including recursive prereqs)

-- CSE 301 Needs CSE 205 and FSE 100
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 301'),
    (SELECT course_id FROM courses WHERE code = 'CSE 205'),
    1
);
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 301'),
    (SELECT course_id FROM courses WHERE code = 'FSE 100'),
    2
);

-- CSE 230 Needs EEE 120 and CSE 110
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 230'),
    (SELECT course_id FROM courses WHERE code = 'EEE 120'),
    1
);
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 230'),
    (SELECT course_id FROM courses WHERE code = 'CSE 110'),
    2
);

-- CSE 310 Needs MAT 243 and CSE 240
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 310'),
    (SELECT course_id FROM courses WHERE code = 'MAT 243'),
    1
);
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 310'),
    (SELECT course_id FROM courses WHERE code = 'CSE 240'),
    2
);

-- CSE 330 Needs CSE 230 and CSE 310
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 330'),
    (SELECT course_id FROM courses WHERE code = 'CSE 230'),
    1
);
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 330'),
    (SELECT course_id FROM courses WHERE code = 'CSE 310'),
    2
);

-- CSE 485 Needs CSE 355 and CSE 330 and CSE 360 and CSE 340
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 485'),
    (SELECT course_id FROM courses WHERE code = 'CSE 355'),
    1
);
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 485'),
    (SELECT course_id FROM courses WHERE code = 'CSE 330'),
    2
);
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 485'),
    (SELECT course_id FROM courses WHERE code = 'CSE 360'),
    3
);
INSERT INTO prereqs (course_id, prereq_course_id, prereq_group)
VALUES (
    (SELECT course_id FROM courses WHERE code = 'CSE 485'),
    (SELECT course_id FROM courses WHERE code = 'CSE 340'),
    4
);