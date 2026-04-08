import styles from './QueryErrorState.module.css'

interface QueryErrorStateProps {
  title: string
  description: string
  onRetry: () => void
}

function QueryErrorState({
  title,
  description,
  onRetry,
}: QueryErrorStateProps) {
  return (
    <div className={styles.wrapper} role="alert">
      <p className={styles.eyebrow}>Data Error</p>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <button className={styles.button} onClick={onRetry} type="button">
        {'\ub2e4\uc2dc \uc2dc\ub3c4'}
      </button>
    </div>
  )
}

export default QueryErrorState
