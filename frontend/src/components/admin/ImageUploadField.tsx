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
        <span className={styles.label}>{label}</span>
        {helper ? <span className={styles.helper}>{helper}</span> : null}
      </div>
      <div
        className={styles.preview}
        data-testid={testIdPrefix ? `${testIdPrefix}-preview` : undefined}
      >
        {value ? (
          <img
            alt={label}
            data-testid={testIdPrefix ? `${testIdPrefix}-image` : undefined}
            src={value}
          />
        ) : (
          <div className={styles.placeholder}>
            이미지를 업로드하면 여기에서 미리보기를 확인할 수 있습니다.
          </div>
        )}
      </div>
      <div className={styles.actions}>
        <button
          className={styles.button}
          data-testid={testIdPrefix ? `${testIdPrefix}-select-button` : undefined}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {uploading ? '업로드 중...' : '이미지 선택'}
        </button>
        {value ? (
          <button
            className={styles.secondaryButton}
            data-testid={testIdPrefix ? `${testIdPrefix}-clear-button` : undefined}
            onClick={onClear}
            type="button"
          >
            이미지 제거
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
