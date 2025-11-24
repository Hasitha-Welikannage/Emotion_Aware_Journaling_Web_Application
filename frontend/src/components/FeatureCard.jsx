function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 text-center transition duration-300 hover:shadow-xl hover:border-indigo-300">
      <div className="flex justify-center mb-4">
        <Icon className="w-10 h-10 text-indigo-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default FeatureCard;
