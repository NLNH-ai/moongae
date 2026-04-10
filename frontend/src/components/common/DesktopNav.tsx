import type { KeyboardEvent } from 'react'
import type { HeaderMenuSection } from '../../types/navigation'
import styles from './Header.module.css'

interface DesktopNavProps {
  activeSectionId: string | null
  openSectionId: string | null
  sections: HeaderMenuSection[]
  onOpen: (sectionId: string) => void
  onOpenAndFocusFirstItem: (sectionId: string) => void
  onToggle: (sectionId: string) => void
}

function DesktopNav({
  activeSectionId,
  openSectionId,
  sections,
  onOpen,
  onOpenAndFocusFirstItem,
  onToggle,
}: DesktopNavProps) {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    sectionId: string,
  ) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault()
      onOpenAndFocusFirstItem(sectionId)
    }
  }

  return (
    <nav aria-label={'\uc8fc\uc694 \uba54\ub274'} className={styles.primaryNav}>
      <ul className={styles.primaryList}>
        {sections.map((section) => {
          const isActive = activeSectionId === section.id
          const isOpen = openSectionId === section.id

          return (
            <li className={styles.primaryItem} key={section.id}>
              <button
                aria-controls="header-mega-menu"
                aria-expanded={isOpen}
                aria-haspopup="true"
                className={styles.primaryTrigger}
                data-active={isActive || isOpen}
                onClick={() => onToggle(section.id)}
                onFocus={() => onOpen(section.id)}
                onKeyDown={(event) => handleKeyDown(event, section.id)}
                onMouseEnter={() => onOpen(section.id)}
                type="button"
              >
                <span>{section.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default DesktopNav
