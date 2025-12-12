function InputField({
  name,
  value,
  placeholder,
  onChange,
  className = "",
  isEditable = true,
  type = "text",
}) {
  return (
    <input
      id={name}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className={`block sm:text-sm placeholder:text-sm rounded-md py-2 px-3 border border-gray-300 focus:ring-orange-500 focus:border-orange-500 focus:outline-none disabled:bg-gray-100 ${className}`}
      type={type}
      disabled={!isEditable}
    />
  );
}

export default InputField;
