import type { ReactNode } from 'react'
import styles from './PageTransition.module.css'

interface PageTransitionProps {
  children: ReactNode
}

function PageTransition({ children }: PageTransitionProps) {
  return <div className={styles.enter}>{children}</div>
}

export default PageTransition
