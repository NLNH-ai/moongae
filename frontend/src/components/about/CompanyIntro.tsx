import type { CompanyProfile, PageContentItem } from '../../types/domain'
import { BRAND_NAME, resolveBrandName } from '../../config/branding'
import { formatKoreanDate } from '../../utils/formatters'
import styles from './CompanyIntro.module.css'

interface CompanyIntroProps {
  company?: CompanyProfile
  introContent?: PageContentItem | null
}

const fallbackBody =
  'A temporary company introduction placeholder that can be replaced with your official brand story later.'

function CompanyIntro({ company, introContent }: CompanyIntroProps) {
  return (
    <section className={styles.section}>
      <div className={styles.copyBlock}>
        <span className="sectionEyebrow">Introduction</span>
        <h2 className={styles.title}>
          {introContent?.title ?? '\uae30\uc5c5 \uc18c\uac1c'}
        </h2>
        <p className={styles.description}>
          {introContent?.content ?? company?.description ?? fallbackBody}
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>{'\ud68c\uc0ac\uba85'}</dt>
            <dd>{resolveBrandName(company?.companyName ?? BRAND_NAME)}</dd>
          </div>
          <div>
            <dt>{'\ub300\ud45c\uc790'}</dt>
            <dd>{company?.ceoName ?? '\uae40\ub3c4\ud604'}</dd>
          </div>
          <div>
            <dt>{'\uc124\ub9bd\uc77c'}</dt>
            <dd>
              {company?.establishedDate
                ? formatKoreanDate(company.establishedDate)
                : '1998\ub144 4\uc6d4 8\uc77c'}
            </dd>
          </div>
          <div>
            <dt>{'\ubcf8\uc0ac'}</dt>
            <dd>{company?.address ?? '\uc11c\uc6b8 \uc911\uad6c \uc138\uc885\ub300\ub85c 110'}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.visual}>
        <div className={styles.visualCard}>
          <span>{'\ubbf8\ub798 \uc0b0\uc5c5 \ud50c\ub7ab\ud3fc'}</span>
          <strong>01</strong>
        </div>
        <div className={styles.visualCardAlt}>
          <span>{'\ud1b5\ud569 \uc6b4\uc601 \uccb4\uacc4'}</span>
          <strong>02</strong>
        </div>
      </div>
    </section>
  )
}

export default CompanyIntro
