import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiLock,
  FiPieChart, // New icon for Analysis feature
} from "react-icons/fi";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";

// --- Component: Header Navigation ---
const HeaderNav = () => (
  <nav className="fixed top-0 left-0 right-0 z-10 bg-orange-50/50 backdrop-blur-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <Link to="/" className="text-2xl font-bold text-orange-600">
          <span className="text-gray-900">Emotion </span>Aware
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="text-gray-600 hover:text-orange-600 transition duration-150 font-medium"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-orange-600 hover:bg-orange-700 shadow-md transition duration-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  </nav>
);

// This is the page that appears on the root path `/`
function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <HeaderNav />

      {/* --- 1. Hero Section (Stronger Branding, Focus on AI) --- */}
      <header className="grow flex items-center justify-center bg-orange-50/50 py-15 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">
            Digital Journaling, Evolved
          </p>
          <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            Understand Your Day,{" "}
            <span className="text-orange-600">Analyze Your Feelings.</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
            Beyond simple writing, Emotion Aware uses AI to instantly analyze
            your entries, revealing the dominant emotions and key insights
            hiding in your thoughts.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-full shadow-2xl text-white bg-orange-600 hover:bg-orange-700 transition duration-300 transform hover:scale-105"
          >
            Start Your Journal →
          </Link>
        </div>
      </header>

      {/* --- 2. Features Section (Highlighting AI Analysis) --- */}
      <section className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Tools for Deeper Reflection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* NEW: Prominent AI Analysis Feature */}
          <FeatureCard
            icon={FiPieChart}
            title="Instant Emotion Analysis"
            description="Identify dominant feelings—like Joy, Anxiety, or Contempt—with AI scoring after every entry."
          />

          <FeatureCard
            icon={FiBookOpen}
            title="Distraction-Free Writing"
            description="A clean, minimalist interface designed for focus, letting your thoughts flow freely."
          />
          <FeatureCard
            icon={FiLock}
            title="Private & Secure"
            description="Your deepest thoughts are protected with state-of-the-art encryption and secure storage."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
