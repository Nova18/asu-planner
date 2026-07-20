import { useState } from 'react'

function Modal({ type, course, onConfirm, onCancel }) {

  const [grade, setGrade] = useState('')
  const [term, setTerm] = useState('')

  const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'E']

  const generateTerms = () => {
      const terms = []
      for (let i = 1; i <= 12; i++) {
          terms.push(i)
      }
      return terms
  }

  const handleConfirm = () => {
    if (type === 'grade' && (!grade || !term)) return
    onConfirm(grade, term)
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">

        {type === 'grade' ? (
          <>
            <h2 className="text-xl font-bold mb-1">{course.code}</h2>
            <p className="text-gray-500 text-sm mb-6">{course.name}</p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Select grade...</option>
              {grades.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">Term Taken</label>
            <select
              value={term}
              onChange={e => setTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Select Term...</option>
              {generateTerms().map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </>
        ) : (
          <>
            <div className="text-4xl text-center mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-center mb-2">Remove {course.code}?</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              This will remove {course.name} from your completed courses and may lock courses that depend on it.
            </p>
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={type === 'grade' && (!grade || !term)}
            className={`flex-1 py-2 rounded-lg font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed
              ${type === 'grade' ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          >
            {type === 'grade' ? 'Mark Complete' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal