import { useState, useEffect } from 'react'
import { getAvailableCourses } from '../api/courses'

// temporary user id, edit later
const USER_ID = 1

function CourseList() {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    //fetch course on page load
    useEffect(() => {
        const fetchCourseList = async () => {
            const data = await getAvailableCourses(USER_ID)
            setCourses(data)
            setLoading(false)
        }
        fetchCourseList()
    }, [])
}