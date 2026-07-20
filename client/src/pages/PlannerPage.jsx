import TermColumn from '../components/TermColumn'
import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { getPlanner, initPlanner, moveCourse, addTerm } from '../api/courses'
import { getAvailableCourses } from '../api/courses'

const USER_ID = 1

function PlannerPage() {
    const [terms, setTerms] = useState([])
    const [courses, setCourses] = useState([]) // all courses with statuses
    const [activeCourse, setActiveCourse] = useState(null) // course being dragged
    const [overTermId, setOverTermId] = useState(null) // term being hovered over
    const [loading, setLoading] = useState(true)
    const [dropError, setDropError] = useState(null) // { course, term, missingPrereqs }
    const sidebarTerm = terms.find(t => t.term_number === 0)
    const plannerTerms = terms.filter(t => t.term_number > 0)

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        setLoading(true)
        await initPlanner(USER_ID)
        const [plannerData, courseData] = await Promise.all([
            getPlanner(USER_ID),
            getAvailableCourses(USER_ID)
        ])
        setTerms(plannerData)
        setCourses(courseData)
        setLoading(false)
    }

    // check if a course can be placed in a term
    // all prereqs must be in earlier terms
    const canPlaceInTerm = (course, targetTermNumber) => {
        if (!course.prereq_groups || Object.keys(course.prereq_groups).length === 0) {
            return { valid: true, missing: [] }
        }

        const missing = []

        // for each prereq group, at least one prereq must be in an earlier term
        const allValid = Object.values(course.prereq_groups).every(group =>
            group.some(prereqId => {
                // find which term this prereq is in
                const prereqTerm = terms.find(t =>
                    t.courses.some(c => c.course_id === prereqId)
                )
                if (!prereqTerm || prereqTerm.term_number >= targetTermNumber) {
                    // prereq not found in any earlier term
                    const prereqCourse = terms
                        .flatMap(t => t.courses)
                        .find(c => c.course_id === prereqId)
                    missing.push(prereqCourse ? prereqCourse.code : `Course ${prereqId}`)
                    return false
                }
                return true
            })
        )

        return { valid: allValid, missing }
    }

    const handleDragStart = (event) => {
        const { active } = event
        // find the course being dragged
        const course = findCourseById(active.id)
        setActiveCourse(course)
    }

    const handleDragOver = (event) => {
        const { over } = event
        if (over) setOverTermId(over.id)
        else setOverTermId(null)
    }

    const handleDragEnd = async (event) => {
        const { active, over } = event
        setActiveCourse(null)
        setOverTermId(null)

        if (!over) return

        const course = findCourseById(active.id)
        const targetTerm = terms.find(t => t.term_id === Number(over.id))
        if (!course || !targetTerm) return

        // check if course can go in this term
        const { valid, missing } = canPlaceInTerm(course, targetTerm.term_number)

        if (!valid) {
            // show error with missing prereqs
            const missingCourses = missing.map(prereqId => {
                const found = courses.find(c => c.course_id === prereqId)
                return found ? found.code : `Course ${prereqId}`
            })
            setDropError({ course, term: targetTerm, missingCourses })
            return
        }

        // move course
        await moveCourse(course.course_id, targetTerm.term_id, 0)
        const updated = await getPlanner(USER_ID)
        setTerms(updated)
    }

    const findCourseById = (courseId) => {
        for (const term of terms) {
            const found = term.courses.find(c => c.course_id === courseId)
            if (found) return found
        }
        return null
    }

    const handleAddTerm = async (isSummer) => {
        await addTerm(USER_ID, isSummer)
        const updated = await getPlanner(USER_ID)
        setTerms(updated)
    }

    if (loading) return <div className="p-8">Building your planner...</div>

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Degree Planner</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleAddTerm(false)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-all"
                        >
                            + Add Term
                        </button>
                        <button
                            onClick={() => handleAddTerm(true)}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-4 py-2 rounded-lg transition-all"
                        >
                            + Add Summer
                        </button>
                    </div>
                </div>

                {/* drop error modal */}
                {dropError && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                            <div className="text-4xl text-center mb-4">🚫</div>
                            <h2 className="text-xl font-bold text-center mb-2">Can't place {dropError.course.code} here</h2>
                            <p className="text-gray-500 text-sm text-center mb-4">
                                The following courses must be in an earlier term:
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                                {dropError.missingCourses.map((code, i) => (
                                    <p key={i} className="text-red-700 font-mono font-medium">{code}</p>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDropError(null)}
                                    className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        await moveCourse(dropError.course.course_id, dropError.term.term_id, 0)
                                        const updated = await getPlanner(USER_ID)
                                        setTerms(updated)
                                        setDropError(null)
                                    }}
                                    className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
                                >
                                    Place Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-6">
                    {/* sidebar */}
                    {sidebarTerm && (
                        <div className="shrink-0 w-48">
                            <TermColumn
                                term={sidebarTerm}
                                isOver={overTermId === sidebarTerm.term_id}
                                activeCourse={activeCourse}
                                canPlace={true}
                                isSidebar={true}
                            />
                        </div>
                    )}

                    {/* term columns scrollable */}
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {plannerTerms
                            .sort((a, b) => a.term_number - b.term_number)
                            .map(term => {
                                const placement = activeCourse 
                                    ? canPlaceInTerm(activeCourse, term.term_number) 
                                    : { valid: true, missing: [] }
                                return (
                                    <TermColumn
                                        key={term.term_id}
                                        term={term}
                                        isOver={overTermId === term.term_id}
                                        activeCourse={activeCourse}
                                        canPlace={placement.valid}
                                    />
                                )
                            })
                        }
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeCourse ? (
                    <div className="bg-white border-2 border-blue-400 rounded-lg p-3 shadow-xl opacity-90">
                        <span className="font-mono font-bold text-sm">{activeCourse.code}</span>
                        <p className="text-xs text-gray-500">{activeCourse.name}</p>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

export default PlannerPage