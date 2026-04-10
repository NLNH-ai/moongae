import { Link } from 'react-router-dom'
import type { HeaderMenuSection } from '../../types/navigation'
import styles from './Header.module.css'

interface MegaMenuPanelProps {
  activeSectionId: string | null
  isOpen: boolean
  openSectionId: string | null
  sections: HeaderMenuSection[]
  onSectionEnter: (sectionId: string) => void
  registerFirstLinkRef: (sectionId: string, node: HTMLAnchorElement | null) => void
}

function MegaMenuPanel({
  activeSectionId,
  isOpen,
  openSectionId,
  sections,
  onSectionEnter,
  registerFirstLinkRef,
}: MegaMenuPanelProps) {
  return (
    <div
      aria-hidden={!isOpen}
      aria-label={'\uc804\uccb4 \uba54\ub274'}
      className={styles.megaShell}
      data-open={isOpen}
      data-testid="desktop-mega-menu"
      id="header-mega-menu"
      role="region"
    >
      <div className={styles.megaPanel}>
        <div className={styles.megaGrid}>
          {sections.map((section, index) => {
            const isHighlighted = openSectionId === section.id
            const isActive = activeSectionId === section.id

            return (
              <section
                className={styles.megaColumn}
                data-active={isHighlighted || isActive}
                id={`header-mega-section-${section.id}`}
                key={section.id}
                onMouseEnter={() => onSectionEnter(section.id)}
              >
                <span className={styles.megaIndex}>{String(index + 1).padStart(2, '0')}</span>
                <Link className={styles.megaSectionLink} to={section.href}>
                  {section.label}
                </Link>
                <div className={styles.megaLinks}>
                  {section.children.map((child, childIndex) => (
                    <Link
                      className={styles.megaItem}
                      key={child.id}
                      ref={
                        childIndex === 0
                          ? (node) => registerFirstLinkRef(section.id, node)
                          : undefined
                      }
                      to={child.href}
                    >
                      <strong>{child.label}</strong>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MegaMenuPanel
