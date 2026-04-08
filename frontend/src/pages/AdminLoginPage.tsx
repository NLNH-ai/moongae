import axios from 'axios'
import { useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate, useNavigate } from 'react-router-dom'
import { DEMO_ADMIN_CREDENTIALS, loginAdmin } from '../api/admin'
import PageTransition from '../components/common/PageTransition'
import { BRAND_NAME } from '../config/branding'
import { isDemoMode } from '../config/runtime'
import { hasAdminToken, setAdminToken } from '../utils/auth'
import styles from './AdminScreens.module.css'

function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState(
    isDemoMode ? DEMO_ADMIN_CREDENTIALS.username : '',
  )
  const [password, setPassword] = useState(
    isDemoMode ? DEMO_ADMIN_CREDENTIALS.password : '',
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (hasAdminToken()) {
    return <Navigate replace to="/admin/dashboard" />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await loginAdmin({
        username,
        password,
      })

      setAdminToken(response.accessToken)
      navigate('/admin/dashboard', { replace: true })
    } catch (submitError) {
      if (axios.isAxiosError(submitError)) {
        setError(
          submitError.response?.data?.message ??
            'Login failed. Check the account credentials and try again.',
        )
      } else if (submitError instanceof Error) {
        setError(submitError.message)
      } else {
        setError('A problem occurred while logging in.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <Helmet>
        <title>{`Admin Login | ${BRAND_NAME}`}</title>
        <meta content={`${BRAND_NAME} admin login page.`} name="description" />
      </Helmet>
      <section className={styles.loginShell}>
        <div className={styles.loginCard}>
          <p className={styles.loginEyebrow}>Admin Access</p>
          <h1 className={styles.loginTitle}>Content Operations Console</h1>
          <p className={styles.loginLead}>
            Sign in with an administrator account to manage history, business areas,
            and page content.
          </p>
          {isDemoMode ? (
            <div className={styles.helper}>
              Preview login is enabled with demo data. Use{' '}
              {DEMO_ADMIN_CREDENTIALS.username} / {DEMO_ADMIN_CREDENTIALS.password}.
            </div>
          ) : null}
          <form
            className={styles.loginForm}
            data-testid="admin-login-form"
            onSubmit={handleSubmit}
          >
            <div className={styles.field}>
              <label htmlFor="username">Username</label>
              <input
                autoComplete="username"
                data-testid="admin-username"
                id="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="superadmin"
                required
                value={username}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input
                autoComplete="current-password"
                data-testid="admin-password"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                required
                type="password"
                value={password}
              />
            </div>
            {error ? <div className={styles.error}>{error}</div> : null}
            <button
              className={styles.primaryButton}
              data-testid="admin-login-button"
              disabled={submitting}
              type="submit"
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <p className={styles.helper}>
            JWT authentication is applied and protected routes open after a successful
            sign-in.
          </p>
        </div>
      </section>
    </PageTransition>
  )
}

export default AdminLoginPage
