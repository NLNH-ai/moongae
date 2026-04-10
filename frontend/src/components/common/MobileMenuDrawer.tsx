import type { Ref } from 'react'
import { Link } from 'react-router-dom'
import type { HeaderMenuSection } from '../../types/navigation'
import styles from './Header.module.css'

interface MobileMenuDrawerProps {
  activeSectionId: string | null
  closeButtonRef: Ref<HTMLButtonElement>
  drawerRef: Ref<HTMLElement>
  expandedSectionId: string | null
  isOpen: boolean
  sections: HeaderMenuSection[]
  onClose: () => void
  onToggleSection: (sectionId: string) => void
}

function MobileMenuDrawer({
  activeSectionId,
  closeButtonRef,
  drawerRef,
  expandedSectionId,
  isOpen,
  sections,
  onClose,
  onToggleSection,
}: MobileMenuDrawerProps) {
  return (
    <>
      <div
        aria-hidden={!isOpen}
        className={styles.mobileBackdrop}
        data-open={isOpen}
        onClick={onClose}
      />
      <aside
        aria-label={'\ubaa8\ubc14\uc77c \uba54\ub274'}
        aria-modal="true"
        className={styles.mobileDrawer}
        data-open={isOpen}
        data-testid="mobile-menu-drawer"
        id="mobile-menu-drawer"
        ref={drawerRef}
        role="dialog"
      >
        <div className={styles.mobileDrawerHeader}>
          <strong>{'\uba54\ub274'}</strong>
          <button onClick={onClose} ref={closeButtonRef} type="button">
            {'\ub2eb\uae30'}
          </button>
        </div>

        <div className={styles.mobileLanguageRow}>
          <span className={styles.mobileLanguageChip}>KOR</span>
        </div>

        <div className={styles.mobileAccordion}>
          {sections.map((section) => {
            const isExpanded = expandedSectionId === section.id
            const isActive = activeSectionId === section.id

            return (
              <section
                className={styles.mobileSection}
                data-active={isActive}
                key={section.id}
              >
                <button
                  aria-controls={`mobile-section-panel-${section.id}`}
                  aria-expanded={isExpanded}
                  aria-label={`${section.label} \uc139\uc158 ${
                    isExpanded ? '\ub2eb\uae30' : '\uc5f4\uae30'
                  }`}
                  className={styles.mobileSectionTrigger}
                  onClick={() => onToggleSection(section.id)}
                  type="button"
                >
                  <span>{section.label}</span>
                  <span aria-hidden="true" className={styles.mobileSectionIcon}>
                    {isExpanded ? '-' : '+'}
                  </span>
                </button>

                <div
                  className={styles.mobileSectionBody}
                  hidden={!isExpanded}
                  id={`mobile-section-panel-${section.id}`}
                >
                  <Link className={styles.mobileOverviewLink} onClick={onClose} to={section.href}>
                    {section.label} {'\uc804\uccb4 \ubcf4\uae30'}
                  </Link>
                  {section.children.map((child) => (
                    <Link key={child.id} onClick={onClose} to={child.href}>
                      <strong>{child.label}</strong>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </aside>
    </>
  )
}

export default MobileMenuDrawer
