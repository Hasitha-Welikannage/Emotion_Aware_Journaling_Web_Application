import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";
import Button from "./Button";

function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { logout, actionLoading } = useAuth();

  const navLists = [
    { name: "Home", href: "/app/home" },
    { name: "Journals", href: "/app/journals" },
    { name: "Emotion History", href: "/app/emotion-history" },
    { name: "Profile", href: "/app/profile" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-orange-50/50 shadow-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="text-2xl font-semibold text-orange-700">
              Emotion <span className="text-orange-500">Aware</span>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLists.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-orange-700 hover:text-orange-500 transition duration-150"
              >
                {item.name}
              </Link>
            ))}
            {/* 5. Use the consolidated handler */}
            <Button onClick={handleLogout} className="text-sm font-normal">
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <FiLoader className="h-5 w-5 animate-spin text-white" />
                  logging out...
                </span>
              ) : (
                "Logout"
              )}
            </Button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="p-2 rounded-md text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
            >
              {open ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-4  transition-all border-t border-orange-100">
          {navLists.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="block text-center py-2 text-orange-700 hover:text-orange-500"
              onClick={() => setOpen(false)} // Close menu on link click
            >
              {item.name}
            </Link>
          ))}
          {/* 6. Use the consolidated handler */}
          <Button onClick={handleLogout} className=" w-full ">
            {actionLoading ? (
              <span className="flex items-center gap-2">
                <FiLoader className="h-5 w-5 animate-spin text-white" />
                logging out...
              </span>
            ) : (
              "Logout"
            )}
          </Button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
