import { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Lightbulb,
  Loader2,
  X,
} from "lucide-react";

import aiService from "../../services/aiService";
import ReactMarkdown from "react-markdown";
import { useOutletContext } from "react-router-dom";

const AiActionsTab = () => {
  const { documentId } = useOutletContext();

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [conceptLoading, setConceptLoading] = useState(false);

  const [concept, setConcept] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTitle("");
    setModalContent("");
  };

  const handleGenerateSummary = async () => {
    try {
      setSummaryLoading(true);

      const result = await aiService.generateSummary(documentId);

      openModal(
        "Document Summary",
        result?.summary || "No summary generated."
      );
    } catch (error) {
      openModal(
        "Error",
        error?.message || "Failed to generate summary."
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleExplainConcept = async () => {
    if (!concept.trim()) return;

    try {
      setConceptLoading(true);

      const result = await aiService.explainConcept(
        documentId,
        concept
      );

      openModal(
        `Concept: ${result?.concept}`,
        result?.explanation || "No explanation generated."
      );
    } catch (error) {
      openModal(
        "Error",
        error?.message || "Failed to explain concept."
      );
    } finally {
      setConceptLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
              <Sparkles size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                AI Assistant
              </h2>
              <p className="text-gray-500">
                Powered by advanced AI
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-6">
          {/* Generate Summary */}
          <div className="border rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BookOpen size={22} />
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    Generate Summary
                  </h3>

                  <p className="text-gray-500 mt-2">
                    Get a concise summary of the
                    entire document.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateSummary}
                disabled={summaryLoading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                {summaryLoading && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                )}

                {summaryLoading
                  ? "Generating..."
                  : "Generate"}
              </button>
            </div>
          </div>

          {/* Explain Concept */}
          <div className="border rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex gap-4 mb-5">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <Lightbulb size={22} />
              </div>

              <div>
                <h3 className="text-xl font-semibold">
                  Explain a Concept
                </h3>

                <p className="text-gray-500 mt-2">
                  Enter a topic or concept from the
                  document to get a detailed
                  explanation.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={concept}
                onChange={(e) =>
                  setConcept(e.target.value)
                }
                placeholder="e.g. React Hooks"
                className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                onClick={handleExplainConcept}
                disabled={
                  conceptLoading || !concept.trim()
                }
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
              >
                {conceptLoading && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                )}

                Explain
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-xl font-semibold">
                {modalTitle}
              </h3>

              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-black"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="prose max-w-none">
                <ReactMarkdown>
                  {modalContent}
                </ReactMarkdown>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiActionsTab;