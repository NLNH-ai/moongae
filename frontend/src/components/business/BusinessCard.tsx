import { Link } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import type { BusinessAreaItem } from '../../types/domain'
import { trimText } from '../../utils/helpers'
import styles from './BusinessCard.module.css'

interface BusinessCardProps {
  businessArea: BusinessAreaItem
}

function BusinessCard({ businessArea }: BusinessCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLAnchorElement>()

  return (
    <Link
      className={`${styles.card} ${isVisible ? styles.visible : ''}`}
      data-testid={`business-card-${businessArea.id}`}
      ref={ref}
      to={`/business/${businessArea.id}`}
    >
      <span className={styles.icon}>{businessArea.title.slice(0, 1)}</span>
      <h3>{businessArea.title}</h3>
      <p>{trimText(businessArea.subtitle || businessArea.description, 64)}</p>
      <span className={styles.more}>{'\uc790\uc138\ud788 \ubcf4\uae30'}</span>
    </Link>
  )
}

export default BusinessCard
