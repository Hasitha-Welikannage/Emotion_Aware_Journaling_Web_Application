import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
// Assuming you have a file at '../auth/AuthContext'
import { useAuth } from "../auth/AuthContext"; 

export default function Login() {
  const { login, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/app"; // Changed from '/dashboard' to '/' for simplicity if needed, but keeping your original path logic

  async function handleSubmit(e) {
    e.preventDefault();
    // Basic form validation check (optional, but good practice)
    if (!form.email || !form.password) {
        // You could set a local error state here if needed
        return; 
    }
    
    const ok = await login(form);

    if (ok) navigate(from, { replace: true });
  }

  return (
    // Outer container: Full viewport height, orange background, centered content
    <div className="min-h-screen bg-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Login Card Container */}
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl border border-orange-100">
        
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-orange-900">
            Sign in to Emotion Aware
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link 
              to="/register" 
              className="font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        {/* Authentication Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email Input */}
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
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
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}