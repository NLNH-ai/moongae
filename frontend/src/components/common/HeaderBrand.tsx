import { Link } from 'react-router-dom'
import { BRAND_NAME } from '../../config/branding'
import styles from './Header.module.css'

function HeaderBrand() {
  return (
    <Link className={styles.logo} data-testid="site-logo" to="/">
      <span aria-hidden="true" className={styles.logoMark}>
        <span className={styles.logoCore} />
        <span className={styles.logoAccent} />
      </span>
      <span className={styles.logoText}>{BRAND_NAME}</span>
    </Link>
  )
}

export default HeaderBrand
