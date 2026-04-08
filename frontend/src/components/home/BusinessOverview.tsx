import type { BusinessAreaItem } from '../../types/domain'
import BusinessCard from '../business/BusinessCard'
import styles from './BusinessOverview.module.css'

interface BusinessOverviewProps {
  items: BusinessAreaItem[]
}

const description =
  '\uc720\uae30\uc801\uc73c\ub85c \uc5f0\uacb0\ub41c \uc0ac\uc5c5 \uad6c\uc870\ub85c \uace0\uac1d\uc758 \uc6b4\uc601 \ubb38\uc81c\ub97c \ub354 \ub113\uac8c \ud574\uacb0\ud569\ub2c8\ub2e4.'

function BusinessOverview({ items }: BusinessOverviewProps) {
  return (
    <section className={styles.section}>
      <div className="container">
        <span className="sectionEyebrow">Business</span>
        <h2 className="sectionTitle">{'\uc0ac\uc5c5\ubd84\uc57c'}</h2>
        <p className="sectionCopy">{description}</p>
        <div className={styles.grid}>
          {items.map((item) => (
            <BusinessCard businessArea={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default BusinessOverview
