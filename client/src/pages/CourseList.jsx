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

    if (loading) return <div className="p-8">Setting up your space...</div>

    return (
        <div className='p-8'>
            <h1 className='text-2xl font-bold mb-6'>My Plan</h1>
            <div className='grid grid-cols-1 gap-3'>
                {courses.map(course => (
                    <div
                        key={course.course_id}
                        className={`p-4 rounded-lg border ${
                            course.status === 'completed' ? 'bg-green-50 border-green-300' :
                            course.status === 'available' ? 'bg-blue-50 border-blue-300' :
                            'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="font-mono font-bold">{course.code}</span>
                                <span className="ml-3 text-gray-700">{course.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">{course.credits} credits</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    course.status === 'completed' ? 'bg-green-200 text-green-800' :
                                    course.status === 'available' ? 'bg-blue-200 text-blue-800' :
                                    'bg-gray-200 text-gray-600'
                                }`}>
                                    {course.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CourseList