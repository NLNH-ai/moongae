import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { publicQueryKeys } from '../api/queryKeys'
import {
  getBusinessAreas,
  getCompanyProfile,
  getHistoryGroups,
  getPageSection,
} from '../api/public'
import QueryErrorState from '../components/common/QueryErrorState'
import SectionSkeleton from '../components/common/SectionSkeleton'
import BusinessOverview from '../components/home/BusinessOverview'
import HeroSection from '../components/home/HeroSection'
import HistoryTimeline from '../components/home/HistoryTimeline'
import { BRAND_NAME, resolveBrandName } from '../config/branding'
import styles from './HomePage.module.css'

const historySectionTitle = '\uc5f0\ud601'
const businessSectionTitle = '\uc0ac\uc5c5\ubd84\uc57c'
const historyLoadErrorTitle = '\uc5f0\ud601 \uc139\uc158\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.'
const historyLoadErrorDescription =
  '\uc5f0\ud601 \ub370\uc774\ud130\ub97c \uac00\uc838\uc624\ub294 \uc911 \ubb38\uc81c\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.'
const businessLoadErrorTitle =
  '\uc0ac\uc5c5\ubd84\uc57c \uc139\uc158\uc744 \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.'
const businessLoadErrorDescription =
  '\uc0ac\uc5c5\ubd84\uc57c \ub370\uc774\ud130\ub97c \uac00\uc838\uc624\ub294 \uc911 \ubb38\uc81c\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.'

function HomePage() {
  const companyQuery = useQuery({
    queryKey: publicQueryKeys.company,
    queryFn: getCompanyProfile,
    staleTime: 1000 * 60 * 5,
  })

  const heroQuery = useQuery({
    queryKey: publicQueryKeys.pageSection('HOME', 'hero'),
    queryFn: () => getPageSection('HOME', 'hero'),
  })

  const historyQuery = useQuery({
    queryKey: publicQueryKeys.history,
    queryFn: getHistoryGroups,
  })

  const businessQuery = useQuery({
    queryKey: publicQueryKeys.business,
    queryFn: getBusinessAreas,
  })

  return (
    <>
      <Helmet>
        <title>{BRAND_NAME}</title>
      </Helmet>
      <div className={styles.page} data-testid="home-page">
        {heroQuery.isLoading && !heroQuery.data ? (
          <div className={`${styles.heroSkeleton} container`}>
            <SectionSkeleton variant="hero" />
          </div>
        ) : (
          <HeroSection
            companyName={resolveBrandName(companyQuery.data?.companyName)}
            heroContent={heroQuery.data}
          />
        )}

        <div className={styles.sectionBlock}>
          {historyQuery.isLoading ? (
            <div className="container">
              <span className="sectionEyebrow">History</span>
              <h2 className="sectionTitle">{historySectionTitle}</h2>
              <SectionSkeleton count={4} variant="timeline" />
            </div>
          ) : historyQuery.isError ? (
            <div className="container">
              <QueryErrorState
                description={historyLoadErrorDescription}
                onRetry={() => historyQuery.refetch()}
                title={historyLoadErrorTitle}
              />
            </div>
          ) : (
            <HistoryTimeline groups={historyQuery.data ?? []} />
          )}
        </div>

        <div className={styles.sectionBlock}>
          {businessQuery.isLoading ? (
            <div className="container">
              <span className="sectionEyebrow">Business</span>
              <h2 className="sectionTitle">{businessSectionTitle}</h2>
              <SectionSkeleton count={3} variant="cards" />
            </div>
          ) : businessQuery.isError ? (
            <div className="container">
              <QueryErrorState
                description={businessLoadErrorDescription}
                onRetry={() => businessQuery.refetch()}
                title={businessLoadErrorTitle}
              />
            </div>
          ) : (
            <BusinessOverview items={businessQuery.data ?? []} />
          )}
        </div>
      </div>
    </>
  )
}

export default HomePage
