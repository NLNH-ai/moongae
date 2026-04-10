import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import {
  getAdminBusinessAreas,
  getAdminHistoryGroups,
  getAdminMe,
  getAdminPageContents,
} from '../api/admin'
import { adminQueryKeys } from '../api/queryKeys'
import AdminLayout from '../components/admin/AdminLayout'
import PageTransition from '../components/common/PageTransition'
import SectionSkeleton from '../components/common/SectionSkeleton'
import { formatKoreanDate, formatPageTitle } from '../utils/formatters'
import { flattenHistoryGroups } from '../utils/helpers'
import styles from './AdminScreens.module.css'

function getPercentLabel(activeCount: number, totalCount: number) {
  if (totalCount === 0) {
    return '0%'
  }

  return `${Math.round((activeCount / totalCount) * 100)}%`
}

function formatRoleLabel(role?: string) {
  if (!role) {
    return '최고 관리자'
  }

  return role === 'SUPER_ADMIN' ? '최고 관리자' : '일반 관리자'
}

function AdminDashboardPage() {
  const adminQuery = useQuery({
    queryKey: adminQueryKeys.me,
    queryFn: getAdminMe,
  })

  const historyQuery = useQuery({
    queryKey: adminQueryKeys.history({ page: 0, size: 100 }),
    queryFn: () => getAdminHistoryGroups({ page: 0, size: 100 }),
  })

  const businessQuery = useQuery({
    queryKey: adminQueryKeys.business({ page: 0, size: 100 }),
    queryFn: () => getAdminBusinessAreas({ page: 0, size: 100 }),
  })

  const homeContentQuery = useQuery({
    queryKey: adminQueryKeys.pageContents({ pageKey: 'HOME', page: 0, size: 100 }),
    queryFn: () => getAdminPageContents('HOME', { page: 0, size: 100 }),
  })

  const aboutContentQuery = useQuery({
    queryKey: adminQueryKeys.pageContents({ pageKey: 'ABOUT', page: 0, size: 100 }),
    queryFn: () => getAdminPageContents('ABOUT', { page: 0, size: 100 }),
  })

  const businessContentQuery = useQuery({
    queryKey: adminQueryKeys.pageContents({ pageKey: 'BUSINESS', page: 0, size: 100 }),
    queryFn: () => getAdminPageContents('BUSINESS', { page: 0, size: 100 }),
  })

  const contactContentQuery = useQuery({
    queryKey: adminQueryKeys.pageContents({ pageKey: 'CONTACT', page: 0, size: 100 }),
    queryFn: () => getAdminPageContents('CONTACT', { page: 0, size: 100 }),
  })

  const historyEntries = flattenHistoryGroups(historyQuery.data ?? [])
  const businessItems = businessQuery.data?.items ?? []
  const contentItems = [
    ...(homeContentQuery.data?.items ?? []),
    ...(aboutContentQuery.data?.items ?? []),
    ...(businessContentQuery.data?.items ?? []),
    ...(contactContentQuery.data?.items ?? []),
  ]

  const activeHistoryCount = historyEntries.filter((entry) => entry.isActive).length
  const activeBusinessCount = businessItems.filter((item) => item.isActive).length
  const activeContentCount = contentItems.filter((item) => item.isActive).length

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
    .slice(0, 7)

  const latestUpdate = recentUpdates[0]?.updatedAt
  const systemRows = [
    {
      label: '운영 계정',
      value: adminQuery.data?.name ?? '프리뷰 관리자',
      meta: formatRoleLabel(adminQuery.data?.role),
    },
    {
      label: '활성 콘텐츠 섹션',
      value: `${activeContentCount}/${contentItems.length}`,
      meta: 'HOME, ABOUT, BUSINESS, CONTACT',
    },
    {
      label: '최근 로그인',
      value: adminQuery.data?.lastLoginAt
        ? formatKoreanDate(adminQuery.data.lastLoginAt)
        : '기록 없음',
      meta: '관리자 인증 기준',
    },
  ]

  const healthRows = [
    {
      label: '연혁 공개율',
      value: getPercentLabel(activeHistoryCount, historyEntries.length),
      meta: `${activeHistoryCount} / ${historyEntries.length}개 공개`,
    },
    {
      label: '사업 운영율',
      value: getPercentLabel(activeBusinessCount, businessItems.length),
      meta: `${activeBusinessCount} / ${businessItems.length}개 공개`,
    },
    {
      label: '섹션 게시율',
      value: getPercentLabel(activeContentCount, contentItems.length),
      meta: `${activeContentCount} / ${contentItems.length}개 게시`,
    },
  ]

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
          content="관리자 대시보드에서 사이트 운영 현황, 최근 업데이트, 게시 상태를 한 화면에서 확인합니다."
          name="description"
        />
      </Helmet>
      <section className={styles.loginShell} style={{ minHeight: 'auto', paddingTop: '7rem' }}>
        <div className={styles.adminViewport}>
          <AdminLayout
            adminName={adminQuery.data?.name}
            description="콘텐츠 운영 현황과 최근 업데이트, 게시 상태를 운영자 관점에서 빠르게 확인할 수 있는 화면입니다."
            title="대시보드"
          >
            {isLoading ? (
              <SectionSkeleton count={4} variant="cards" />
            ) : (
              <>
                <div className={styles.metrics}>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>연혁 항목</span>
                    <strong className={styles.metricValue}>{historyEntries.length}</strong>
                    <span className={styles.metricMeta}>
                      공개 {activeHistoryCount}건 · 최근 수정{' '}
                      {latestUpdate ? formatKoreanDate(latestUpdate) : '없음'}
                    </span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>사업분야</span>
                    <strong className={styles.metricValue}>{businessItems.length}</strong>
                    <span className={styles.metricMeta}>
                      운영 {activeBusinessCount}건 · 설명과 대표 이미지 포함
                    </span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>페이지 섹션</span>
                    <strong className={styles.metricValue}>{contentItems.length}</strong>
                    <span className={styles.metricMeta}>
                      게시 {activeContentCount}건 · 페이지별 섹션 관리
                    </span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>게시 상태</span>
                    <strong className={styles.metricValue}>
                      {getPercentLabel(
                        activeHistoryCount + activeBusinessCount + activeContentCount,
                        historyEntries.length + businessItems.length + contentItems.length,
                      )}
                    </strong>
                    <span className={styles.metricMeta}>
                      전체 운영 자산 기준 공개 상태 비율
                    </span>
                  </article>
                </div>

                <div className={styles.dashboardGrid}>
                  <section className={`${styles.surface} ${styles.activityPanel}`}>
                    <div className={styles.sectionHeader}>
                      <div>
                        <h2 className={styles.sectionTitle}>최근 수정 내역</h2>
                        <p className={styles.sectionLead}>
                          연혁, 사업분야, 콘텐츠 기준 최신 변경 항목을 시간순으로 정리합니다.
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
                      <div className={styles.emptyState}>
                        아직 표시할 최근 수정 내역이 없습니다.
                      </div>
                    )}
                  </section>

                  <div className={styles.stackPanels}>
                    <section className={styles.surface}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h2 className={styles.sectionTitle}>운영 스냅샷</h2>
                          <p className={styles.sectionLead}>
                            운영 계정, 섹션 볼륨, 최근 로그인 정보를 빠르게 확인합니다.
                          </p>
                        </div>
                      </div>

                      <div className={styles.statusGrid}>
                        {systemRows.map((row) => (
                          <article className={styles.statusRow} key={row.label}>
                            <div>
                              <span className={styles.itemTitle}>{row.label}</span>
                              <span className={styles.itemMeta}>{row.meta}</span>
                            </div>
                            <strong className={styles.statusValue}>{row.value}</strong>
                          </article>
                        ))}
                      </div>
                    </section>

                    <section className={styles.surface}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h2 className={styles.sectionTitle}>게시 상태</h2>
                          <p className={styles.sectionLead}>
                            각 관리 영역의 공개율과 운영 상태를 기준 수치로 보여줍니다.
                          </p>
                        </div>
                      </div>

                      <div className={styles.statusGrid}>
                        {healthRows.map((row) => (
                          <article className={styles.statusRow} key={row.label}>
                            <div>
                              <span className={styles.itemTitle}>{row.label}</span>
                              <span className={styles.itemMeta}>{row.meta}</span>
                            </div>
                            <strong className={styles.statusValue}>{row.value}</strong>
                          </article>
                        ))}
                      </div>
                    </section>
                  </div>
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
