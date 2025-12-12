function Button({
  onClick,
  children,
  type = "button",
  className = "",
  bgColor = "bg-orange-600",
  textColor = "text-white",
  hoverBgColor = "hover:bg-orange-700",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`flex justify-center items-center gap-2 py-2 px-4 rounded-sm shadow-sm font-semibold ${textColor} ${bgColor} ${hoverBgColor} transition-colors disabled:opacity-50 cursor-pointer ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
