import { useEffect, useState } from "react";
import {
  Outlet,
  Link,
  useParams,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";

const tabs = [
  {
    label: "Content",
    path: "content",
  },
  {
    label: "Chat",
    path: "chat",
  },
  {
    label: "AI Actions",
    path: "ai-actions",
  },
  {
    label: "Flashcards",
    path: "flashcards",
  },
  {
    label: "Quizzes",
    path: "quizzes",
  },
];

const DocumentLayout = () => {
  const { id } = useParams();
  const location = useLocation();

  const [document, setDocument] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);

      const response =
        await documentService.getDocumentsById(
          id
        );

      setDocument(
        response?.data || response
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spinner />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        Document not found
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4"
      >
        <ArrowLeft size={18} />
        Back to Documents
      </Link>

      <h1 className="text-3xl font-bold mb-6">
        {document.title}
      </h1>

      <div className="border-b mb-6">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const isActive =
              location.pathname.includes(
                `/${tab.path}`
              );

            return (
              <Link
                key={tab.path}
                to={`/documents/${id}/${tab.path}`}
                className={`pb-4 font-medium transition-all ${
                  isActive
                    ? "text-emerald-600 border-b-2 border-emerald-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <Outlet
        context={{
          document,
          documentId: document._id,
        }}
      />
    </div>
  );
};

export default DocumentLayout;