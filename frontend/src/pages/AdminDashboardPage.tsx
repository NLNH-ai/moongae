import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import {
  getAdminBusinessAreas,
  getAdminHistoryGroups,
  getAdminMe,
  getAdminPageContents,
} from '../api/admin'
import { publicQueryKeys } from '../api/queryKeys'
import AdminLayout from '../components/admin/AdminLayout'
import PageTransition from '../components/common/PageTransition'
import SectionSkeleton from '../components/common/SectionSkeleton'
import { formatKoreanDate, formatPageTitle } from '../utils/formatters'
import { flattenHistoryGroups } from '../utils/helpers'
import styles from './AdminScreens.module.css'

function AdminDashboardPage() {
  const adminQuery = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: getAdminMe,
  })

  const historyQuery = useQuery({
    queryKey: publicQueryKeys.history,
    queryFn: getAdminHistoryGroups,
  })

  const businessQuery = useQuery({
    queryKey: publicQueryKeys.business,
    queryFn: getAdminBusinessAreas,
  })

  const homeContentQuery = useQuery({
    queryKey: publicQueryKeys.pageContents('HOME'),
    queryFn: () => getAdminPageContents('HOME'),
  })

  const aboutContentQuery = useQuery({
    queryKey: publicQueryKeys.pageContents('ABOUT'),
    queryFn: () => getAdminPageContents('ABOUT'),
  })

  const businessContentQuery = useQuery({
    queryKey: publicQueryKeys.pageContents('BUSINESS'),
    queryFn: () => getAdminPageContents('BUSINESS'),
  })

  const contactContentQuery = useQuery({
    queryKey: publicQueryKeys.pageContents('CONTACT'),
    queryFn: () => getAdminPageContents('CONTACT'),
  })

  const historyEntries = flattenHistoryGroups(historyQuery.data ?? [])
  const businessItems = businessQuery.data ?? []
  const contentItems = [
    ...(homeContentQuery.data ?? []),
    ...(aboutContentQuery.data ?? []),
    ...(businessContentQuery.data ?? []),
    ...(contactContentQuery.data ?? []),
  ]

  const recentUpdates = [
    ...historyEntries.map((entry) => ({
      key: `history-${entry.id}`,
      title: entry.title,
      meta: `연혁 · ${entry.year}.${String(entry.month).padStart(2, '0')}`,
      updatedAt: entry.updatedAt,
    })),
    ...businessItems.map((item) => ({
      key: `business-${item.id}`,
      title: item.title,
      meta: '사업분야',
      updatedAt: item.updatedAt,
    })),
    ...contentItems.map((item) => ({
      key: `content-${item.id}`,
      title: item.title,
      meta: `${item.pageKey} · ${item.sectionKey}`,
      updatedAt: item.updatedAt,
    })),
  ]
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )
    .slice(0, 6)

  const latestUpdate = recentUpdates[0]?.updatedAt
  const isLoading =
    historyQuery.isLoading ||
    businessQuery.isLoading ||
    homeContentQuery.isLoading ||
    aboutContentQuery.isLoading ||
    businessContentQuery.isLoading ||
    contactContentQuery.isLoading

  return (
    <PageTransition>
      <Helmet>
        <title>{formatPageTitle('관리자 대시보드')}</title>
        <meta
          content="한화넥스트 관리자 대시보드에서 사이트 콘텐츠 현황을 요약해 확인할 수 있습니다."
          name="description"
        />
      </Helmet>
      <section className={styles.loginShell} style={{ minHeight: 'auto', paddingTop: '7rem' }}>
        <div className="container" style={{ width: 'var(--container-width)' }}>
          <AdminLayout
            adminName={adminQuery.data?.name}
            description="사이트 운영 현황과 최근 업데이트를 한 화면에서 확인합니다."
            title="대시보드"
          >
            {isLoading ? (
              <SectionSkeleton count={3} variant="cards" />
            ) : (
              <>
                <div className={styles.metrics}>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>History Count</span>
                    <strong className={styles.metricValue}>{historyEntries.length}</strong>
                    <span className={styles.metricMeta}>공개 중인 연혁 항목 수</span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Business Count</span>
                    <strong className={styles.metricValue}>{businessItems.length}</strong>
                    <span className={styles.metricMeta}>운영 중인 사업분야 항목 수</span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Last Update</span>
                    <strong className={styles.metricValue}>
                      {latestUpdate ? formatKoreanDate(latestUpdate) : 'N/A'}
                    </strong>
                    <span className={styles.metricMeta}>최근 수정 기준일</span>
                  </article>
                </div>

                <div className={styles.gridTwo}>
                  <section className={styles.surface}>
                    <div className={styles.sectionHeader}>
                      <div>
                        <h2 className={styles.sectionTitle}>최근 수정 내역</h2>
                        <p className={styles.sectionLead}>
                          연혁, 사업분야, 콘텐츠 기준 최신 항목을 표시합니다.
                        </p>
                      </div>
                    </div>
                    {recentUpdates.length > 0 ? (
                      <div className={styles.list}>
                        {recentUpdates.map((item) => (
                          <article className={styles.listItem} key={item.key}>
                            <div>
                              <span className={styles.itemTitle}>{item.title}</span>
                              <span className={styles.itemMeta}>{item.meta}</span>
                            </div>
                            <span className={styles.badgeMuted}>
                              {formatKoreanDate(item.updatedAt)}
                            </span>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>표시할 최근 수정 내역이 없습니다.</div>
                    )}
                  </section>

                  <section className={styles.surface}>
                    <div className={styles.sectionHeader}>
                      <div>
                        <h2 className={styles.sectionTitle}>운영 스냅샷</h2>
                        <p className={styles.sectionLead}>
                          관리자 계정과 현재 사이트 콘텐츠 볼륨을 요약합니다.
                        </p>
                      </div>
                    </div>
                    <div className={styles.list}>
                      <article className={styles.listItem}>
                        <div>
                          <span className={styles.itemTitle}>
                            {adminQuery.data?.name ?? '관리자'}
                          </span>
                          <span className={styles.itemMeta}>
                            {adminQuery.data?.role ?? 'SUPER_ADMIN'}
                          </span>
                        </div>
                        <span className={styles.badge}>ACTIVE</span>
                      </article>
                      <article className={styles.listItem}>
                        <div>
                          <span className={styles.itemTitle}>콘텐츠 섹션 수</span>
                          <span className={styles.itemMeta}>
                            HOME, ABOUT, BUSINESS, CONTACT
                          </span>
                        </div>
                        <span className={styles.badgeMuted}>{contentItems.length}</span>
                      </article>
                      <article className={styles.listItem}>
                        <div>
                          <span className={styles.itemTitle}>최근 로그인</span>
                          <span className={styles.itemMeta}>관리자 인증 기준</span>
                        </div>
                        <span className={styles.badgeMuted}>
                          {adminQuery.data?.lastLoginAt
                            ? formatKoreanDate(adminQuery.data.lastLoginAt)
                            : '기록 없음'}
                        </span>
                      </article>
                    </div>
                  </section>
                </div>
              </>
            )}
          </AdminLayout>
        </div>
      </section>
    </PageTransition>
  )
}

export default AdminDashboardPage
