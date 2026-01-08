import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/button/Button'
import { ClipboardList, BarChart3, Users, Shield } from 'lucide-react'
import SurveyModal from '../../components/surveyModal/SurveyModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false)

  const handleSurveyClick = () => {
    setIsSurveyModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome to the Prison Management System</p>
      </div>

      {/* Survey Button Section */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full p-6">
            <ClipboardList className="w-16 h-16 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Start Survey</h2>
            <p className="text-slate-600 max-w-md">
              Click the button below to begin the survey process. This will help you collect and analyze data.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSurveyClick}
            className="min-w-[200px]"
          >
            <ClipboardList className="w-5 h-5" />
            Do Survey
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Inmates</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Security Status</p>
              <p className="text-2xl font-bold text-slate-900">Active</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Analytics</p>
              <p className="text-2xl font-bold text-slate-900">Ready</p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Survey Modal */}
      <SurveyModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        inmateId={1}
      />
    </div>
  )
}
