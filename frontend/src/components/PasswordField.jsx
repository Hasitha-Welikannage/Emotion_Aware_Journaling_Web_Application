import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

function PasswordField({
  name,
  value,
  placeholder,
  onChange,
  autoComplete = "current-password",
  className = "",
  isEditable = true,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="relative">
      <input
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`block w-full text-sm placeholder:text-sm rounded-md py-2 px-3 border border-gray-300 focus:ring-orange-500 focus:border-orange-500 focus:outline-none pr-10 ${className}`}
        type={showPassword ? "text" : "password"}
        disabled={!isEditable}
        autoComplete={autoComplete}
      />
      {/* Password Toggle Button */}
      <button
        type="button"
        onClick={toggleShowPassword}
        className="absolute inset-y-0 right-0 px-2 flex justify-center items-center text-gray-400 hover:text-gray-600 border-l border-gray-300  cursor-pointer"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          // Eye icon (Visible)
          <FiEye />
        ) : (
          // Eye slash icon (Hidden)
          <FiEyeOff />
        )}
      </button>
    </div>
  );
}

export default PasswordField;
