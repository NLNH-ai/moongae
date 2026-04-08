import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { clearAdminToken } from '../../utils/auth'
import styles from './AdminLayout.module.css'

interface AdminLayoutProps {
  title: string
  description?: string
  adminName?: string
  children: ReactNode
}

const menuItems = [
  { label: '\ub300\uc2dc\ubcf4\ub4dc', to: '/admin/dashboard' },
  { label: '\uc5f0\ud601\uad00\ub9ac', to: '/admin/history' },
  { label: '\uc0ac\uc5c5\ubd84\uc57c\uad00\ub9ac', to: '/admin/business' },
  { label: '\ucf58\ud150\uce20\uad00\ub9ac', to: '/admin/content' },
]

function AdminLayout({
  title,
  description,
  adminName,
  children,
}: AdminLayoutProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.logo}>Hanwha Next</p>
          <p className={styles.caption}>{'\uad00\ub9ac\uc790 \ucf58\uc194'}</p>
        </div>
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ''}`
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          className={styles.logout}
          onClick={() => {
            clearAdminToken()
            window.location.assign('/admin')
          }}
          type="button"
        >
          {'\ub85c\uadf8\uc544\uc6c3'}
        </button>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.pageLabel}>{'\uad00\ub9ac\uc790 \ud398\uc774\uc9c0'}</p>
            <h1 className={styles.title}>{title}</h1>
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          <div className={styles.profile}>
            <span>{adminName ?? '\ucd5c\uace0\uad00\ub9ac\uc790'}</span>
          </div>
        </header>
        <div className={styles.panel}>{children}</div>
      </div>
    </div>
  )
}

export default AdminLayout
