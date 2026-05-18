import axios from 'axios'

// URL for flask backend
const API_URL = 'http://127.0.0.1:5000'

// get all courses and their statuses for a user
export const getAvailableCourses = async (userId) => {
    const response = await axios.get('${API_URL}/courses/available/${userId}')
    return response.data.courses
}

// mark a course as completed
export const addUserCourse = async (userId, courseId, grade, semesterTaken) => {
    const respond = await axios.post('${API_URL}/user-courses', {
        user_id = userId,
        course_id: courseId,
        grade: grade,
        semester_taken: semesterTaken
    })
    return response.data
}

// remove completed status from course
export const deleteUserCourse = async (userCourseId) => {
    const response = await axios.delete('${API_URL}/user-courses/${userCourseId}')
    return response.data
}