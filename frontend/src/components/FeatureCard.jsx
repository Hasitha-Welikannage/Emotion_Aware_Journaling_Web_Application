function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 text-center transition duration-300 hover:shadow-2xl hover:border-orange-400 transform hover:-translate-y-1">
      <div className="flex justify-center mb-4">
        {/* Updated color to match the orange branding */}
        <Icon className="w-10 h-10 text-orange-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

export default FeatureCard;