import axios from 'axios'

// URL for flask backend
const API_URL = '/api'

// get all courses and their statuses for a user
export const getAvailableCourses = async (userId) => {
    const response = await axios.get(`${API_URL}/courses/available/${userId}`)
    return response.data.courses
}

// mark a course as completed
export const addUserCourse = async (userId, courseId, grade, termTaken) => {
    const response = await axios.post(`${API_URL}/user-courses`, {
        user_id: userId,
        course_id: courseId,
        grade: grade,
        term_taken: termTaken
    })
    return response.data
}

// remove completed status from course
export const deleteUserCourse = async (userCourseId) => {
    const response = await axios.delete(`${API_URL}/user-courses/${userCourseId}`)
    return response.data
}

// get planner for a user
export const getPlanner = async (userId) => {
    const response = await axios.get(`${API_URL}/planner/${userId}`)
    return response.data.terms
}

// initialize default planner
export const initPlanner = async (userId) => {
    const response = await axios.post(`${API_URL}/planner/${userId}/init`)
    return response.data
}

// move course to different term
export const moveCourse = async (courseId, newTermId, position) => {
    const response = await axios.post(`${API_URL}/planner/move`, {
        course_id: courseId,
        new_term_id: newTermId,
        position: position
    })
    return response.data
}

// add a new term
export const addTerm = async (userId, isSummer) => {
    const response = await axios.post(`${API_URL}/planner/${userId}/terms`, {
        is_summer: isSummer
    })
    return response.data
}