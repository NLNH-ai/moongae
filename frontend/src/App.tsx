import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/admin/PrivateRoute'
import Footer from './components/common/Footer'
import Header from './components/common/Header'
import RouteFallback from './components/common/RouteFallback'
import ScrollToTop from './components/common/ScrollToTop'
import styles from './App.module.css'

const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const CEOPage = lazy(() => import('./pages/CEOPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const BusinessPage = lazy(() => import('./pages/BusinessPage'))
const BusinessDetailPage = lazy(() => import('./pages/BusinessDetailPage'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const AdminHistoryPage = lazy(() => import('./pages/AdminHistoryPage'))
const AdminBusinessPage = lazy(() => import('./pages/AdminBusinessPage'))
const AdminContentPage = lazy(() => import('./pages/AdminContentPage'))

function SuspendedPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

function PublicLayout() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<SuspendedPage><HomePage /></SuspendedPage>} />
          <Route path="/about" element={<SuspendedPage><AboutPage /></SuspendedPage>} />
          <Route path="/about/ceo" element={<SuspendedPage><CEOPage /></SuspendedPage>} />
          <Route path="/about/history" element={<SuspendedPage><HistoryPage /></SuspendedPage>} />
          <Route path="/business" element={<SuspendedPage><BusinessPage /></SuspendedPage>} />
          <Route path="/business/:id" element={<SuspendedPage><BusinessDetailPage /></SuspendedPage>} />
        </Route>

        <Route path="/admin" element={<SuspendedPage><AdminLoginPage /></SuspendedPage>} />

        <Route element={<PrivateRoute />}>
          <Route path="/admin/dashboard" element={<SuspendedPage><AdminDashboardPage /></SuspendedPage>} />
          <Route path="/admin/history" element={<SuspendedPage><AdminHistoryPage /></SuspendedPage>} />
          <Route path="/admin/business" element={<SuspendedPage><AdminBusinessPage /></SuspendedPage>} />
          <Route path="/admin/content" element={<SuspendedPage><AdminContentPage /></SuspendedPage>} />
        </Route>

        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </>
  )
}

export default App
