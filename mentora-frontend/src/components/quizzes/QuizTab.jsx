import { useEffect, useState } from "react";
import {
  Brain,
  Plus,
  Play,
  Trophy,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import aiService from "../../services/aiService";
import quizService from "../../services/quizService";

import QuizPlayer from "../../components/quizzes/QuizPlayer";
import QuizResults from "../../components/quizzes/QuizResults";
import { useOutletContext } from "react-router-dom";

const QuizTab = () => {
    const { documentId } =
    useOutletContext();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [quizzes, setQuizzes] = useState([]);

  const [selectedQuiz, setSelectedQuiz] =
    useState(null);

  const [resultQuizId, setResultQuizId] =
    useState(null);

  useEffect(() => {
    if (documentId) {
      fetchQuizzes();
    }
  }, [documentId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);

      const response =
        await quizService.getQuizzesForDocument(
          documentId
        );

      setQuizzes(response.data || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
          "Failed to fetch quizzes"
      );
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    try {
      setGenerating(true);

      await aiService.generateQuiz(
        documentId,
        {
          numQuestions: 10,
        }
      );

      toast.success(
        "Quiz generated successfully"
      );

      fetchQuizzes();
    } catch (error) {
      toast.error(
        error.message ||
          "Failed to generate quiz"
      );
    } finally {
      setGenerating(false);
    }
  };

  const deleteQuiz = async (
    quizId
  ) => {
    try {
      await quizService.deleteQuiz(
        quizId
      );

      toast.success(
        "Quiz deleted successfully"
      );

      setQuizzes((prev) =>
        prev.filter(
          (q) => q._id !== quizId
        )
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Failed to delete quiz"
      );
    }
  };

  if (selectedQuiz) {
    return (
      <QuizPlayer
        quiz={selectedQuiz}
        onBack={() =>
          setSelectedQuiz(null)
        }
        onCompleted={(quizId) => {
          setSelectedQuiz(null);
          setResultQuizId(quizId);
          fetchQuizzes();
        }}
      />
    );
  }

  if (resultQuizId) {
    return (
      <QuizResults
        quizId={resultQuizId}
        onBack={() =>
          setResultQuizId(null)
        }
      />
    );
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            Quizzes
          </h2>

          <p className="text-gray-500">
            Test your understanding
          </p>
        </div>

        <button
          onClick={generateQuiz}
          disabled={generating}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-lg flex items-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              Generating...
            </>
          ) : (
            <>
              <Plus size={18} />
              Generate Quiz
            </>
          )}
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-16">
            <Brain
              size={60}
              className="mx-auto text-gray-300 mb-4"
            />

            <h3 className="font-semibold text-xl">
              No quizzes available
            </h3>
          </div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => {
  const easyCount =
    quiz.questions?.filter(
      (q) => q.difficulty === "easy"
    ).length || 0;

  const mediumCount =
    quiz.questions?.filter(
      (q) => q.difficulty === "medium"
    ).length || 0;

  const hardCount =
    quiz.questions?.filter(
      (q) => q.difficulty === "hard"
    ).length || 0;

  return (
    <div
  key={quiz._id}
  className="border rounded-2xl p-5 hover:shadow-lg transition-all duration-300"
>
  <div className="flex justify-between items-start">
    <div className="flex-1">
      <h3 className="font-bold text-lg">
        {quiz.title}
      </h3>

      <p className="text-gray-500 text-sm mt-1">
        Created{" "}
        {new Date(
          quiz.createdAt
        ).toLocaleDateString()}
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        <span className="px-3 py-1 rounded-full bg-gray-100 text-sm">
          {quiz.totalQuestions} Questions
        </span>

        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
          Easy: {easyCount}
        </span>

        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
          Medium: {mediumCount}
        </span>

        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
          Hard: {hardCount}
        </span>
      </div>

      {quiz.completedAt && (
        <div className="mt-4 flex items-center gap-3">
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
            Score: {quiz.score}%
          </span>

          <span className="text-sm text-gray-500">
            Completed{" "}
            {new Date(
              quiz.completedAt
            ).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>

    <div className="flex gap-2">
      {!quiz.completedAt ? (
        <button
          onClick={() =>
            setSelectedQuiz(quiz)
          }
          className="h-10 w-10 rounded-lg border hover:bg-emerald-50 hover:border-emerald-500 flex items-center justify-center"
        >
          <Play size={18} />
        </button>
      ) : (
        <button
          onClick={() =>
            setResultQuizId(quiz._id)
          }
          className="h-10 w-10 rounded-lg border hover:bg-yellow-50 hover:border-yellow-500 flex items-center justify-center"
        >
          <Trophy size={18} />
        </button>
      )}

      <button
        onClick={() =>
          deleteQuiz(quiz._id)
        }
        className="h-10 w-10 rounded-lg border text-red-500 hover:bg-red-50 hover:border-red-500 flex items-center justify-center"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>
</div>
  );
})}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizTab;