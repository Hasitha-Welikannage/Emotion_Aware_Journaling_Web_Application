import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// Assuming you have a file at '../auth/AuthContext'
import { useAuth } from "../auth/AuthContext"; 

export default function Register() {
  const { register, error } = useAuth();
  // State updated to include first_name and last_name
  const [form, setForm] = useState({ 
    firstName: "",
    lastName: "",
    email: "", 
    password: "" 
  });
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Basic validation check
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
        // You would typically set a state error message here
        return; 
    }
    
    // Note: If your backend expects snake_case, you might need to map:
    // const payload = { first_name: form.firstName, last_name: form.lastName, email: form.email, password: form.password };
    
    const ok = await register(form);

    if (ok) navigate("/dashboard");
  }

  const handleChange = (e) => {
      setForm({
          ...form,
          [e.target.name]: e.target.value
      });
  };

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
            {/* Link to Login page */}
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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm text-center font-medium">
            {error}
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
                name="firstName"
                type="text"
                required
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="sr-only">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
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
              placeholder="Password (min 8 characters)"
              value={form.password}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}