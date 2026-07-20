import { useState } from 'react'
import CourseList from './pages/CourseList'
import PlannerPage from './pages/PlannerPage'

function App() {
    const [page, setPage] = useState('courses')

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex gap-6">
                <button
                    onClick={() => setPage('courses')}
                    className={`font-medium transition-all ${page === 'courses' ? 'text-yellow-600 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Course List
                </button>
                <button
                    onClick={() => setPage('planner')}
                    className={`font-medium transition-all ${page === 'planner' ? 'text-yellow-600 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Planner
                </button>
            </nav>
            {page === 'courses' ? <CourseList /> : <PlannerPage />}
        </div>
    )
}

export default App