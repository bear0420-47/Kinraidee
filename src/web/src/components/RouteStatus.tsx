export function RouteStatus({
  message,
  isError = false,
}: {
  message: string
  isError?: boolean
}) {
  return (
    <p
      role={isError ? 'alert' : 'status'}
      className="mx-auto max-w-md p-6 text-center font-bold"
    >
      {message}
    </p>
  )
}
