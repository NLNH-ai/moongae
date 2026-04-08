import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { publicQueryKeys } from '../api/queryKeys'
import { getCompanyProfile } from '../api/public'
import PageTransition from '../components/common/PageTransition'
import QueryErrorState from '../components/common/QueryErrorState'
import SectionSkeleton from '../components/common/SectionSkeleton'
import { formatKoreanDate, formatPageTitle } from '../utils/formatters'
import styles from './Subpage.module.css'

const commitments = [
  {
    label: 'Commitment 01',
    value: '고객 현장에서 답을 찾는 실행력',
  },
  {
    label: 'Commitment 02',
    value: '장기 성장과 단기 성과의 균형',
  },
  {
    label: 'Commitment 03',
    value: '변화 속도를 따라잡는 조직 문화',
  },
]

function CEOPage() {
  const companyQuery = useQuery({
    queryKey: publicQueryKeys.company,
    queryFn: getCompanyProfile,
    staleTime: 1000 * 60 * 5,
  })

  const company = companyQuery.data

  return (
    <PageTransition>
      <Helmet>
        <title>{formatPageTitle('CEO 인사말')}</title>
        <meta
          content="한화넥스트 CEO 인사말과 기업의 운영 철학, 리더십 방향을 소개합니다."
          name="description"
        />
      </Helmet>
      <section className={styles.page}>
        <div className="container">
          <div className={styles.hero}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>Leadership</span>
              <h1 className={styles.title}>변화의 속도보다 빠른 실행으로</h1>
              <p className={styles.lead}>
                시장의 변곡점마다 방향을 명확히 하고 끝까지 실행하는 것이
                한화넥스트가 고객과 시장에 약속하는 리더십입니다.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            {companyQuery.isLoading ? (
              <SectionSkeleton variant="hero" />
            ) : companyQuery.isError ? (
              <QueryErrorState
                description="CEO 인사말 페이지 데이터를 불러오는 중 문제가 발생했습니다."
                onRetry={() => companyQuery.refetch()}
                title="CEO 페이지를 불러오지 못했습니다."
              />
            ) : (
              <div className={styles.stack}>
                <div className={styles.twoColumn}>
                  <section className={styles.imagePanel}>
                    <div className={styles.imagePanelInner}>
                      <span className={styles.infoPill}>CEO Portrait</span>
                      <h2 className={styles.title}>{company?.ceoName ?? '김도현'}</h2>
                      <p className={styles.lead}>
                        현장의 문제를 전략과 실행으로 연결하는 리더십으로
                        에너지와 제조, 디지털 운영의 경계를 다시 설계합니다.
                      </p>
                    </div>
                  </section>

                  <section className={styles.quotePanel}>
                    <div aria-hidden="true" className={styles.quoteMark}>
                      {'\u201C'}
                    </div>
                    <span className="sectionEyebrow">Message</span>
                    <h2 className="sectionTitle">
                      명확한 방향과 담대한 실행이 필요합니다
                    </h2>
                    <p className={styles.quoteText}>
                      변화의 속도가 빨라질수록 기업은 더 명확한 방향과 더 담대한
                      실행이 필요합니다. 한화넥스트는 기술을 위한 기술이 아니라,
                      고객의 현장을 바꾸는 실행을 위해 움직입니다. 우리는 산업의
                      전환기를 기회로 바꾸는 파트너가 되겠습니다.
                    </p>
                    <p className="sectionCopy">
                      설립일 {company?.establishedDate
                        ? formatKoreanDate(company.establishedDate)
                        : '1998년 4월 8일'}
                    </p>
                    <span className={styles.signature}>
                      {company?.ceoName ?? 'Kim Dohyun'}
                    </span>
                  </section>
                </div>

                <section className={styles.panel}>
                  <span className="sectionEyebrow">Leadership Focus</span>
                  <h2 className="sectionTitle">리더십 약속</h2>
                  <div className={styles.statsGrid}>
                    {commitments.map((item) => (
                      <article className={styles.statCard} key={item.label}>
                        <span className={styles.statLabel}>{item.label}</span>
                        <strong className={styles.statValue}>{item.value}</strong>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}

export default CEOPage
