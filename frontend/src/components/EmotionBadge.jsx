function EmotionBadge({ emotion, score }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-orange-100 text-orange-800 border-orange-200`}>
      {emotion} {score}%
    </span>
  );
}

export default EmotionBadge;