import { useRef } from 'react'
import styles from './ImageUploadField.module.css'

interface ImageUploadFieldProps {
  label: string
  value: string | null
  helper?: string
  uploading?: boolean
  testIdPrefix?: string
  onSelect: (file: File) => void
  onClear: () => void
}

function ImageUploadField({
  helper,
  label,
  onClear,
  onSelect,
  testIdPrefix,
  uploading = false,
  value,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div
      className={styles.field}
      data-testid={testIdPrefix ? `${testIdPrefix}-field` : undefined}
    >
      <div className={styles.header}>
        <div className={styles.copy}>
          <span className={styles.label}>{label}</span>
          {helper ? <span className={styles.helper}>{helper}</span> : null}
        </div>
        <span className={`${styles.status} ${value ? styles.statusActive : ''}`}>
          {value ? 'Asset linked' : 'Awaiting upload'}
        </span>
      </div>

      <div
        className={styles.preview}
        data-testid={testIdPrefix ? `${testIdPrefix}-preview` : undefined}
      >
        {value ? (
          <div className={styles.previewFrame}>
            <img
              alt={label}
              data-testid={testIdPrefix ? `${testIdPrefix}-image` : undefined}
              src={value}
            />
          </div>
        ) : (
          <div className={styles.placeholder}>
            <strong className={styles.placeholderTitle}>No asset attached</strong>
            <span className={styles.placeholderCopy}>
              Upload an image to review the current visual in this workspace panel.
            </span>
          </div>
        )}
      </div>

      <div className={styles.metaRow}>
        <span className={styles.metaItem}>Accepted: png, jpg, gif, webp</span>
        <span className={styles.metaItem}>{value ? 'Preview ready' : 'No preview'}</span>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.button}
          data-testid={testIdPrefix ? `${testIdPrefix}-select-button` : undefined}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {uploading ? 'Uploading...' : 'Select image'}
        </button>
        {value ? (
          <button
            className={styles.secondaryButton}
            data-testid={testIdPrefix ? `${testIdPrefix}-clear-button` : undefined}
            onClick={onClear}
            type="button"
          >
            Remove image
          </button>
        ) : null}
      </div>

      <input
        accept="image/png,image/jpeg,image/gif,image/webp"
        className={styles.hiddenInput}
        data-testid={testIdPrefix ? `${testIdPrefix}-input` : undefined}
        onChange={(event) => {
          const file = event.target.files?.[0]

          if (file) {
            onSelect(file)
          }

          event.target.value = ''
        }}
        ref={inputRef}
        type="file"
      />
    </div>
  )
}

export default ImageUploadField
