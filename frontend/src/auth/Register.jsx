import { useState, useEffect } from "react"; // <-- Added useEffect
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext"; 

// --- Constant for Validation ---
const PASSWORD_MIN_LENGTH = 8;
const REDIRECT_PATH_AFTER_REGISTER = "/app"; // The main application entry point

// --- Initial Form State ---
const initialFormState = { 
    first_name: "",
    last_name: "",
    email: "", 
    password: "" 
};

export default function Register() {
  const { register, error: authError, user } = useAuth(); // <-- Destructure 'user'
  const navigate = useNavigate();

  // --- State Management ---
  const [form, setForm] = useState(initialFormState);
  const [clientError, setClientError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NEW: Check for existing login status ---
  useEffect(() => {
    // If the user object is present in the AuthContext, redirect them immediately
    // to the main application area.
    if (user) {
        navigate(REDIRECT_PATH_AFTER_REGISTER, { replace: true });
    }
  }, [user, navigate]); // Reruns if 'user' status changes

  // --- Handlers ---
  const handleChange = (e) => {
      setClientError(""); 
      setForm({
          ...form,
          [e.target.name]: e.target.value
      });
  };

  const handleValidation = () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
        setClientError("All fields are required.");
        return false;
    }
    
    if (form.password.length < PASSWORD_MIN_LENGTH) {
        setClientError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`);
        return false;
    }
    
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setClientError("");

    if (!handleValidation()) {
        return; 
    }
    
    setIsSubmitting(true);
    
    try {
        const ok = await register(form);

        if (ok) {
            // Success: navigate to the main application area
            navigate(REDIRECT_PATH_AFTER_REGISTER);
        } // Auth error handling is done by the displayError variable below

    } catch (err) {
        setClientError("An unexpected error occurred during registration.");
    } finally {
        setIsSubmitting(false);
    }
  }

  const displayError = clientError || authError;


  return (
    // Outer container: Full viewport height, orange background, centered content
    <div className="min-h-screen bg-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Registration Card Container */}
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl border border-orange-100">
        
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-orange-900">
            Create Your Emotion Aware Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
        
        {/* Authentication Error Display */}
        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm text-center font-medium">
            {displayError}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          {/* Name Fields (Side-by-side on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="sr-only">First Name</label>
              <input
                id="firstName"
                name="first_name"
                type="text"
                required
                placeholder="First Name"
                value={form.first_name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="sr-only">Last Name</label>
              <input
                id="lastName"
                name="last_name"
                type="text"
                required
                placeholder="Last Name"
                value={form.last_name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Password Input */}
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder={`Password (min ${PASSWORD_MIN_LENGTH} characters)`}
              value={form.password}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              disabled={isSubmitting}
            />
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
                    Creating Account...
                 </span>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}