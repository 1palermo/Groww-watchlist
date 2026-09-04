export function ChangeScoreBadge({ score }: { score: number }) {
  const color = score >= 75 
    ? 'bg-red-500/20 text-red-400 border-red-500/30' 
    : score >= 50 
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
      : 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {score}
    </span>
  );
}
