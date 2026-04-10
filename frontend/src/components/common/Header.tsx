import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { headerMenuSections } from '../../config/header-menu'
import { getActiveHeaderSectionId, getDefaultHeaderSectionId } from '../../utils/headerNavigation'
import DesktopNav from './DesktopNav'
import HeaderBrand from './HeaderBrand'
import HeaderUtility from './HeaderUtility'
import MegaMenuPanel from './MegaMenuPanel'
import MobileMenuDrawer from './MobileMenuDrawer'
import styles from './Header.module.css'

function Header() {
  const location = useLocation()
  const headerRef = useRef<HTMLElement | null>(null)
  const mobileDrawerRef = useRef<HTMLElement | null>(null)
  const mobileCloseButtonRef = useRef<HTMLButtonElement | null>(null)
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null)
  const desktopFirstLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [scrolled, setScrolled] = useState(false)
  const [desktopOpenKey, setDesktopOpenKey] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedMobileKey, setExpandedMobileKey] = useState<string | null>(null)

  const activeSectionId = useMemo(
    () => getActiveHeaderSectionId(headerMenuSections, location.pathname),
    [location.pathname],
  )

  const isDesktopMenuOpen = Boolean(desktopOpenKey)

  const closeDesktopMenu = () => {
    setDesktopOpenKey(null)
  }

  const openDesktopSection = (sectionId: string) => {
    setDesktopOpenKey(sectionId)
  }

  const registerDesktopFirstLink = (
    sectionId: string,
    node: HTMLAnchorElement | null,
  ) => {
    desktopFirstLinkRefs.current[sectionId] = node
  }

  const openDesktopSectionAndFocusFirstItem = (sectionId: string) => {
    setDesktopOpenKey(sectionId)
    window.requestAnimationFrame(() => {
      desktopFirstLinkRefs.current[sectionId]?.focus()
    })
  }

  const toggleDesktopSection = (sectionId: string) => {
    setDesktopOpenKey((current) => (current === sectionId ? null : sectionId))
  }

  const closeMobileMenu = () => {
    setMobileOpen(false)
    setExpandedMobileKey(null)

    window.requestAnimationFrame(() => {
      mobileToggleRef.current?.focus()
    })
  }

  const toggleMobileMenu = () => {
    if (mobileOpen) {
      closeMobileMenu()
      return
    }

    setMobileOpen(true)
    setExpandedMobileKey(getDefaultHeaderSectionId(headerMenuSections, activeSectionId))
    closeDesktopMenu()
  }

  const toggleMobileSection = (sectionId: string) => {
    setExpandedMobileKey((current) => (current === sectionId ? null : sectionId))
  }

  const toggleDesktopOverview = () => {
    setDesktopOpenKey((current) =>
      current
        ? null
        : getDefaultHeaderSectionId(headerMenuSections, activeSectionId),
    )
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setMobileOpen(false)
        setExpandedMobileKey(null)
      } else {
        setDesktopOpenKey(null)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setDesktopOpenKey(null)
  }, [location.pathname])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (headerRef.current?.contains(event.target as Node)) {
        return
      }

      setDesktopOpenKey(null)
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  useEffect(() => {
    if (!mobileOpen) {
      return
    }

    const focusTarget = () => {
      mobileCloseButtonRef.current?.focus()
    }

    window.requestAnimationFrame(focusTarget)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = mobileDrawerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (!focusableElements || focusableElements.length === 0) {
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  return (
    <header
      className={styles.header}
      data-open={isDesktopMenuOpen}
      data-scrolled={scrolled}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') {
          return
        }

        closeDesktopMenu()

        if (mobileOpen) {
          closeMobileMenu()
        }
      }}
      onMouseLeave={() => {
        if (window.innerWidth < 960) {
          return
        }

        closeDesktopMenu()
      }}
      ref={headerRef}
    >
      <div className={styles.topBar}>
        <HeaderBrand />

        <div className={styles.desktopNavShell}>
          <DesktopNav
            activeSectionId={activeSectionId}
            onOpen={openDesktopSection}
            onOpenAndFocusFirstItem={openDesktopSectionAndFocusFirstItem}
            onToggle={toggleDesktopSection}
            openSectionId={desktopOpenKey}
            sections={headerMenuSections}
          />
        </div>

        <HeaderUtility
          isMenuOpen={isDesktopMenuOpen}
          onToggleMenu={toggleDesktopOverview}
        />

        <button
          aria-controls="mobile-menu-drawer"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? '\uba54\ub274 \ub2eb\uae30' : '\uba54\ub274 \uc5f4\uae30'}
          className={styles.mobileToggle}
          onClick={toggleMobileMenu}
          ref={mobileToggleRef}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <MegaMenuPanel
        activeSectionId={activeSectionId}
        isOpen={isDesktopMenuOpen}
        onSectionEnter={openDesktopSection}
        openSectionId={desktopOpenKey}
        registerFirstLinkRef={registerDesktopFirstLink}
        sections={headerMenuSections}
      />

      <MobileMenuDrawer
        activeSectionId={activeSectionId}
        closeButtonRef={mobileCloseButtonRef}
        drawerRef={mobileDrawerRef}
        expandedSectionId={expandedMobileKey}
        isOpen={mobileOpen}
        onClose={closeMobileMenu}
        onToggleSection={toggleMobileSection}
        sections={headerMenuSections}
      />
    </header>
  )
}

export default Header
