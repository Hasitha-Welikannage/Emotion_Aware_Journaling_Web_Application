import { useState } from 'react';

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-orange-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="text-2xl font-semibold text-orange-700">
              Emotion <span className="text-orange-500">Aware</span>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-orange-700 hover:text-orange-500">Home</a>
            <a href="#" className="text-orange-700 hover:text-orange-500">Journal</a>
            <a href="#" className="text-orange-700 hover:text-orange-500">Resources</a>
            <a href="#" className="text-orange-700 hover:text-orange-500">Profile</a>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="p-2 rounded-md text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-4 bg-orange-50 transition-all">
          <a className="block py-2 text-orange-700 hover:text-orange-500" href="#">Home</a>
          <a className="block py-2 text-orange-700 hover:text-orange-500" href="#">Journal</a>
          <a className="block py-2 text-orange-700 hover:text-orange-500" href="#">Resources</a>
          <a className="block py-2 text-orange-700 hover:text-orange-500" href="#">Profile</a>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
