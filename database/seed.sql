-- CORE CS COURSES LIST (2025-2026)
-- Extracted from https://degrees.apps.asu.edu/checksheet/2025/CES/ESCSEBS/null
INSERT INTO course (code, name, credits, is_required, term_recommended) VALUES
('CSE 110', "Principles of Programming", 3, true, 1),
('EEE 120', "Digital Design Fundamentals", 3, true, 3),
('CSE 205', "Object-Oriented Programming and Data Structures", 3, true, 2),
('CSE 230', "Computer Organization and Assembly Language Programming", 3, true, 4),
('CSE 240', "Introduction to Programming Languages", 3, true, 3),
('FSE 100', "Introduction to Engineering", 2, true, 1),
('CSE 301', "Computing Ethics", 1, true, 5),
('CSE 310', "Data Structures and Algorithms", 3, true, 4),
('CSE 330', "Operating Systems", 3, true, 6),
('CSE 340', "Principles of Programming Languages", 3, true, 6),
('CSE 355', "Introduction to Theoretical Computer Science", 3, true, 5),
('CSE 360', "Introduction to Software Engineering", 3, true, 5),
('CSE 365', "Information Assurance", 3, true, 5),
('CSE 485', "Computer Science Capstone Project I", 3, true, 7),
('CSE 486', "Computer Science Capstone Project II", 3, true, 8),
('IEE 380', "Probability and Statistics for Engineering Problem Solving", 3, true, 4),
('MAT 343', "Applied Linear Algebra", 3, true, 5);

--CORE CS COURSES List: Courses with alternative
INSERT INTO course (code, name, credits, is_required, term_recommended, requirement_group) VALUES
('CSE 412', "Database Management", 3, true, 6, 'cs_elective_set1'),
('CSE 434', "Computer Networks", 3, true, 6, 'cs_elective_set1'),
('CSE 445', "Distributed Software Development", 3, true, 6, 'cs_elective_set1');

--