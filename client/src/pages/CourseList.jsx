import { useState, useEffect, useRef } from 'react'
import { addUserCourse, deleteUserCourse, getAvailableCourses } from '../api/courses'
import confetti from 'canvas-confetti'
import Modal from '../components/Modal'

// temporary user id, edit later
const USER_ID = 1

function CourseList() {
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(false)
    const unlockedRef = useRef([])
    const [shakingCourse, setShakingCourse] = useState(null)
    const [errorCourse, setErrorCourse] = useState(null)
    const [celebration, setCelebration] = useState(null)
    const courseRefs = useRef({})
    const [modal, setModal] = useState(null)
    const [failModal, setFailModal] = useState(null)
    const [prereqWarning, setPrereqWarning] = useState(null) // { affectedCourses: [] }

    //fetch course on page load
    useEffect(() => {
        fetchCourses()
    }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
        const data = await getAvailableCourses(USER_ID)
        setCourses(data)
    } catch (error) {
        console.error('Error fetching courses:', error)
    } finally {
        setLoading(false)
    }
}

    //used to check what courses are unlocked when a certain course is marked completed
    
    const getUnlockedCourses = (completedCourseId, allCourses) => {
        console.log('newly completed course_id:', completedCourseId)
        const completedIds = new Set(
            allCourses
                .filter(c => c.status === 'completed')
                .map(c => c.course_id)
        )
        completedIds.add(completedCourseId)
        console.log('set contents:', [...completedIds])
        console.log('after add, has 2?', completedIds.has(2), completedIds.has('2'), completedCourseId, typeof completedCourseId)        
        console.log('completed ids:', completedIds)
        console.log('all courses prereq_groups sample:', allCourses[1]?.prereq_groups)

        return allCourses.filter(c => {
            if (c.status === 'completed' || c.status === 'available') return false
            if (!c.prereq_groups || Object.keys(c.prereq_groups).length === 0) return false

            const result = Object.values(c.prereq_groups).every(group =>
                group.some(prereqId => completedIds.has(prereqId))
            )
            console.log('unlock check:', c.code, JSON.stringify(Object.values(c.prereq_groups)), [...completedIds].slice(0, 5))
            return result
        })
    }

    // group courses by recommended term
    const groupByTerm = (courses) => {
        const groups = {}
        courses.forEach(course => {
            const term = course.term_recommended || 'Other'
            if (!groups[term]) groups[term] = []
            groups[term].push(course)
        })
        return groups
    }

    const fireConfetti = (courseId) => {
        const el = courseRefs.current[courseId]
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = (rect.left + rect.width / 2) / window.innerWidth
        const y = (rect.top + rect.height / 2) / window.innerHeight

        confetti({
            particleCount: 80,
            spread: 60,
            origin: { x, y },
            colors: ['#FFC627', '#8C1D40', '#ffffff', '#FFD700'],
            startVelocity: 25,
            gravity: 0.8,
            scalar: 0.9
        })
    }

    const handleCourseClick = async (course) => {
        if (course.status === 'locked') {
            setShakingCourse(course.course_id)
            setErrorCourse(course.course_id)
            setTimeout(() => setShakingCourse(null), 400)
            setTimeout(() => setErrorCourse(null), 3000)
            return
        }

        if (course.status === 'completed') {
            setModal({ type: 'confirm', course })
            return
        }

        setModal({ type: 'grade', course })
    }

    // find completed courses whose prereqs are no longer satisfied
    const getAffectedCourses = (removedCourseId, allCourses) => {
        const completedIds = new Set(
            allCourses
                .filter(c => c.status === 'completed')
                .map(c => c.course_id)
        )
        // remove the deleted course from completed set
        completedIds.delete(removedCourseId)

        return allCourses.filter(c => {
            if (c.status !== 'completed') return false
            if (!c.prereq_groups || Object.keys(c.prereq_groups).length === 0) return false

            // check if any prereq group is now unsatisfied
            return !Object.values(c.prereq_groups).every(group =>
                group.some(prereqId => completedIds.has(prereqId))
            )
        })
    }


    if (loading) return <div className="p-8">Setting up your space...</div>

    return (
        <div className='p-8'>
            <h1 className='text-2xl font-bold mb-6'>My Plan</h1>
            
            {/* celebrate completion modal */}
            {celebration && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center border-4 border-yellow-400">
                        <div className="text-5xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Congrats on completing {celebration.course.code}!
                        </h2>
                        <p className="text-gray-500 mb-4">{celebration.course.name}</p>

                        {celebration.unlockedCourses.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
                                {celebration.unlockedCourses.map(c => (
                                    <p key={c.course_id} className="text-yellow-800 font-medium">
                                        You have unlocked {c.code}!
                                    </p>
                                ))}
                            </div>
                        )}

                        <p className="text-lg font-bold text-yellow-600 mb-6">Onwards!!</p>
                        <button
                            onClick={() => setCelebration(null)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-8 rounded-full transition-all"
                        >
                            Let's go!
                        </button>
                    </div>
                </div>
            )}

            {/* multipurpose modal */}
            {modal && (
                <Modal
                    type={modal.type}
                    course={modal.course}
                    onConfirm={async (grade, term) => {
                        if (modal.type === 'confirm') {
                            const removedCourseId = modal.course.course_id
                            // check for affected courses BEFORE fetching
                            const affected = getAffectedCourses(removedCourseId, courses)
                            setModal(null)
                            await deleteUserCourse(modal.course.user_course_id)
                            await fetchCourses()
                            if (affected.length > 0) {
                                setPrereqWarning({ affectedCourses: affected })
                            }
                        } else {
                            setModal(null)
                            const unlockedCourses = getUnlockedCourses(modal.course.course_id, courses)
                            unlockedRef.current = unlockedCourses
                            const savedCourse = modal.course
                            
                            // check if grade is passing before celebrating
                            const passingGrades = new Set(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'])
                            const passed = passingGrades.has(grade)
                            
                            await addUserCourse(USER_ID, modal.course.course_id, grade, term)
                            await fetchCourses()
                            
                            if (!passed) {
                                // show error instead of celebration
                                setFailModal({ course: savedCourse, grade })
                                return
                            }
                            
                            setTimeout(() => {
                                fireConfetti(savedCourse.course_id)
                                setCelebration({ course: savedCourse, unlockedCourses: unlockedRef.current })
                            }, 100)
                        }
                    }}
                    onCancel={() => setModal(null)}
                />
            )}

            {/* prereq warning modal */}
            {prereqWarning && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                        <div className="text-4xl text-center mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-center mb-2">Heads up!</h2>
                        <p className="text-gray-500 text-sm text-center mb-6">
                            The following completed courses have a prerequisite that was just removed. What would you like to do?
                        </p>
                        <div className="flex flex-col gap-3">
                            {prereqWarning.affectedCourses.map(c => (
                                <div key={c.course_id} className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <div>
                                        <span className="font-mono font-bold text-sm">{c.code}</span>
                                        <span className="ml-2 text-gray-600 text-sm">{c.name}</span>
                                    </div>
                                    <div className="flex gap-2 ml-3 shrink-0">
                                        <button
                                            onClick={async () => {
                                                // remove this course from completed
                                                await deleteUserCourse(c.user_course_id)
                                                await fetchCourses()
                                                setPrereqWarning(prev => {
                                                    const remaining = prev.affectedCourses.filter(x => x.course_id !== c.course_id)
                                                    return remaining.length > 0 ? { affectedCourses: remaining } : null
                                                })
                                            }}
                                            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-medium px-3 py-1 rounded-full transition-all"
                                        >
                                            Remove
                                        </button>
                                        <button
                                            onClick={() => {
                                                setPrereqWarning(prev => {
                                                    const remaining = prev.affectedCourses.filter(x => x.course_id !== c.course_id)
                                                    return remaining.length > 0 ? { affectedCourses: remaining } : null
                                                })
                                            }}
                                            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium px-3 py-1 rounded-full transition-all"
                                        >
                                            Keep
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {failModal && (
                <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center border-4 border-red-400">
                        <div className="text-5xl mb-4">😔</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {failModal.course.code} — Grade: {failModal.grade}
                        </h2>
                        <p className="text-gray-500 mb-2">{failModal.course.name}</p>
                        <p className="text-red-500 font-medium mb-6">
                            A grade of D or below does not satisfy this course requirement. You may need to retake it.
                        </p>
                        <button
                            onClick={() => setFailModal(null)}
                            className="bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-8 rounded-full transition-all"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            <div className='grid grid-cols-1 gap-3'>
                {Object.entries(groupByTerm(courses))
                    .sort(([a], [b]) => a - b)
                    .map(([term, termCourses]) => (
                        <div key={term} className="mb-8">
                            <h2 className="text-lg font-bold text-gray-600 mb-3 border-b pb-2">
                                {term === 'Other' ? 'Other Requirements' : `Term ${term}`}
                            </h2>
                            <div className="grid grid-cols-1 gap-3">
                                {termCourses.map(course => (
                                    <div key={course.course_id}>
                                        <div
                                            ref={el => courseRefs.current[course.course_id] = el}
                                            onClick={() => handleCourseClick(course)}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all
                                                ${shakingCourse === course.course_id ? 'shake border-red-400 bg-red-50' :
                                                course.status === 'completed' ? 'gold-glow border-2' :
                                                course.status === 'available' ? 'bg-blue-50 border-blue-300 hover:bg-blue-100' :
                                                'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
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
                                                        course.status === 'completed' ? 'bg-yellow-200 text-yellow-800' :
                                                        course.status === 'available' ? 'bg-blue-200 text-blue-800' :
                                                        'bg-gray-200 text-gray-600'
                                                    }`}>
                                                        {course.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {errorCourse === course.course_id && (
                                            <p className="text-red-500 italic text-sm mt-1 ml-1">
                                                Please complete prerequisites first to mark this course complete!
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default CourseList