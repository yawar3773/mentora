import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Brain,
  Star,
  Trash2,
  ArrowRight,
  Calendar,
} from 'lucide-react';

import flashcardService from '../../services/flashcardService';
import Spinner from '../../components/common/Spinner';

const FlashcardListPage = () => {
  const navigate = useNavigate();

  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);

      const response = await flashcardService.getAllFlashcardSets();

      setFlashcardSets(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this flashcard set?'
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await flashcardService.deleteFlashcardSet(id);

      setFlashcardSets((prev) =>
        prev.filter((flashcard) => flashcard._id !== id)
      );
    } catch (error) {
      console.error(error);
      alert(error.message || 'Failed to delete flashcard set');
    } finally {
      setDeletingId(null);
    }
  };

  const totalSets = flashcardSets.length;

  const totalCards = flashcardSets.reduce(
    (acc, set) => acc + (set.cards?.length || 0),
    0
  );

  const totalStarred = flashcardSets.reduce(
    (acc, set) =>
      acc +
      (set.cards?.filter((card) => card.isStarred).length || 0),
    0
  );

  const totalReviewed = flashcardSets.reduce(
    (acc, set) =>
      acc +
      (set.cards?.filter((card) => card.reviewCount > 0).length || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Flashcards
        </h1>

        <p className="text-gray-500 mt-2">
          Review and manage your generated flashcards.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <BookOpen size={22} />
            <span className="text-2xl font-bold">{totalSets}</span>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Flashcard Sets
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <Brain size={22} />
            <span className="text-2xl font-bold">{totalCards}</span>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Total Cards
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <Star size={22} />
            <span className="text-2xl font-bold">{totalStarred}</span>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Starred Cards
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <Brain size={22} />
            <span className="text-2xl font-bold">{totalReviewed}</span>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Reviewed Cards
          </p>
        </div>
      </div>

      {/* Empty State */}
      {flashcardSets.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <BookOpen
            className="mx-auto text-gray-400 mb-4"
            size={48}
          />

          <h3 className="text-xl font-semibold mb-2">
            No Flashcards Found
          </h3>

          <p className="text-gray-500">
            Generate flashcards from your uploaded documents.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {flashcardSets.map((flashcard) => (
            <div
              key={flashcard._id}
              className="bg-white border rounded-xl p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {flashcard.documentId?.title ||
                    'Untitled Document'}
                </h3>

                <button
                  onClick={() => handleDelete(flashcard._id)}
                  disabled={deletingId === flashcard._id}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Total Cards
                  </span>

                  <span className="font-medium">
                    {flashcard.cards?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Starred
                  </span>

                  <span className="font-medium">
                    {flashcard.cards?.filter(
                      (card) => card.isStarred
                    ).length || 0}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={14} />

                  {new Date(
                    flashcard.createdAt
                  ).toLocaleDateString()}
                </div>
              </div>

              <button
                onClick={() =>
                  navigate(
                    `/documents/${flashcard.documentId._id}/flashcards`
                  )
                }
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
              >
                Review Flashcards
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardListPage;