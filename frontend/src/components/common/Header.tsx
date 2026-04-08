import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import styles from './Header.module.css'

interface MenuChild {
  label: string
  to: string
}

interface MenuItem {
  label: string
  to: string
  children: MenuChild[]
}

const menuItems: MenuItem[] = [
  {
    label: '\uadf8\ub8f9\uc18c\uac1c',
    to: '/about',
    children: [
      { label: '\uae30\uc5c5 \uc18c\uac1c', to: '/about' },
      { label: 'CEO \uc778\uc0ac\ub9d0', to: '/about/ceo' },
      { label: '\uae30\uc5c5 \uc5f0\ud601', to: '/about/history' },
    ],
  },
  {
    label: '\uc0ac\uc5c5\ubd84\uc57c',
    to: '/business',
    children: [
      { label: '\uc0ac\uc5c5 \ubaa9\ub85d', to: '/business' },
      { label: '\uc5d0\ub108\uc9c0 \uc194\ub8e8\uc158', to: '/business/1' },
      { label: '\ub514\uc9c0\ud138 \ud50c\ub7ab\ud3fc', to: '/business/3' },
    ],
  },
  {
    label: '\ub274\uc2a4\ub8f8',
    to: '/about/history',
    children: [
      { label: '\uc8fc\uc694 \uc5c5\ub370\uc774\ud2b8', to: '/about/history' },
      { label: '\ube0c\ub79c\ub4dc \uc2a4\ud1a0\ub9ac', to: '/about' },
      { label: '\uacf5\uc2dd \uc18c\uc2dd', to: '/about/ceo' },
    ],
  },
  {
    label: '\uc778\uc7ac\ucc44\uc6a9',
    to: '/admin',
    children: [
      { label: '\ucc44\uc6a9 \uc548\ub0b4', to: '/admin' },
      { label: '\uc870\uc9c1 \ubb38\ud654', to: '/about' },
      { label: '\ubcf5\ub9ac\ud6c4\uc0dd', to: '/about/ceo' },
    ],
  },
]

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32)

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerSolid : ''}`}>
      <div className={`${styles.inner} container`}>
        <Link className={styles.logo} data-testid="site-logo" to="/">
          <span className={styles.logoMark}>H</span>
          <span className={styles.logoText}>Hanwha Next</span>
        </Link>

        <button
          aria-expanded={menuOpen}
          aria-label={
            menuOpen ? '\uba54\ub274 \ub2eb\uae30' : '\uba54\ub274 \uc5f4\uae30'
          }
          className={styles.mobileToggle}
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <div className={styles.navItem} key={item.label}>
              <NavLink
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
              <div className={styles.dropdown}>
                <div className={styles.dropdownInner}>
                  <span className={styles.dropdownHeading}>{item.label}</span>
                  <div className={styles.dropdownLinks}>
                    {item.children.map((child) => (
                      <Link className={styles.dropdownItem} key={child.label} to={child.to}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div
        className={`${styles.mobileBackdrop} ${menuOpen ? styles.mobileBackdropVisible : ''}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ''}`}
      >
        <div className={styles.mobileHeader}>
          <strong>{'\uba54\ub274'}</strong>
          <button onClick={() => setMenuOpen(false)} type="button">
            {'\ub2eb\uae30'}
          </button>
        </div>
        <div className={styles.mobileMenu}>
          {menuItems.map((item) => (
            <div className={styles.mobileItem} key={item.label}>
              <NavLink
                className={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
                to={item.to}
              >
                {item.label}
              </NavLink>
              <div className={styles.mobileChildren}>
                {item.children.map((child) => (
                  <Link
                    key={child.label}
                    onClick={() => setMenuOpen(false)}
                    to={child.to}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </header>
  )
}

export default Header
