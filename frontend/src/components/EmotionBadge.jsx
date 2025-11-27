function EmotionBadge({ emotion, score }) {
  const getColor = (e) => {
    switch (e.toLowerCase()) {
      case 'joy': return 'bg-green-100 text-green-800 border-green-200';
      case 'sadness': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'anger': return 'bg-red-100 text-red-800 border-red-200';
      case 'fear': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColor(emotion)}`}>
      {emotion} {score}%
    </span>
  );
}

export default EmotionBadge;