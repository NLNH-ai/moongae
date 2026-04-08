import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import styles from './ToastProvider.module.css'
import { ToastContext, type ToastInput } from './toast-context'

interface ToastItem extends ToastInput {
  id: string
}

function ToastEntry({
  description,
  id,
  onDismiss,
  title,
  variant = 'success',
}: ToastItem & { onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismiss(id)
    }, 3500)

    return () => window.clearTimeout(timeoutId)
  }, [id, onDismiss])

  return (
    <div className={`${styles.toast} ${styles[variant]}`}>
      <span className={styles.title}>{title}</span>
      {description ? <span className={styles.description}>{description}</span> : null}
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = ({ description, title, variant = 'success' }: ToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    setToasts((current) => [...current, { description, id, title, variant }])
  }

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.viewport}>
        {toasts.map((toast) => (
          <ToastEntry key={toast.id} onDismiss={dismissToast} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
