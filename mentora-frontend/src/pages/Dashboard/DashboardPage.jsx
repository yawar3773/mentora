import { useState, useEffect } from "react";
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService.js';
import toast from 'react-hot-toast';
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  Star,
  Flame,
  Trophy
} from 'lucide-react';
import {useNavigate} from 'react-router-dom';

const DashboardPage = () => {

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        console.log("Data___getDashboardData", data);

        setDashboardData(data.data);
      } catch (error) {
        toast.error('Failed to fetch dashboard data.');
        console.error(error);
      }finally{
        setLoading(false);
      }
    };
    fetchDashboardData();
  },[])

  if(loading) {
    return <Spinner />
  }

  if(!dashboardData || !dashboardData.overview){
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl  bg-slate-100 mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400"/>
          </div>
          <p className="text-slate-600 text-sm">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  const overview = dashboardData.overview;

  const stats = [
    {
      label: 'Documents',
      value: overview.totalDocument,
      icon: FileText,
      gradient: 'from-blue-400 to-cyan-500',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      label: 'Flashcard Sets',
      value: overview.totalFlashcardSets,
      icon: BookOpen,
      gradient: 'from-purple-400 to-pink-500',
      shadowColor: 'shadow-purple-500/25'
    },
    {
      label: 'Quizzes',
      value: overview.totalQuizzes,
      icon: BrainCircuit,
      gradient: 'from-emerald-400 to-teal-500',
      shadowColor: 'shadow-emerald-500/25'
    },
    {
      label: 'Starred Cards',
      value: overview.starredFlashcards,
      icon: Star,
      gradient: 'from-amber-400 to-orange-500',
      shadowColor: 'shadow-orange-500/25'
    }
  ];

  const flashcardProgress =
  overview.totalFlashcards > 0
    ? Math.round(
        (overview.reviewedFlashcards /
          overview.totalFlashcards) *
          100
      )
    : 0;

const quizProgress =
  overview.totalQuizzes > 0
    ? Math.round(
        (overview.completedQuizzes /
          overview.totalQuizzes) *
          100
      )
    : 0;

return (
  <div className="space-y-8">
    {/* Hero */}
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-500 to-teal-500 p-8 text-white shadow-xl">
      <div className="absolute inset-0 bg-black/5" />

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome Back 👋
          </h1>

          <p className="text-emerald-50 mt-2">
            Continue your learning journey with Mentora.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-4">
            <div className="flex items-center gap-2">
              <Flame size={18} />
              <span className="text-sm">Study Streak</span>
            </div>

            <h3 className="text-2xl font-bold">
              {overview.studyStreak} Days
            </h3>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-4">
            <div className="flex items-center gap-2">
              <Trophy size={18} />
              <span className="text-sm">Avg Score</span>
            </div>

            <h3 className="text-2xl font-bold">
              {overview.averageScore}%
            </h3>
          </div>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {stat.label}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {stat.value}
                </h2>
              </div>

              <div
                className={`w-14 h-14 rounded-2xl bg-linear-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg ${stat.shadowColor}`}
              >
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Progress */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-6">
          Flashcard Progress
        </h3>

        <div className="flex justify-between mb-2">
          <span>
            {overview.reviewedFlashcards} / {overview.totalFlashcards}
          </span>
          <span>{flashcardProgress}%</span>
        </div>

        <div className="h-3 rounded-full bg-slate-100">
          <div
            className="h-3 rounded-full bg-linear-to-r from-purple-400 to-pink-500"
            style={{ width: `${flashcardProgress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6">
        <h3 className="font-semibold mb-6">
          Quiz Completion
        </h3>

        <div className="flex justify-between mb-2">
          <span>
            {overview.completedQuizzes} / {overview.totalQuizzes}
          </span>
          <span>{quizProgress}%</span>
        </div>

        <div className="h-3 rounded-full bg-slate-100">
          <div
            className="h-3 rounded-full bg-linear-to-r from-emerald-400 to-teal-500"
            style={{ width: `${quizProgress}%` }}
          />
        </div>
      </div>
    </div>

    {/* Recent Activity */}
<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
  {/* Recent Documents */}
  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-semibold text-slate-900">
        Recent Documents
      </h3>

      <button
        onClick={() => navigate("/documents")}
        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        View All
      </button>
    </div>

    <div className="space-y-3">
      {dashboardData.recentActivity.documents.length > 0 ? (
        dashboardData.recentActivity.documents.map((doc) => (
          <div
            key={doc._id}
            className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-200"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText
                  size={20}
                  className="text-blue-500"
                />
              </div>

              <div className="min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {doc.title}
                </p>

                <p className="text-xs text-slate-500 truncate">
                  {doc.fileName}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Last accessed{" "}
                  {doc.lastAccessed
                    ? new Date(
                        doc.lastAccessed
                      ).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                navigate(`/documents/${doc._id}`)
              }
              className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition"
            >
              View
            </button>
          </div>
        ))
      ) : (
        <p className="text-sm text-slate-500">
          No recent documents found.
        </p>
      )}
    </div>
  </div>

  {/* Recent Quizzes */}
  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-semibold text-slate-900">
        Recent Quizzes
      </h3>

      <button
        onClick={() => navigate("/quizzes")}
        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        View All
      </button>
    </div>

    <div className="space-y-3">
      {dashboardData.recentActivity.quizzes.length > 0 ? (
        dashboardData.recentActivity.quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-200"
          >
            <div>
              <div className="flex items-center gap-2">
                <BrainCircuit
                  size={18}
                  className="text-emerald-500"
                />

                <h4 className="font-medium text-slate-800">
                  {quiz.title}
                </h4>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                {quiz.documentId?.title}
              </p>

              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-semibold text-emerald-600">
                  Score: {quiz.score}/
                  {quiz.totalQuestions}
                </span>

                <span className="text-xs text-slate-400">
                  {quiz.completedAt
                    ? new Date(
                        quiz.completedAt
                      ).toLocaleDateString()
                    : "Not completed"}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                navigate(`/quizzes/${quiz._id}`)
              }
              className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition"
            >
              View
            </button>
          </div>
        ))
      ) : (
        <p className="text-sm text-slate-500">
          No recent quizzes found.
        </p>
      )}
    </div>
  </div>
</div>
  </div>
);
}

export default DashboardPage;