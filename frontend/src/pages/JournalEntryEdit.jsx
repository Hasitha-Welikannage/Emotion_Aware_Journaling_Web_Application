import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
} from "../services/journal.js";
import { FiLoader, FiAlertTriangle } from "react-icons/fi";
import Header from "../components/Header.jsx";
import Button from "../components/Button.jsx";

function JournalEntryEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Data Fetching Effect
  useEffect(() => {
    const fetchEntry = async () => {
      setLoading(true);
      try {
        const response = await getJournalEntryById(id);
        if (response.success && response.data) {
          const entry = response.data;
          setTitle(entry.title);
          setContent(entry.content);
          setInitialContent(entry.content);
        } else {
          setError(response.message || "Failed to fetch entry.");
        }
      } catch (err) {
        setError("Failed to load journal entry.");
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, []);

  // Journal Entry Save
  const handleSave = async () => {
    setLoading(true);
    setIsSaving(true);
    const payload = {
      title,
      content: initialContent === content ? null : content,
    };
    try {
      const response = await updateJournalEntry(id, payload);
      if (response.success) {
        setInitialContent(content);
        navigate(`/app/journals/view/${response.data.id}`);
      } else {
        setError(response.message || "Failed to update entry.");
      }
    } catch (err) {
      setError(`Error during save: ${err.message}`);
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  // Journal Entry Delete
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this journal entry? This action cannot be undone."
      )
    )
      return;

    setLoading(true);
    try {
      const response = await deleteJournalEntry(id);
      if (response.success) {
        navigate(`/app/journals`);
      } else {
        setError(response.message || "Failed to delete entry.");
      }
    } catch (err) {
      setError("Failed to delete journal entry.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOADING AND ERROR STATES ---
  if (loading) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-lg border border-gray-100">
            <FiLoader className="h-8 w-8 animate-spin mx-auto text-orange-500" />
            <p className="mt-3 font-medium">Fetching journal entry...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-10 text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <FiAlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <p className="font-medium">Error: {error}</p>
            <button
              onClick={() => navigate("/app/home")}
              className="mt-4 text-sm text-red-700 underline hover:text-red-900 cursor-pointer"
            >
              Go to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header
          title="Edit Journal Entry"
          discription="Update your thoughts and feelings."
          callToActionVisible={false}
        />
        {/* Title Input Area */}
        <div className="flex flex-col justify-between items-stretch mb-6 gap-4">
          <div className="bg-gray-50 rounded-md shadow-md border border-gray-200 p-5">
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your entry a title..."
              className="w-full text-2xl font-semibold focus:outline-none text-gray-600 bg-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className={`flex flex-col`}>
            <div className="bg-gray-50 rounded-md shadow-md border border-gray-200">
              <textarea
                id="content"
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today? Write your entry here..."
                rows={15}
                className="w-full text-gray-700 resize-none focus:outline-none p-5 text-base text-justify leading-relaxed rounded-md"
                style={{ minHeight: "500px" }}
              />
            </div>
            <div className="flex flex-col justify-end items-stretch gap-3 md:flex-row mt-7">
              {/* Cancel Button */}
              <Button
                onClick={() => navigate(`/app/journals/view/${id}`)}
                bgColor="bg-gray-200"
                hoverBgColor="hover:bg-gray-300"
                textColor="text-gray-600"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                bgColor="bg-red-100"
                hoverBgColor="hover:bg-red-200"
                textColor="text-red-700"
                disabled={isSaving}
              >
                Delete
              </Button>

              {/* Save Button (Primary Action) */}
              <Button onClick={handleSave} disabled={loading}>
                {isSaving ? (
                  <>
                    <FiLoader className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save & Analyze</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JournalEntryEdit;
