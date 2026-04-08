import type { PageContentItem } from '../../types/domain'
import styles from './HeroSection.module.css'

interface HeroSectionProps {
  companyName?: string
  heroContent?: PageContentItem | null
}

const lineOne = '\uacbd\uacc4 \uc5c6\ub294 \ud601\uc2e0\uacfc'
const lineTwo = '\ud55c\uacc4 \uc5c6\ub294 \ub3c4\uc804\uc73c\ub85c'
const lineThree = '\uc0c8\ub85c\uc6b4 \uc5ed\uc0ac\ub97c \uc5f4\uc5b4\uac11\ub2c8\ub2e4.'
const fallbackDescription =
  '\uc9c0\uc18d \uac00\ub2a5\ud55c \uac00\uce58\uc640 \ubbf8\ub798 \uc0b0\uc5c5\uc744 \ud5a5\ud55c \uc2e4\ud589\ub825\uc73c\ub85c \ub354 \ub113\uc740 \uc138\uacc4\ub97c \uc5f0\uacb0\ud569\ub2c8\ub2e4.'

function splitText(text: string, offset: number) {
  return text.split('').map((character, index) => (
    <span
      className={styles.character}
      key={`${text}-${index}`}
      style={{ animationDelay: `${(offset + index) * 60}ms` }}
    >
      {character === ' ' ? '\u00A0' : character}
    </span>
  ))
}

function HeroSection({ companyName, heroContent }: HeroSectionProps) {
  return (
    <section className={styles.hero} data-testid="hero-section">
      <div className={`${styles.inner} container`}>
        <p className={styles.eyebrow}>
          {companyName ? `${companyName} Corporate Identity` : 'Corporate Identity'}
        </p>
        <h1 className={styles.title}>
          <span>{splitText(lineOne, 0)}</span>
          <span>{splitText(lineTwo, lineOne.length)}</span>
          <span className={styles.emphasis}>
            {splitText(lineThree, lineOne.length + lineTwo.length)}
          </span>
        </h1>
        <p className={styles.description}>
          {heroContent?.content ?? fallbackDescription}
        </p>
      </div>
      <div className={styles.scrollCue}>
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.arrow} />
      </div>
    </section>
  )
}

export default HeroSection
