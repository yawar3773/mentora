import {
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import quizService from "../../services/quizService";

const QuizResults = ({
  quizId,
  onBack,
}) => {
  const [loading, setLoading] =
    useState(true);

  const [data, setData] =
    useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response =
        await quizService.getQuizResults(
          quizId
        );

      setData(response.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-10">
        Loading...
      </div>
    );

  return (
    <div className="bg-white border rounded-xl p-8">
      <button
        onClick={onBack}
        className="flex gap-2 mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">
          {data.quiz.score}%
        </h2>

        <p className="text-gray-500">
          Final Score
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
  <div className="border rounded-xl p-4 text-center">
    <div className="text-2xl font-bold">
      {data.quiz.score}%
    </div>
    <div className="text-gray-500 text-sm">
      Score
    </div>
  </div>

  <div className="border rounded-xl p-4 text-center">
    <div className="text-2xl font-bold">
      {data.quiz.totalQuestions}
    </div>
    <div className="text-gray-500 text-sm">
      Questions
    </div>
  </div>

  <div className="border rounded-xl p-4 text-center">
    <div className="text-2xl font-bold">
      {data.results.filter(
        (r) => r.isCorrect
      ).length}
    </div>
    <div className="text-gray-500 text-sm">
      Correct
    </div>
  </div>
</div>

      <div className="space-y-5">
        {data.results.map(
          (result, index) => (
<div
  key={index}
  className={`rounded-2xl border p-5 ${
    result.isCorrect
      ? "border-green-200 bg-green-50"
      : "border-red-200 bg-red-50"
  }`}
>
  <div className="flex items-center gap-3 mb-4">
    {result.isCorrect ? (
      <CheckCircle className="text-green-500" />
    ) : (
      <XCircle className="text-red-500" />
    )}

    <h4 className="font-semibold">
      Question {index + 1}
    </h4>

    <span
      className={`px-2 py-1 rounded-full text-xs ${
        result.difficulty === "easy"
          ? "bg-green-100 text-green-700"
          : result.difficulty === "medium"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {result.difficulty}
    </span>
  </div>

  <p className="font-medium mb-4">
    {result.question}
  </p>

  <div className="space-y-2 text-sm">
    <p>
      <strong>Your Answer:</strong>{" "}
      {result.selectedAnswer}
    </p>

    <p className="text-green-700">
      <strong>Correct Answer:</strong>{" "}
      {result.correctAnswer}
    </p>

    {result.explanation && (
      <div className="mt-4 p-3 rounded-lg bg-white border">
        <p className="font-semibold mb-1">
          Explanation
        </p>

        <p className="text-gray-600">
          {result.explanation}
        </p>
      </div>
    )}
  </div>
</div>
          )
        )}
      </div>
    </div>
  );
};

export default QuizResults;