import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { publicQueryKeys } from '../api/queryKeys'
import { getCompanyProfile, getPageSection } from '../api/public'
import CompanyIntro from '../components/about/CompanyIntro'
import CEOMessage from '../components/about/CEOMessage'
import OrgChart from '../components/about/OrgChart'
import PageTransition from '../components/common/PageTransition'
import QueryErrorState from '../components/common/QueryErrorState'
import SectionSkeleton from '../components/common/SectionSkeleton'
import styles from './Subpage.module.css'

const values = [
  {
    label: 'Mission',
    title: '산업의 실행 속도를 높이는 연결',
    copy:
      '현장의 문제를 기술과 운영으로 번역해 고객이 더 빠르게 의사결정하고 실행할 수 있는 구조를 만듭니다.',
  },
  {
    label: 'Vision',
    title: '에너지와 제조를 잇는 미래 플랫폼',
    copy:
      '지속 가능한 에너지 전환과 디지털 제조 혁신을 하나의 경험으로 연결하는 산업 플랫폼 기업을 지향합니다.',
  },
  {
    label: 'Core Value',
    title: '명확한 방향, 과감한 실행, 끝까지 책임',
    copy:
      '장기 전략과 단기 실행을 분리하지 않고, 실제 성과로 이어지는 실행력을 조직의 기본값으로 둡니다.',
  },
]

function AboutPage() {
  const companyQuery = useQuery({
    queryKey: publicQueryKeys.company,
    queryFn: getCompanyProfile,
    staleTime: 1000 * 60 * 5,
  })

  const introQuery = useQuery({
    queryKey: publicQueryKeys.pageSection('ABOUT', 'intro'),
    queryFn: () => getPageSection('ABOUT', 'intro'),
  })

  const showError = companyQuery.isError && introQuery.isError

  return (
    <PageTransition>
      <Helmet>
        <title>About | Hanwha Next</title>
        <meta
          content="한화넥스트의 기업 소개, 비전, 핵심 가치와 조직 운영 방향을 확인할 수 있는 그룹소개 페이지입니다."
          name="description"
        />
      </Helmet>
      <section className={styles.page}>
        <div className="container">
          <div className={styles.hero}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>About</span>
              <h1 className={styles.title}>기술과 실행을 연결하는 기업</h1>
              <p className={styles.lead}>
                한화넥스트는 에너지, 제조, 디지털 운영 체계를 하나로 연결해
                산업의 다음 기준을 설계합니다.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            {companyQuery.isLoading && introQuery.isLoading ? (
              <SectionSkeleton variant="hero" />
            ) : showError ? (
              <QueryErrorState
                description="기업 소개 데이터를 불러오는 중 문제가 발생했습니다."
                onRetry={() => {
                  void companyQuery.refetch()
                  void introQuery.refetch()
                }}
                title="그룹소개 페이지를 불러오지 못했습니다."
              />
            ) : (
              <div className={styles.stack}>
                <CompanyIntro
                  company={companyQuery.data}
                  introContent={introQuery.data}
                />
                <CEOMessage ceoName={companyQuery.data?.ceoName} />
                <section className={styles.panel}>
                  <span className="sectionEyebrow">Values</span>
                  <h2 className="sectionTitle">미션과 비전</h2>
                  <p className="sectionCopy">
                    장기 전략, 현장 실행, 고객 성과를 하나의 흐름으로 연결하는
                    기업 문화를 운영합니다.
                  </p>
                  <div className={styles.valueGrid}>
                    {values.map((item) => (
                      <article className={styles.valueCard} key={item.label}>
                        <span className={styles.valueLabel}>{item.label}</span>
                        <h3 className={styles.valueTitle}>{item.title}</h3>
                        <p className={styles.valueCopy}>{item.copy}</p>
                      </article>
                    ))}
                  </div>
                </section>
                <div className={styles.panel}>
                  <OrgChart />
                </div>
                <section className={styles.ctaCard}>
                  <div>
                    <span className={styles.eyebrow}>History</span>
                    <h2 className={styles.title}>더 자세한 연혁 보기</h2>
                    <p className={styles.lead}>
                      한화넥스트가 축적해 온 주요 전환점과 성장 스토리를
                      연혁 페이지에서 확인할 수 있습니다.
                    </p>
                  </div>
                  <Link className={styles.button} to="/about/history">
                    연혁 페이지 이동
                  </Link>
                </section>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}

export default AboutPage
