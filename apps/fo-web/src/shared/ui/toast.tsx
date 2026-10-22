import { useEffect, useState } from 'react'

const TOAST_MS = 2800

export const useToast = () => {
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [message])
  return { message, show: setMessage }
}

const Toast = ({ message }: { message: string | null }) => {
  if (!message) return null
  return (
    <p className="toast" role="status">
      {message}
    </p>
  )
}

export default Toast
