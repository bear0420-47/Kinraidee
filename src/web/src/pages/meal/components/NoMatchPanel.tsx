import {
  suggestionMessage,
  type Suggestion,
} from '@/schemas/meal/recommendationSchemas'

type NoMatchPanelProps = {
  // The filter changes the API proved have results, or null when no menu is available.
  suggestion: Suggestion | null
}

// The summary already provides answer editing and the explicit suggestion retry.
export function NoMatchPanel({ suggestion }: NoMatchPanelProps) {
  return (
    <p
      role="status"
      className="rounded-sm border-2 border-dashed border-line-soft bg-cream p-4"
    >
      {suggestion
        ? suggestionMessage(suggestion)
        : 'ตอนนี้ยังไม่มีเมนูที่พร้อมแนะนำ กลับมาลองใหม่ทีหลังนะ'}
    </p>
  )
}
