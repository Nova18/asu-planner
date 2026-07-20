import { useDroppable } from '@dnd-kit/core'
import CourseCard from './CourseCard'

function TermColumn({ term, isOver, activeCourse, canPlace, isSidebar, courseStatuses }) {
    const { setNodeRef } = useDroppable({ id: term.term_id })

    const getBorderColor = () => {
        if (isSidebar) return 'border-gray-300 bg-gray-50'
        if (!activeCourse) return 'border-gray-200'
        if (isOver && !canPlace) return 'border-red-400 bg-red-50'
        if (isOver && canPlace) return 'border-green-400 bg-green-50'
        return 'border-gray-200'
    }

    return (
        <div
            ref={setNodeRef}
            className={`border-2 rounded-xl p-4 min-w-[180px] min-h-[400px] transition-all ${getBorderColor()}`}
        >
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-700 text-sm">
                    {isSidebar ? '📦 Holding' : term.is_summer ? `☀️ Summer ${term.term_number}` : `Term ${term.term_number}`}
                </h3>
                {!isSidebar && (
                    <span className="text-xs text-gray-400">
                        {term.courses.reduce((sum, c) => sum + c.credits, 0)} cr
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {term.courses.map(course => {
                    const status = courseStatuses?.find(c => c.course_id === course.course_id)?.status || 'locked'
                    return (
                        <CourseCard key={course.course_id} course={course} status={status} />
                    )
                })}
            </div>

            {term.courses.length === 0 && (
                <p className="text-gray-300 text-sm text-center mt-8">
                    {isSidebar ? 'Drag courses here to hold' : 'Drop courses here'}
                </p>
            )}
        </div>
    )
}

export default TermColumn