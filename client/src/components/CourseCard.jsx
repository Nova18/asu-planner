import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

function CourseCard({ course, status }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: course.course_id
    })

    const style = {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.3 : 1
    }

    const borderColor = 
        status === 'completed' ? 'border-yellow-400 bg-yellow-50' :
        status === 'available' ? 'border-blue-300 bg-blue-50' :
        'border-gray-200 bg-white opacity-60'

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`border rounded-lg p-2 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all ${borderColor}`}
        >
            <span className="font-mono font-bold text-xs text-blue-700">{course.code}</span>
            <p className="text-xs text-gray-600 mt-0.5 leading-tight">{course.name}</p>
            <p className="text-xs text-gray-400 mt-1">{course.credits} cr</p>
        </div>
    )
}

export default CourseCard