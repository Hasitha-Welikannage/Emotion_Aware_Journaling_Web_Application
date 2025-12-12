function Button({ onClick, children, className = "", disabled = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex justify-center items-center gap-2 py-2 px-4 rounded-sm shadow-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:opacity-50 cursor-pointer ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
