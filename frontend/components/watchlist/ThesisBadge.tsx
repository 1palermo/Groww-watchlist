import { THESIS_CATEGORY_LABELS, type ThesisCategory } from '@/lib/types';

export function ThesisBadge({ category }: { category: ThesisCategory }) {
  return (
    <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
      {THESIS_CATEGORY_LABELS[category] || category}
    </span>
  );
}
