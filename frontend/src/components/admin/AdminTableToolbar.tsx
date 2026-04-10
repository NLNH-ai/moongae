import type { ReactNode } from 'react'
import styles from './AdminTableToolbar.module.css'

export interface AdminTableToolbarControl {
  id: string
  label: string
  control: ReactNode
}

interface AdminTableToolbarProps {
  controls: AdminTableToolbarControl[]
  meta?: ReactNode
}

function AdminTableToolbar({ controls, meta }: AdminTableToolbarProps) {
  return (
    <div className={styles.root}>
      <div className={styles.filters}>
        {controls.map((item) => (
          <div className={styles.control} key={item.id}>
            <label className={styles.label} htmlFor={item.id}>
              {item.label}
            </label>
            {item.control}
          </div>
        ))}
      </div>
      {meta ? <div className={styles.meta}>{meta}</div> : null}
    </div>
  )
}

export default AdminTableToolbar
