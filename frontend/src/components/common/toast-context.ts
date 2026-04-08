import { createContext, useContext } from 'react'

type ToastVariant = 'success' | 'error'

export interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
}

export interface ToastContextValue {
  showToast: (input: ToastInput) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
