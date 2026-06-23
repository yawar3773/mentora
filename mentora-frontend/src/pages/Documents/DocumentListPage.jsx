import { useState, useEffect } from "react";
import {
  Plus,
  Upload,
  Trash2,
  FileText,
  BookOpen,
  Calendar,
  Eye,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const response = await documentService.getDocuments();

      // Adjust this according to your API response
      setDocuments(response.data || response || []);
    } catch (error) {
      toast.error("Failed to fetch documents");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile || !uploadTitle.trim()) {
      toast.error("Please provide a title and select a file.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);

      toast.success("Document uploaded successfully");

      setUploadFile(null);
      setUploadTitle("");
      setIsUploadModalOpen(false);

      fetchDocuments();
    } catch (error) {
      toast.error(error?.message || "Upload failed");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;

    setDeleting(true);

    try {
      await documentService.deleteDocument(selectedDoc._id);

      toast.success(`"${selectedDoc.title}" deleted successfully`);

      setDocuments((prev) =>
        prev.filter((doc) => doc._id !== selectedDoc._id)
      );

      setSelectedDoc(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(error?.message || "Failed to delete document");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Documents
          </h1>
          <p className="text-slate-600 mt-1">
            Upload and manage your learning materials.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all duration-200"
        >
          <Plus size={18} />
          Upload Document
        </button>
      </div>

      {/* Empty State */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <FileText
            size={48}
            className="mx-auto text-slate-300 mb-4"
          />

          <h3 className="text-lg font-semibold text-slate-900">
            No Documents Yet
          </h3>

          <p className="text-slate-500 mt-2">
            Upload your first PDF document to get started.
          </p>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-6 px-5 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition"
          >
            Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <FileText
                    size={24}
                    className="text-blue-500"
                  />
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doc.status === "ready"
                      ? "bg-emerald-100 text-emerald-700"
                      : doc.status === "processing"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {doc.status}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-slate-900 line-clamp-2">
                  {doc.title}
                </h3>

                <p className="text-sm text-slate-500 mt-1 truncate">
                  {doc.fileName}
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={14} />
                  {new Date(
                    doc.uploadDate || doc.createdAt
                  ).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <BookOpen size={14} />
                  {doc.flashcardCount || 0} Flashcards
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FileText size={14} />
                  {doc.quizCount || 0} Quizzes
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() =>
                    (window.location.href = `/documents/${doc._id}`)
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  <Eye size={16} />
                  View
                </button>

                <button
                  onClick={() => handleDeleteRequest(doc)}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                Upload Document
              </h3>

              <button
                onClick={() => setIsUploadModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpload}
              className="space-y-4"
            >
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) =>
                  setUploadTitle(e.target.value)
                }
                placeholder="Document title"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
              />

              <button
                type="submit"
                disabled={uploading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl disabled:opacity-50"
              >
                <Upload size={18} />
                {uploading
                  ? "Uploading..."
                  : "Upload Document"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900">
              Delete Document
            </h3>

            <p className="mt-3 text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {selectedDoc?.title}
              </span>
              ?
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;