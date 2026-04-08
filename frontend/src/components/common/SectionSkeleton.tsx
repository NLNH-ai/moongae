import styles from './SectionSkeleton.module.css'

interface SectionSkeletonProps {
  variant: 'hero' | 'timeline' | 'cards'
  count?: number
}

function SectionSkeleton({
  variant,
  count = variant === 'cards' ? 3 : 4,
}: SectionSkeletonProps) {
  if (variant === 'hero') {
    return (
      <div className={styles.hero}>
        <span className={styles.shimmer} />
        <span className={styles.shimmerLine} />
        <span className={styles.shimmerLineWide} />
        <span className={styles.shimmerBody} />
      </div>
    )
  }

  return (
    <div
      className={variant === 'timeline' ? styles.timelineGrid : styles.cardGrid}
      role="status"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          className={
            variant === 'timeline' ? styles.timelineCard : styles.businessCard
          }
          key={`${variant}-${index}`}
        >
          <span className={styles.shimmer} />
          <span className={styles.shimmerLineWide} />
          <span className={styles.shimmerBody} />
        </div>
      ))}
    </div>
  )
}

export default SectionSkeleton
