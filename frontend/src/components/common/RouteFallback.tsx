import styles from './RouteFallback.module.css'
import SectionSkeleton from './SectionSkeleton'

function RouteFallback() {
  return (
    <div className={`${styles.shell} container`} data-testid="route-fallback">
      <div className={styles.hero}>
        <SectionSkeleton variant="hero" />
      </div>
      <div className={styles.section}>
        <SectionSkeleton count={2} variant="cards" />
      </div>
    </div>
  )
}

export default RouteFallback
