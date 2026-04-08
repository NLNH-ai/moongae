import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { publicQueryKeys } from '../api/queryKeys'
import { getBusinessArea, getBusinessAreas } from '../api/public'
import BusinessCard from '../components/business/BusinessCard'
import PageTransition from '../components/common/PageTransition'
import QueryErrorState from '../components/common/QueryErrorState'
import SectionSkeleton from '../components/common/SectionSkeleton'
import { formatKoreanDate, formatPageTitle } from '../utils/formatters'
import styles from './Subpage.module.css'

function BusinessDetailPage() {
  const { id = '' } = useParams()
  const businessDetailQuery = useQuery({
    enabled: Boolean(id),
    queryKey: publicQueryKeys.businessDetail(id),
    queryFn: () => getBusinessArea(id),
  })

  const businessListQuery = useQuery({
    queryKey: publicQueryKeys.business,
    queryFn: getBusinessAreas,
  })

  const detail = businessDetailQuery.data
  const allItems = businessListQuery.data ?? []
  const descriptionParagraphs = detail?.description
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean) ?? []

  const currentIndex = allItems.findIndex((item) => item.id === detail?.id)
  const canCycle = allItems.length > 1 && currentIndex >= 0
  const previousItem = canCycle
    ? allItems[(currentIndex - 1 + allItems.length) % allItems.length]
    : undefined
  const nextItem = canCycle
    ? allItems[(currentIndex + 1) % allItems.length]
    : undefined
  const relatedItems = allItems.filter((item) => item.id !== detail?.id).slice(0, 3)

  const galleryItems = detail
    ? [
        {
          label: 'Portfolio',
          title: `${detail.title} 전략 캡슐`,
        },
        {
          label: 'Execution',
          title: '현장 운영과 서비스 실행',
        },
        {
          label: 'Impact',
          title: '고객 성과 중심의 확장',
        },
      ]
    : []

  return (
    <PageTransition>
      <Helmet>
        <title>{formatPageTitle(detail ? detail.title : '사업 상세')}</title>
        <meta
          content={
            detail
              ? `${detail.title} 사업의 운영 전략과 핵심 역량을 확인할 수 있는 상세 페이지입니다.`
              : '한화넥스트 사업분야 상세 페이지입니다.'
          }
          name="description"
        />
      </Helmet>
      <section className={styles.page}>
        <div className="container">
          <div
            className={styles.hero}
            style={{
              background: detail?.imageUrl
                ? `linear-gradient(135deg, rgba(15, 15, 15, 0.68), rgba(232, 93, 44, 0.72)), url(${detail.imageUrl}) center/cover`
                : undefined,
            }}
          >
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>Business Detail</span>
              {businessDetailQuery.isLoading ? (
                <SectionSkeleton variant="hero" />
              ) : businessDetailQuery.isError ? (
                <QueryErrorState
                  description="사업 상세 정보를 가져오는 중 문제가 발생했습니다."
                  onRetry={() => businessDetailQuery.refetch()}
                  title="사업 상세 페이지를 불러오지 못했습니다."
                />
              ) : detail ? (
                <>
                  <h1 className={styles.title}>{detail.title}</h1>
                  <p className={styles.lead}>
                    {detail.subtitle ||
                      '핵심 역량과 운영 전략을 소개하는 사업 상세 화면입니다.'}
                  </p>
                </>
              ) : null}
            </div>
          </div>

          {detail ? (
            <div className={styles.section}>
              <div className={styles.stack}>
                <div className={styles.twoColumn}>
                  <section className={styles.panel}>
                    <span className="sectionEyebrow">Overview</span>
                    <h2 className="sectionTitle">사업 설명</h2>
                    <div className={styles.richText}>
                      {(descriptionParagraphs.length > 0
                        ? descriptionParagraphs
                        : [detail.description]
                      ).map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                  <aside className={styles.stack}>
                    <article className={styles.statCard}>
                      <span className={styles.statLabel}>Status</span>
                      <strong className={styles.statValue}>
                        {detail.isActive ? 'Active' : 'Paused'}
                      </strong>
                    </article>
                    <article className={styles.statCard}>
                      <span className={styles.statLabel}>Order</span>
                      <strong className={styles.statValue}>
                        {String(detail.displayOrder).padStart(2, '0')}
                      </strong>
                    </article>
                    <article className={styles.statCard}>
                      <span className={styles.statLabel}>Updated</span>
                      <strong className={styles.statValue}>
                        {formatKoreanDate(detail.updatedAt)}
                      </strong>
                    </article>
                  </aside>
                </div>

                <section className={styles.panel}>
                  <div className={styles.relatedHeader}>
                    <div>
                      <span className="sectionEyebrow">Gallery</span>
                      <h2 className="sectionTitle">관련 이미지 갤러리</h2>
                    </div>
                    <Link className={styles.ghostButton} to="/business">
                      사업분야 목록 보기
                    </Link>
                  </div>
                  <div className={styles.gallery}>
                    {galleryItems.map((item) => (
                      <article
                        className={styles.galleryItem}
                        key={item.label}
                        style={{
                          backgroundImage: detail.imageUrl
                            ? `linear-gradient(135deg, rgba(232, 93, 44, 0.22), rgba(15, 15, 15, 0.4)), url(${detail.imageUrl})`
                            : undefined,
                        }}
                      >
                        <div className={styles.galleryItemContent}>
                          <span className={styles.galleryLabel}>{item.label}</span>
                          <strong>{item.title}</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                {canCycle ? (
                  <section className={styles.panel}>
                    <div className={styles.relatedHeader}>
                      <div>
                        <span className="sectionEyebrow">Navigator</span>
                        <h2 className="sectionTitle">다른 사업분야 둘러보기</h2>
                      </div>
                    </div>
                    <div className={styles.navPair}>
                      {previousItem ? (
                        <Link className={styles.navCard} to={`/business/${previousItem.id}`}>
                          <span className={styles.navLabel}>Previous</span>
                          <strong className={styles.navTitle}>{previousItem.title}</strong>
                          <span>{previousItem.subtitle || '이전 사업분야로 이동'}</span>
                        </Link>
                      ) : null}
                      {nextItem ? (
                        <Link className={styles.navCard} to={`/business/${nextItem.id}`}>
                          <span className={styles.navLabel}>Next</span>
                          <strong className={styles.navTitle}>{nextItem.title}</strong>
                          <span>{nextItem.subtitle || '다음 사업분야로 이동'}</span>
                        </Link>
                      ) : null}
                    </div>
                  </section>
                ) : null}

                {relatedItems.length > 0 ? (
                  <section className={styles.panel}>
                    <div className={styles.relatedHeader}>
                      <div>
                        <span className="sectionEyebrow">Related</span>
                        <h2 className="sectionTitle">다른 사업분야 카드</h2>
                      </div>
                    </div>
                    <div className={styles.relatedGrid}>
                      {relatedItems.map((item) => (
                        <BusinessCard businessArea={item} key={item.id} />
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </PageTransition>
  )
}

export default BusinessDetailPage
