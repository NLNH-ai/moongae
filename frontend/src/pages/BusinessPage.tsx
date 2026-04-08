import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { publicQueryKeys } from '../api/queryKeys'
import { getBusinessAreas, getPageSection } from '../api/public'
import PageTransition from '../components/common/PageTransition'
import QueryErrorState from '../components/common/QueryErrorState'
import SectionSkeleton from '../components/common/SectionSkeleton'
import { formatPageTitle } from '../utils/formatters'
import { trimText } from '../utils/helpers'
import shellStyles from './Subpage.module.css'
import styles from './BusinessPage.module.css'

function BusinessPage() {
  const businessQuery = useQuery({
    queryKey: publicQueryKeys.business,
    queryFn: getBusinessAreas,
  })

  const overviewQuery = useQuery({
    queryKey: publicQueryKeys.pageSection('BUSINESS', 'overview'),
    queryFn: () => getPageSection('BUSINESS', 'overview'),
  })

  const items = businessQuery.data ?? []

  return (
    <PageTransition>
      <Helmet>
        <title>{formatPageTitle('사업분야')}</title>
        <meta
          content="한화넥스트의 핵심 사업분야와 통합 운영 역량을 확인할 수 있는 사업분야 페이지입니다."
          name="description"
        />
      </Helmet>
      <section className={shellStyles.page}>
        <div className="container">
          <div className={shellStyles.hero}>
            <div className={shellStyles.heroContent}>
              <span className={shellStyles.eyebrow}>Business</span>
              <h1 className={shellStyles.title}>
                {overviewQuery.data?.title ?? '산업의 다음 단계를 만드는 핵심 사업'}
              </h1>
              <p className={shellStyles.lead}>
                {overviewQuery.data?.content ??
                  '각 사업군은 독립적으로 경쟁력을 갖추면서도, 고객에게는 하나의 통합 솔루션처럼 연결됩니다.'}
              </p>
            </div>
          </div>

          <div className={shellStyles.section}>
            {businessQuery.isLoading ? (
              <SectionSkeleton count={3} variant="cards" />
            ) : businessQuery.isError ? (
              <QueryErrorState
                description="사업분야 데이터를 가져오는 중 문제가 발생했습니다."
                onRetry={() => businessQuery.refetch()}
                title="사업분야 목록을 불러오지 못했습니다."
              />
            ) : (
              <div className={shellStyles.stack}>
                <div className={styles.grid}>
                  {items.map((item, index) => (
                    <Link className={styles.featureCard} key={item.id} to={`/business/${item.id}`}>
                      <div
                        className={styles.featureBackdrop}
                        style={{
                          backgroundImage: item.imageUrl
                            ? `linear-gradient(135deg, rgba(232, 93, 44, 0.3), rgba(15, 15, 15, 0.35)), url(${item.imageUrl})`
                            : undefined,
                        }}
                      />
                      <div className={styles.featureOverlay} />
                      <div className={styles.featureContent}>
                        <span className={styles.featureLabel}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3>{item.title}</h3>
                        <p>{trimText(item.subtitle || item.description, 92)}</p>
                        <span className={styles.featureLink}>상세 보기</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className={styles.metricStrip}>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Portfolio</span>
                    <strong className={styles.metricValue}>{items.length} Areas</strong>
                    <p className={styles.metricCopy}>
                      고객의 에너지 전환, 제조 혁신, 디지털 운영을 하나의
                      사업 포트폴리오로 제공합니다.
                    </p>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Delivery</span>
                    <strong className={styles.metricValue}>End-to-End</strong>
                    <p className={styles.metricCopy}>
                      전략 수립부터 운영 안정화까지 각 사업군이 하나의 실행
                      체계로 연결됩니다.
                    </p>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Capability</span>
                    <strong className={styles.metricValue}>Integrated Ops</strong>
                    <p className={styles.metricCopy}>
                      현장 기술, 데이터, 서비스 운영 경험을 결합해 산업 현장의
                      실제 성과를 만듭니다.
                    </p>
                  </article>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}

export default BusinessPage
