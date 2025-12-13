function RenderField({ label, htmlFor, field }) {
  return (
    <div className={`flex flex-col items-stretch gap-1`}>
      <label htmlFor={htmlFor} className="block text-sm text-gray-600">
        {label}
      </label>
      {field}
    </div>
  );
}

export default RenderField;
