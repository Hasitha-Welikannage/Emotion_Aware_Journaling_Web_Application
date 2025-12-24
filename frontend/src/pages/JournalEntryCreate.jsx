import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJournalEntry } from "../services/journal.js";
import { FiLoader } from "react-icons/fi";
import Header from "../components/Header.jsx";
import Button from "../components/Button.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

function JournalEntryCreate() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  // Journal Entry Save
  const handleSave = async () => {
    setLoading(true);
    if (!title) {
      setError("You must enter the title to save.");
      setLoading(false);
      return;
    }
    if (!content) {
      setError("You must enter the journal entry content to save.");
      setLoading(false);
      return;
    }

    try {
      const response = await createJournalEntry({
        title: title,
        content: content,
      });
      if (response.success) {
        navigate(`/app/journals/view/${response.data.id}`);
      } else {
        setError(response.message || "Failed to create entry.");
      }
    } catch (err) {
      setError(`Error during save: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- LOADING AND ERROR STATES (Unchanged) ---
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

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header
          title="New Journal Entry"
          discription="Write about your thoughts and feelings."
          callToActionVisible={false}
        />
        {error && (
          <ErrorMessage error={error} closeAction={() => setError(null)} />
        )}
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
                onClick={() => navigate("/app/journals")}
                bgColor="bg-gray-200"
                hoverBgColor="hover:bg-gray-300"
                textColor="text-gray-600"
              >
                Cancel
              </Button>

              {/* Save Button (Primary Action) */}
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <FiLoader className="h-5 w-5 animate-spin text-white" />
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

export default JournalEntryCreate;
