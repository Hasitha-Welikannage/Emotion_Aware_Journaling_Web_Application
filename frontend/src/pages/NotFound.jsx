import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiHome } from "react-icons/fi";

function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="py-20 min-h-screen bg-orange-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className=" p-8 md:p-12 text-center">
          <FiAlertCircle className="h-20 w-20 mx-auto mb-6 text-red-500" />

          <h1 className="text-8xl font-extrabold text-gray-900 mb-4">404</h1>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>

          <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
            We're sorry, but the journal entry or resource you are looking for
            could not be located. It might have been deleted or the URL is
            incorrect.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-6 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiArrowLeft className="h-5 w-5" />
              Go Back
            </button>

            <button
              onClick={() => navigate("/app/home")}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-8 rounded-md shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiHome className="h-5 w-5" />
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
