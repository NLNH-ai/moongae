import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { publicQueryKeys } from '../api/queryKeys'
import { getHistoryGroups } from '../api/public'
import PageTransition from '../components/common/PageTransition'
import QueryErrorState from '../components/common/QueryErrorState'
import SectionSkeleton from '../components/common/SectionSkeleton'
import { formatMonth, formatPageTitle, getDecadeLabel } from '../utils/formatters'
import { flattenHistoryGroups, groupHistoryByYear } from '../utils/helpers'
import styles from './Subpage.module.css'

function HistoryPage() {
  const historyQuery = useQuery({
    queryKey: publicQueryKeys.history,
    queryFn: getHistoryGroups,
  })

  const [selectedDecade, setSelectedDecade] = useState('')
  const entries = flattenHistoryGroups(historyQuery.data ?? [])
  const decades = Array.from(new Set(entries.map((entry) => getDecadeLabel(entry.year))))

  const activeDecade = selectedDecade || decades[0] || ''

  const filteredEntries =
    activeDecade.length > 0
      ? entries.filter((entry) => getDecadeLabel(entry.year) === activeDecade)
      : entries

  const groupedEntries = groupHistoryByYear(filteredEntries)
  const years = Object.keys(groupedEntries)
    .map(Number)
    .sort((left, right) => right - left)

  return (
    <PageTransition>
      <Helmet>
        <title>{formatPageTitle('기업 연혁')}</title>
        <meta
          content="한화넥스트의 주요 성장 이력과 변화의 순간을 연도별로 확인할 수 있는 연혁 페이지입니다."
          name="description"
        />
      </Helmet>
      <section className={styles.page}>
        <div className="container">
          <div className={styles.hero}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>History</span>
              <h1 className={styles.title}>변화의 순간을 연대기처럼 정리한 기록</h1>
              <p className={styles.lead}>
                연도별 주요 전환점과 사업 확장의 흐름을 더 상세한 타임라인으로
                구성했습니다.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            {historyQuery.isLoading ? (
              <SectionSkeleton count={4} variant="timeline" />
            ) : historyQuery.isError ? (
              <QueryErrorState
                description="연혁 데이터를 가져오는 중 문제가 발생했습니다."
                onRetry={() => historyQuery.refetch()}
                title="연혁 페이지를 불러오지 못했습니다."
              />
            ) : (
              <section className={styles.panel}>
                <span className="sectionEyebrow">Archive Filter</span>
                <h2 className="sectionTitle">연도별 필터</h2>
                <p className="sectionCopy">
                  2020s, 2010s, 2000s 등 시기별로 핵심 이력을 나눠서 볼 수
                  있습니다.
                </p>
                <div className={styles.timelineControls}>
                  {decades.map((decade) => (
                    <button
                      className={`${styles.filterButton} ${
                        activeDecade === decade ? styles.filterActive : ''
                      }`}
                      key={decade}
                      onClick={() => setSelectedDecade(decade)}
                      type="button"
                    >
                      {decade}
                    </button>
                  ))}
                </div>

                <div className={styles.timelineList}>
                  {years.map((year) => (
                    <section className={styles.timelineYearBlock} key={year}>
                      <div className={styles.timelineYearHeading}>
                        <span className={styles.timelineYear}>{year}</span>
                        <span className={styles.timelineCount}>
                          {groupedEntries[year].length} records
                        </span>
                      </div>
                      {groupedEntries[year].map((entry, index) => (
                        <article className={styles.timelineCard} key={entry.id}>
                          <div className={styles.timelineMeta}>
                            <span className={styles.timelineMonth}>
                              {formatMonth(entry.month)}
                            </span>
                            <span className={styles.timelineOrder}>
                              #{String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <div className={styles.timelineCopy}>
                            <h3>{entry.title}</h3>
                            <p>{entry.description}</p>
                          </div>
                          <div
                            className={styles.timelineMedia}
                            style={{
                              backgroundImage: entry.imageUrl
                                ? `linear-gradient(135deg, rgba(232, 93, 44, 0.78), rgba(15, 15, 15, 0.18)), url(${entry.imageUrl})`
                                : undefined,
                            }}
                          >
                            <span>History</span>
                          </div>
                        </article>
                      ))}
                    </section>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}

export default HistoryPage
