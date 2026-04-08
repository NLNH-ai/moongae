import axios from 'axios'
import { useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate, useNavigate } from 'react-router-dom'
import { loginAdmin } from '../api/admin'
import PageTransition from '../components/common/PageTransition'
import { isDemoMode } from '../config/runtime'
import { hasAdminToken, setAdminToken } from '../utils/auth'
import styles from './AdminScreens.module.css'

function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (hasAdminToken()) {
    return <Navigate replace to="/admin/dashboard" />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    if (isDemoMode) {
      setError('Admin login is disabled in the GitHub Pages preview build.')
      setSubmitting(false)
      return
    }

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
        <title>Admin Login | Hanwha Next</title>
        <meta content="Hanwha Next admin login page." name="description" />
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
              GitHub Pages preview uses demo data for public pages only. Admin APIs are
              disabled in this build.
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
