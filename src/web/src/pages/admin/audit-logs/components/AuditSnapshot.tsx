export function AuditSnapshot({
  label,
  value,
}: {
  label: string
  value: unknown
}) {
  return (
    <details className="rounded-sm border border-line-soft bg-canvas-soft p-2">
      <summary className="cursor-pointer font-bold">{label}</summary>
      <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words text-small">
        {value == null ? 'ไม่มีข้อมูล' : JSON.stringify(value, null, 2)}
      </pre>
    </details>
  )
}
