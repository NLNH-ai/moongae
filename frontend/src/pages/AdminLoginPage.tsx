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
        <div className={styles.loginLayout}>
          <section className={styles.loginConsole}>
            <div className={styles.loginConsoleHeader}>
              <p className={styles.loginEyebrow}>Operations Access</p>
              <span className={styles.loginStatusPill}>Secure Workspace</span>
            </div>
            <h1 className={styles.loginTitle}>Content Operations Console</h1>
            <p className={styles.loginLead}>
              Sign in with an administrator account to manage history, business areas,
              and page content with publishing controls, asset review, and section-level
              visibility.
            </p>

            <div className={styles.loginConsoleGrid}>
              <article className={styles.loginInfoCard}>
                <span className={styles.metricLabel}>Workspace</span>
                <strong className={styles.loginInfoValue}>Preview</strong>
                <span className={styles.loginInfoMeta}>
                  GitHub Pages demo console with local CMS data.
                </span>
              </article>
              <article className={styles.loginInfoCard}>
                <span className={styles.metricLabel}>Security</span>
                <strong className={styles.loginInfoValue}>JWT</strong>
                <span className={styles.loginInfoMeta}>
                  Protected routes open only after a valid session token.
                </span>
              </article>
            </div>

            <ul className={styles.loginFeatureList}>
              <li className={styles.loginFeatureItem}>
                <strong className={styles.loginFeatureTitle}>Publishing control</strong>
                <span className={styles.loginFeatureCopy}>
                  Manage visibility, ordering, and content readiness from a single console.
                </span>
              </li>
              <li className={styles.loginFeatureItem}>
                <strong className={styles.loginFeatureTitle}>Asset workflow</strong>
                <span className={styles.loginFeatureCopy}>
                  Upload key visuals, icons, and section images with immediate preview.
                </span>
              </li>
              <li className={styles.loginFeatureItem}>
                <strong className={styles.loginFeatureTitle}>Section-level edits</strong>
                <span className={styles.loginFeatureCopy}>
                  Update each page block independently and keep unfinished work hidden.
                </span>
              </li>
            </ul>
          </section>

          <div className={styles.loginCard}>
            <div className={styles.loginFormHeader}>
              <p className={styles.loginEyebrow}>Admin Sign In</p>
              <h2 className={styles.loginFormTitle}>Authorize Workspace Access</h2>
              <p className={styles.loginFormLead}>
                Use the administrator account assigned to this environment.
              </p>
            </div>
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
            <div className={styles.loginFooterNote}>
              <span className={styles.loginFooterLabel}>Session policy</span>
              <p className={styles.helper}>
                Access opens after authentication and remains attached to the current
                workspace until the token expires or you sign out.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}

export default AdminLoginPage
