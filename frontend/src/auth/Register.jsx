import { useState, useEffect } from "react"; // <-- Added useEffect
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { FiLoader } from "react-icons/fi";
import Button from "../components/Button";
import InputField from "../components/InputField";
import PasswordField from "../components/PasswordField";

const PASSWORD_MIN_LENGTH = 8;
const REDIRECT_PATH_AFTER_REGISTER = "/app/home"; // The main application entry point

function Register() {
  const navigate = useNavigate();

  const { register, user, actionLoading, authError } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Check for existing login status ---
  useEffect(() => {
    if (user) {
      navigate(REDIRECT_PATH_AFTER_REGISTER, { replace: true });
    }
  }, [user]);

  // Monitor authError from context and set local error message
  useEffect(() => {
    if (authError) setErrorMessage(authError);
  }, [authError]);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Form Validation
  const handleValidation = () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setErrorMessage("All fields are required.");
      return false;
    }

    if (form.password.length < PASSWORD_MIN_LENGTH) {
      setErrorMessage(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`
      );
      return false;
    }

    if (!isValidEmail(form.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (form.password !== form.confirm_password) {
      setErrorMessage("Password and the Confirm Password do not match");
      return;
    }

    return true;
  };

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();

    if (!handleValidation()) {
      return;
    }
    await register(form);
  }

  return (
    // Outer container: Full viewport height, orange background, centered content
    <div className="min-h-screen bg-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Registration Card Container */}
      <div className="max-w-md w-full space-y-8 bg-white py-10 px-5 sm:px-12 rounded-lg shadow-2xl border border-orange-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-orange-900">
            Create Your Emotion Aware Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Authentication Error Display */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm text-center font-medium">
            {errorMessage}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Name Fields (Side-by-side on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="sr-only">
                First Name
              </label>
              <InputField
                name="first_name"
                placeholder="First Name"
                value={form.first_name}
                onChange={handleChange}
                className="px-3 py-3 w-full"
                autoComplete="given_name"
                isEditable={!actionLoading}
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="sr-only">
                Last Name
              </label>
              <InputField
                name="last_name"
                placeholder="Last Name"
                value={form.last_name}
                onChange={handleChange}
                className="px-3 py-3 w-full"
                autoComplete="family-name"
                isEditable={!actionLoading}
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <InputField
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
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
              placeholder={`Password (min ${PASSWORD_MIN_LENGTH} characters)`}
              onChange={handleChange}
              className="px-3 py-3"
              autoComplete="new-password"
              isEditable={!actionLoading}
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirm_password" className="sr-only">
              Confirm Password
            </label>
            <PasswordField
              name="confirm_password"
              value={form.confirm_password}
              placeholder={`Confirm Password`}
              onChange={handleChange}
              className="px-3 py-3"
              autoComplete="new-password"
              isEditable={!actionLoading}
            />
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
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
