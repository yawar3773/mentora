import { ExternalLink } from "lucide-react";
import { useOutletContext } from "react-router-dom";

const DocumentContent = () => {
  const { document } = useOutletContext();

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="flex justify-between items-center px-5 py-4 border-b">
        <h2 className="font-semibold text-lg">
          Document Viewer
        </h2>

        <a
          href={document.filePath}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ExternalLink size={18} />
          Open in new tab
        </a>
      </div>

      <div className="h-[80vh]">
        <iframe
          src={document.filePath}
          title={document.title}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default DocumentContent;