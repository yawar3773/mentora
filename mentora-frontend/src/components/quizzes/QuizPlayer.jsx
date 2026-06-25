import { useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

import quizService from "../../services/quizService";

const QuizPlayer = ({
  quiz,
  onBack,
  onCompleted,
}) => {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const currentQuestion =
    quiz.questions[currentIndex];

  const handleSubmit =
    async () => {
      try {
        const formattedAnswers =
          Object.entries(
            answers
          ).map(
            ([
              questionIndex,
              selectedAnswer,
            ]) => ({
              questionIndex:
                Number(
                  questionIndex
                ),
              selectedAnswer,
            })
          );

        await quizService.submitQuiz(
          quiz._id,
          formattedAnswers
        );

        toast.success(
          "Quiz submitted"
        );

        onCompleted(quiz._id);
      } catch (error) {
        toast.error(
          error.message
        );
      }
    };

  return (
    <div className="bg-white border rounded-xl p-8">
      <button
        onClick={onBack}
        className="flex gap-2 mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h2 className="text-2xl font-bold mb-8">
        {quiz.title}
      </h2>

      <div className="mb-4">
        <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentQuestion.difficulty === "easy"
                ? "bg-green-100 text-green-700"
                : currentQuestion.difficulty === "medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
        >
            {currentQuestion.difficulty}
        </span>
        </div>

      <div className="border rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-6">
          Q{currentIndex + 1}.{" "}
          {
            currentQuestion.question
          }
        </h3>

        <div className="grid gap-3">
          {currentQuestion.options.map(
            (option) => (
              <button
                key={option}
                onClick={() =>
                  setAnswers({
                    ...answers,
                    [currentIndex]:
                      option,
                  })
                }
                className={`p-4 rounded-xl border text-left ${
                  answers[
                    currentIndex
                  ] === option
                    ? "border-emerald-500 bg-emerald-50"
                    : ""
                }`}
              >
                {option}
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() =>
            setCurrentIndex(
              (p) => p - 1
            )
          }
          disabled={
            currentIndex === 0
          }
        >
          <ChevronLeft />
        </button>

        {currentIndex ===
        quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() =>
              setCurrentIndex(
                (p) => p + 1
              )
            }
          >
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;