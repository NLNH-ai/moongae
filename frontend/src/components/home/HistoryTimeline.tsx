import { useScrollReveal } from '../../hooks/useScrollReveal'
import type { HistoryEntry, HistoryGroup } from '../../types/domain'
import { flattenHistoryGroups } from '../../utils/helpers'
import { formatMonth } from '../../utils/formatters'
import styles from './HistoryTimeline.module.css'

interface HistoryTimelineProps {
  groups: HistoryGroup[]
}

interface TimelineItemProps {
  entry: HistoryEntry
  reverse: boolean
}

const description =
  '\uae30\uc220\uacfc \uc2e4\ud589\ub825\uc73c\ub85c \ucd95\uc801\ud55c \ubcc0\ud654\uc758 \uc21c\uac04\ub4e4\uc744 \ud0c0\uc784\ub77c\uc778\uc73c\ub85c \uc815\ub9ac\ud588\uc2b5\ub2c8\ub2e4.'

function TimelineItem({ entry, reverse }: TimelineItemProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <article
      className={`${styles.item} ${reverse ? styles.reverse : ''} ${
        isVisible ? styles.visible : ''
      }`}
      ref={ref}
    >
      <div className={styles.yearWrap}>
        <span className={styles.year}>{entry.year}</span>
        <span className={styles.month}>{formatMonth(entry.month)}</span>
      </div>
      <div className={styles.card}>
        <div
          aria-hidden="true"
          className={styles.media}
          style={{
            backgroundImage: entry.imageUrl
              ? `linear-gradient(135deg, rgba(232, 93, 44, 0.85), rgba(26, 26, 26, 0.15)), url(${entry.imageUrl})`
              : undefined,
          }}
        >
          <span>ARCHIVE</span>
        </div>
        <div className={styles.copy}>
          <h3>{entry.title}</h3>
          <p>{entry.description}</p>
        </div>
      </div>
    </article>
  )
}

function HistoryTimeline({ groups }: HistoryTimelineProps) {
  const entries = flattenHistoryGroups(groups)

  return (
    <section className={styles.section}>
      <div className="container">
        <span className="sectionEyebrow">History</span>
        <h2 className="sectionTitle">{'\uc5f0\ud601'}</h2>
        <p className="sectionCopy">{description}</p>
        <div className={styles.timeline}>
          {entries.map((entry, index) => (
            <TimelineItem
              entry={entry}
              key={entry.id}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HistoryTimeline
