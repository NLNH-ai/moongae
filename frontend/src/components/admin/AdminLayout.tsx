import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BRAND_NAME } from '../../config/branding'
import { clearAdminReturnPath, getAdminLoginRoute } from '../../utils/adminNavigation'
import { clearAdminToken } from '../../utils/auth'
import styles from './AdminLayout.module.css'

interface AdminLayoutProps {
  title: string
  description?: string
  adminName?: string
  children: ReactNode
}

const menuSections = [
  {
    label: '운영 개요',
    items: [
      {
        code: 'OV',
        label: '\ub300\uc2dc\ubcf4\ub4dc',
        meta: '\uc6b4\uc601 \ud604\ud669\uacfc \ucd5c\uadfc \uc5c5\ub370\uc774\ud2b8',
        to: '/admin/dashboard',
      },
    ],
  },
  {
    label: '콘텐츠 운영',
    items: [
      {
        code: 'HS',
        label: '\uc5f0\ud601\uad00\ub9ac',
        meta: '\uc5f0\ub3c4\ubcc4 \ud0c0\uc784\ub77c\uc778 \uad00\ub9ac',
        to: '/admin/history',
      },
      {
        code: 'BZ',
        label: '\uc0ac\uc5c5\ubd84\uc57c\uad00\ub9ac',
        meta: '\uc0ac\uc5c5 \ucf58\ud150\uce20\uc640 \ub9ac\uce58 \ud14d\uc2a4\ud2b8 \ud3b8\uc9d1',
        to: '/admin/business',
      },
      {
        code: 'CT',
        label: '\ucf58\ud150\uce20\uad00\ub9ac',
        meta: '\ud398\uc774\uc9c0 \uc139\uc158\uacfc \ube44\uc8fc\uc5bc \uad00\ub9ac',
        to: '/admin/content',
      },
    ],
  },
]

function AdminLayout({
  title,
  description,
  adminName,
  children,
}: AdminLayoutProps) {
  const navigate = useNavigate()
  const operatorName = adminName ?? '프리뷰 관리자'
  const operatorInitial = operatorName.trim().charAt(0).toUpperCase()

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brandBlock}>
          <span className={styles.environment}>프리뷰 작업공간</span>
          <p className={styles.logo}>{BRAND_NAME}</p>
          <p className={styles.caption}>{'\uad00\ub9ac\uc790 \ucf58\uc194'}</p>
        </div>

        <div className={styles.operatorCard}>
          <span className={styles.operatorAvatar}>{operatorInitial}</span>
          <div>
            <p className={styles.operatorName}>{operatorName}</p>
            <span className={styles.operatorStatus}>보안 세션 정상</span>
          </div>
        </div>

        <div className={styles.navGroups}>
          {menuSections.map((section) => (
            <div className={styles.navSection} key={section.label}>
              <p className={styles.navSectionLabel}>{section.label}</p>
              <nav className={styles.nav}>
                {section.items.map((item) => (
                  <NavLink
                    className={({ isActive }) =>
                      `${styles.link} ${isActive ? styles.linkActive : ''}`
                    }
                    key={item.to}
                    to={item.to}
                  >
                    <span className={styles.linkCode}>{item.code}</span>
                    <span className={styles.linkCopy}>
                      <strong className={styles.linkLabel}>{item.label}</strong>
                      <span className={styles.linkMeta}>{item.meta}</span>
                    </span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className={styles.sidebarFooter}>
          <button
            className={styles.logout}
            data-testid="admin-logout-button"
            onClick={() => {
              clearAdminToken()
              clearAdminReturnPath()
              navigate(getAdminLoginRoute(), { replace: true })
            }}
            type="button"
          >
            {'\ub85c\uadf8\uc544\uc6c3'}
          </button>
        </div>
      </aside>

      <div className={styles.workspace}>
        <div className={styles.topbar}>
          <div>
            <p className={styles.topbarLabel}>운영 작업공간</p>
            <p className={styles.breadcrumb}>
              {'\uad00\ub9ac\uc790 \ud398\uc774\uc9c0'}
              <span>/</span>
              {title}
            </p>
          </div>
          <div className={styles.topbarActions}>
            <span className={styles.topbarChip}>프리뷰 모드</span>
            <span className={styles.topbarChipMuted}>내부 콘솔</span>
          </div>
        </div>

        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.headerCopy}>
              <p className={styles.pageLabel}>{'\uad00\ub9ac\uc790 \ud398\uc774\uc9c0'}</p>
              <h1 className={styles.title}>{title}</h1>
              {description ? <p className={styles.description}>{description}</p> : null}
            </div>
            <div className={styles.profile}>
              <span className={styles.profileLabel}>운영자</span>
              <strong>{operatorName}</strong>
            </div>
          </header>
          <div className={styles.panel}>{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
