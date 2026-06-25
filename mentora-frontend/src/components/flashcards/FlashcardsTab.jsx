import { useEffect, useState } from "react";
import {
  Brain,
  Plus,
  Trash2,
  Star,
  Eye,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import FlashcardViewer from "../../components/flashcards/FlashcardViewer";
import { useOutletContext } from "react-router-dom";

const FlashcardsTab = () => {
    const { documentId } =
    useOutletContext();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (documentId) {
      fetchFlashcards();
    }
  }, [documentId]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);

      const response =
        await flashcardService.getFlashcardForDocument(
          documentId
        );

      setFlashcardSets(response?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      setGenerating(true);

      await aiService.generateFlashcards(
        documentId,
        {
          count: 10,
        }
      );

      await fetchFlashcards();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.message ||
          "Failed to generate flashcards"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDeleteId) return;

    try {
      setDeleting(true);

      await flashcardService.deleteFlashcardSet(
        selectedDeleteId
      );

      setFlashcardSets((prev) =>
        prev.filter(
          (item) =>
            item._id !== selectedDeleteId
        )
      );

      toast.success(
        "Flashcard set deleted successfully"
      );

      setShowDeleteModal(false);
      setSelectedDeleteId(null);
    } catch (error) {
      console.error(error);

      toast.error(
        error?.message ||
          "Failed to delete flashcard set"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleBackFromViewer = async () => {
    await fetchFlashcards();
    setSelectedSet(null);
  };

  if (selectedSet) {
    return (
      <FlashcardViewer
        flashcardSet={selectedSet}
        onBack={handleBackFromViewer}
      />
    );
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500 text-white flex items-center justify-center">
              <Brain size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Flashcards
              </h2>

              <p className="text-gray-500">
                Study smarter with AI generated
                flashcards
              </p>
            </div>
          </div>

          <button
            onClick={
              handleGenerateFlashcards
            }
            disabled={generating}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Generating...
              </>
            ) : (
              <>
                <Plus size={18} />
                Generate Flashcards
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : flashcardSets.length === 0 ? (
          <div className="text-center py-20">
            <Brain
              size={64}
              className="mx-auto text-gray-300 mb-5"
            />

            <h3 className="text-xl font-semibold mb-2">
              No Flashcards Yet
            </h3>

            <p className="text-gray-500 mb-6">
              Generate flashcards from this
              document to start learning.
            </p>

            <button
              onClick={
                handleGenerateFlashcards
              }
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-lg"
            >
              Generate Flashcards
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {flashcardSets.map((set) => {
              const totalCards =
                set.cards?.length || 0;

              const starredCards =
                set.cards?.filter(
                  (card) =>
                    card.isStarred
                ).length || 0;

              const easyCards =
                set.cards?.filter(
                  (card) =>
                    card.difficulty ===
                    "easy"
                ).length || 0;

              const mediumCards =
                set.cards?.filter(
                  (card) =>
                    card.difficulty ===
                    "medium"
                ).length || 0;

              const hardCards =
                set.cards?.filter(
                  (card) =>
                    card.difficulty ===
                    "hard"
                ).length || 0;

              return (
                <div
                  key={set._id}
                  className="border rounded-xl p-5 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Flashcard Set
                      </h3>

                      <p className="text-gray-500 text-sm mt-1">
                        Created on{" "}
                        {new Date(
                          set.createdAt
                        ).toLocaleDateString()}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                          {totalCards} Cards
                        </span>

                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full flex items-center gap-1">
                          <Star
                            size={14}
                          />
                          {starredCards}
                        </span>

                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          Easy: {easyCards}
                        </span>

                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                          Medium:{" "}
                          {mediumCards}
                        </span>

                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">
                          Hard: {hardCards}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setSelectedSet(
                            set
                          )
                        }
                        className="p-2 border rounded-lg hover:bg-gray-100"
                        title="Open Flashcards"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDeleteId(set._id);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 border rounded-lg hover:bg-red-50 text-red-500"
                        title="Delete Set"
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle
                  size={24}
                  className="text-red-500"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  Delete Flashcard Set
                </h3>

                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete
              this flashcard set? All cards
              inside it will be permanently
              removed.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDeleteId(null);
                }}
                disabled={deleting}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsTab;