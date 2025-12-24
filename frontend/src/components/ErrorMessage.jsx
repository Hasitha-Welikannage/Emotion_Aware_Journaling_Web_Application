import { FiAlertTriangle, FiX } from "react-icons/fi";

function ErrorMessage({ error, closeAction }) {
  return (
    <div className="mb-6 flex items-center gap-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md shadow-sm">
      {/* Icon */}
      <FiAlertTriangle className="shrink-0 h-5 w-5 text-red-600" />

      {/* Message */}
      <div className="flex-1">
        <p className="text-sm font-bold text-red-800 uppercase tracking-tight">
          Action Failed
        </p>
        <p className="text-sm text-red-700">{error}</p>
      </div>

      {/* Close */}
      <button
        onClick={closeAction}
        className="shrink-0 text-red-400 hover:text-red-600 cursor-pointer"
      >
        <FiX className="h-5 w-5" />
      </button>
    </div>
  );
}

export default ErrorMessage;
