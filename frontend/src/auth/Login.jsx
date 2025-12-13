import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { FiLoader } from "react-icons/fi";
import Button from "../components/Button";
import InputField from "../components/InputField";
import PasswordField from "../components/PasswordField";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, user, actionLoading, authError } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  // Determine where to redirect after login. Default to '/app'.
  const REDIRECT_PATH = location.state?.from?.pathname || "/app/home";

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Check for existing login status
  useEffect(() => {
    // If the user object exists in the AuthContext, redirect them immediately.
    if (user) navigate(REDIRECT_PATH, { replace: true });
  }, [user]);

  // Monitor authError from context and set local error message
  useEffect(() => {
    if (authError) setErrorMessage(authError);
  }, [authError]);

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    if (!isValidEmail(form.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setErrorMessage("");
    await login(form);
  }

  return (
    // Outer container: Full viewport height, orange background, centered content
    <div className="min-h-screen bg-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Login Card Container */}
      <div className="max-w-md w-full space-y-8 bg-white py-10 px-5 sm:px-12 rounded-lg shadow-2xl border border-orange-100">
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
              <InputField
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="px-3 py-3 w-full"
                autoComplete="email"
                isEditable={!actionLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <PasswordField
                name="password"
                value={form.password}
                placeholder="Password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="px-3 py-3"
                isEditable={!actionLoading}
              />
            </div>
          </div>

          <div className="mt-7">
            <Button
              type="submit"
              className="w-full py-3 px-4"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <FiLoader className="h-5 w-5 animate-spin text-white" />
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
