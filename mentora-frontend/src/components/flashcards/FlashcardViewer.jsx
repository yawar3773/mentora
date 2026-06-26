import { useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";

import flashcardService from "../../services/flashcardService";

const difficultyColors = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

const FlashcardViewer = ({
  flashcardSet,
  onBack,
}) => {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [showAnswer, setShowAnswer] =
    useState(false);

  const [cards, setCards] = useState(
    flashcardSet.cards || []
  );

  const currentCard =
    cards[currentIndex];

  const handleNext = () => {
    if (
      currentIndex <
      cards.length - 1
    ) {
      setCurrentIndex(
        (prev) => prev + 1
      );
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(
        (prev) => prev - 1
      );
      setShowAnswer(false);
    }
  };

  const handleReveal = async () => {
    if (!showAnswer) {
      try {
        await flashcardService.reviewFlashcard(
          currentCard._id
        );

        setCards((prev) =>
          prev.map((card) =>
            card._id === currentCard._id
              ? {
                  ...card,
                  reviewCount:
                    (card.reviewCount ||
                      0) + 1,
                  lastReviewed:
                    new Date().toISOString(),
                }
              : card
          )
        );
      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to update review"
        );
      }
    }

    setShowAnswer((prev) => !prev);
  };

  const handleToggleStar =
    async () => {
      try {
        await flashcardService.toggleStar(
          currentCard._id
        );

        setCards((prev) =>
          prev.map((card) =>
            card._id === currentCard._id
              ? {
                  ...card,
                  isStarred:
                    !card.isStarred,
                }
              : card
          )
        );

        toast.success(
          currentCard.isStarred
            ? "Removed from favorites"
            : "Added to favorites"
        );
      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to update favorite"
        );
      }
    };

  return (
    <div className="bg-white rounded-xl border p-8">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-black mb-8"
      >
        <ArrowLeft size={18} />
        Back to Sets
      </button>

      {/* Card */}
      <div className="max-w-4xl mx-auto">
        <div
          onClick={handleReveal}
          className={`cursor-pointer border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 min-h-105 flex flex-col ${
            showAnswer
              ? "bg-emerald-50 border-emerald-200"
              : "bg-white"
          }`}
        >
          {/* Top Section */}
          <div className="flex justify-between items-center p-6">
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${
                difficultyColors[
                  currentCard.difficulty
                ]
              }`}
            >
              {
                currentCard.difficulty
              }
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStar();
              }}
              className="p-2 rounded-lg hover:bg-white/50"
            >
              <Star
                size={22}
                fill={
                  currentCard.isStarred
                    ? "#facc15"
                    : "none"
                }
                className={
                  currentCard.isStarred
                    ? "text-yellow-400"
                    : "text-gray-400"
                }
              />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center px-10">
            <div className="text-center max-w-3xl">
              {!showAnswer ? (
                <>
                  <h2 className="text-3xl font-semibold leading-relaxed">
                    {
                      currentCard.question
                    }
                  </h2>

                  <p className="mt-10 text-gray-500 flex items-center justify-center gap-2">
                    <RotateCcw size={16} />
                    Click to reveal answer
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex mx-auto mb-5 px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold uppercase tracking-wide">
                    Answer
                  </div>

                  <p className="text-2xl leading-relaxed text-emerald-900 font-medium">
                    {
                      currentCard.answer
                    }
                  </p>

                  <p className="mt-10 text-gray-500 flex items-center justify-center gap-2">
                    <RotateCcw size={16} />
                    Click to show question
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center gap-5 mt-8">
          <button
            onClick={handlePrevious}
            disabled={
              currentIndex === 0
            }
            className="px-5 py-3 border rounded-lg flex items-center gap-2 disabled:opacity-40 hover:bg-gray-50"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="px-6 py-3 border rounded-lg font-medium bg-white">
            {currentIndex + 1} /{" "}
            {cards.length}
          </div>

          <button
            onClick={handleNext}
            disabled={
              currentIndex ===
              cards.length - 1
            }
            className="px-5 py-3 border rounded-lg flex items-center gap-2 disabled:opacity-40 hover:bg-gray-50"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm">
            Reviewed{" "}
            <span className="font-semibold">
              {currentCard.reviewCount ||
                0}
            </span>{" "}
            times
          </div>

          {currentCard.lastReviewed && (
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm">
              Last Reviewed{" "}
              <span className="font-semibold">
                {new Date(
                  currentCard.lastReviewed
                ).toLocaleDateString()}
              </span>
            </div>
          )}

          {currentCard.isStarred && (
            <div className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
              ⭐ Favorite Card
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardViewer;