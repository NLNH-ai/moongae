import { useQuery } from '@tanstack/react-query'
import { publicQueryKeys } from '../../api/queryKeys'
import { getCompanyProfile } from '../../api/public'
import { resolveBrandEmail, resolveBrandName } from '../../config/branding'
import styles from './Footer.module.css'

const fallbackAddress =
  '\uc11c\uc6b8\ud2b9\ubcc4\uc2dc \uc911\uad6c \uc138\uc885\ub300\ub85c 110'

function Footer() {
  const { data } = useQuery({
    queryKey: publicQueryKeys.company,
    queryFn: getCompanyProfile,
    staleTime: 1000 * 60 * 5,
  })

  const companyName = resolveBrandName(data?.companyName)
  const address = data?.address ?? fallbackAddress
  const phone = data?.phone ?? '02-1234-5678'
  const email = resolveBrandEmail(data?.email)

  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        <div>
          <p className={styles.brand}>{companyName}</p>
          <p className={styles.copy}>
            {address}
            <br />
            Tel. {phone}
            <br />
            Email. {email}
          </p>
        </div>
        <div>
          <p className={styles.heading}>{'\ube60\ub978 \ub9c1\ud06c'}</p>
          <div className={styles.links}>
            <a href="/about">{'\uadf8\ub8f9\uc18c\uac1c'}</a>
            <a href="/business">{'\uc0ac\uc5c5\ubd84\uc57c'}</a>
            <a href="/admin">{'\uad00\ub9ac\uc790'}</a>
          </div>
        </div>
        <div>
          <p className={styles.heading}>Follow</p>
          <div className={styles.links}>
            <a href="https://www.linkedin.com" rel="noreferrer" target="_blank">
              LinkedIn
            </a>
            <a href="https://www.youtube.com" rel="noreferrer" target="_blank">
              YouTube
            </a>
            <a href="https://www.instagram.com" rel="noreferrer" target="_blank">
              Instagram
            </a>
          </div>
        </div>
      </div>
      <div className={`${styles.bottom} container`}>
        © 2026 {companyName}. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
