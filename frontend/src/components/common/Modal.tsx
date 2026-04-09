import { useEffect, type ReactNode } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  size?: 'default' | 'large'
}

function Modal({
  open,
  title,
  description,
  children,
  onClose,
  size = 'default',
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  return (
    <div
      aria-modal="true"
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
    >
      <div
        className={`${styles.dialog} ${size === 'large' ? styles.large : ''}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.topStripe} />
        <header className={styles.header}>
          <div>
            <div className={styles.headerMeta}>
              <p className={styles.eyebrow}>Workspace Sheet</p>
              <span className={styles.sheetType}>
                {size === 'large' ? 'Expanded Editor' : 'Standard Editor'}
              </span>
            </div>
            <h2 className={styles.title}>{title}</h2>
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          <button
            aria-label="Close modal"
            className={styles.close}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
