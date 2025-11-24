import { Link } from 'react-router-dom';
import { HiOutlineSparkles, HiOutlineBookOpen, HiOutlineLockClosed } from 'react-icons/hi';
import FeatureCard from '../components/FeatureCard';

// This is the page that appears on the root path `/`
function LandingPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <header className="text-center py-12">
                <h1 className="text-6xl font-extrabold text-gray-900 leading-tight mb-4">
                    Your Personal Thought Sanctuary
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                    Capture your ideas, track your progress, and reflect on your journey with our distraction-free digital journal.
                </p>
                <Link 
                    to="/app/" // Link directly to the app layout (simulating "Start Journaling" after login)
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-xl text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                >
                    Start Journaling Now →
                </Link>
            </header>

            <section className="w-full max-w-5xl py-12">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Features You'll Love</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <FeatureCard 
                        icon={HiOutlineBookOpen} 
                        title="Seamless Organization" 
                        description="Access all your entries instantly with powerful search and simple tagging."
                    />
                    <FeatureCard 
                        icon={HiOutlineSparkles} 
                        title="Reflective Prompts" 
                        description="Get inspired daily with unique prompts designed to deepen your introspection."
                    />
                    <FeatureCard 
                        icon={HiOutlineLockClosed} 
                        title="Private & Secure" 
                        description="Your thoughts are safe. We use secure data practices to keep your journal private."
                    />
                </div>
            </section>
        </div>
    );
}

export default LandingPage;