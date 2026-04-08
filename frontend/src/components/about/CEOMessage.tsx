import { Link } from 'react-router-dom'
import styles from './CEOMessage.module.css'

interface CEOMessageProps {
  ceoName?: string
}

const quote =
  '\ubcc0\ud654\uc758 \uc18d\ub3c4\uac00 \ube60\ub97c\uc218\ub85d \uae30\uc5c5\uc740 \ub354 \uba85\ud655\ud55c \ubc29\ud5a5\uacfc \ub354 \ub2f4\ub300\ud55c \uc2e4\ud589\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.'

function CEOMessage({ ceoName }: CEOMessageProps) {
  return (
    <section className={styles.section}>
      <div aria-hidden="true" className={styles.quoteMark}>
        {'\u201C'}
      </div>
      <div className={styles.copy}>
        <span className="sectionEyebrow">Leadership</span>
        <h2 className={styles.title}>{'\ub300\ud45c \uba54\uc2dc\uc9c0'}</h2>
        <p className={styles.quote}>{quote}</p>
        <p className={styles.name}>
          {ceoName ?? '\uae40\ub3c4\ud604'} {'\ub300\ud45c\uc774\uc0ac'}
        </p>
        <Link className={styles.link} to="/about/ceo">
          {'CEO \uc778\uc0ac\ub9d0 \ubcf4\uae30'}
        </Link>
      </div>
    </section>
  )
}

export default CEOMessage
