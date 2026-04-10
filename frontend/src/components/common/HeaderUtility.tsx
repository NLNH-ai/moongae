import styles from './Header.module.css'

interface HeaderUtilityProps {
  isMenuOpen: boolean
  onToggleMenu: () => void
}

function HeaderUtility({ isMenuOpen, onToggleMenu }: HeaderUtilityProps) {
  return (
    <div className={styles.utilityArea}>
      <span className={styles.languageChip}>KOR</span>
      <button
        aria-controls="header-mega-menu"
        aria-expanded={isMenuOpen}
        aria-label={
          isMenuOpen
            ? '\uc804\uccb4 \uba54\ub274 \ub2eb\uae30'
            : '\uc804\uccb4 \uba54\ub274 \uc5f4\uae30'
        }
        className={styles.utilityMenuButton}
        onClick={onToggleMenu}
        type="button"
      >
        <span className={styles.utilityMenuIcon} aria-hidden="true">
          <span />
          <span />
        </span>
      </button>
    </div>
  )
}

export default HeaderUtility
