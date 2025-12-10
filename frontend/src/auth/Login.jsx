import { useState, useEffect } from "react"; // Added useEffect
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login, user } = useAuth(); // Destructure 'user' from useAuth
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state
  
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after login. Default to '/app'.
  const REDIRECT_PATH = location.state?.from?.pathname || "/app";

  // --- Effect 1: Check for existing login status ---
  useEffect(() => {
    // If the user object exists in the AuthContext, redirect them immediately.
    if (user) {
      navigate(REDIRECT_PATH, { replace: true });
    }
  }, [user, navigate, REDIRECT_PATH]); // Dependency array ensures it runs when user status changes

  // --- Handlers ---
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await login(form);
      if (response.success) {
        // The useEffect above will handle the navigation to REDIRECT_PATH
        // because setting the user in the context will trigger the effect.
        // However, we can navigate explicitly here for immediate feedback:
        navigate(REDIRECT_PATH, { replace: true });
      } else {
        setErrorMessage(response.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
        setErrorMessage("A network error occurred during login.");
    } finally {
        setIsSubmitting(false);
    }
  }

  // --- Render ---
  return (
    // Outer container: Full viewport height, orange background, centered content
    <div className="min-h-screen bg-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Login Card Container */}
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-2xl border border-orange-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-orange-900">
            Sign in to Emotion Aware
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Authentication Error Display */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm text-center font-medium">
            {errorMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col justify-between gap-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:bg-orange-400 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                 <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                 </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}