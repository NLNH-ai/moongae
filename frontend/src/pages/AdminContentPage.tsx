import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import type { ContentUpdatePayload } from '../types/admin'
import type { PageContentItem, PageKey } from '../types/domain'
import {
  deleteUpload,
  getAdminMe,
  getAdminPageContents,
  updateContent,
  uploadImage,
} from '../api/admin'
import { adminQueryKeys, publicQueryKeys } from '../api/queryKeys'
import ImageUploadField from '../components/admin/ImageUploadField'
import AdminLayout from '../components/admin/AdminLayout'
import PageTransition from '../components/common/PageTransition'
import SectionSkeleton from '../components/common/SectionSkeleton'
import { useToast } from '../components/common/toast-context'
import { getErrorMessage } from '../utils/errors'
import {
  formatKoreanDate,
  formatPageTitle,
} from '../utils/formatters'
import styles from './AdminScreens.module.css'

const pageKeys: PageKey[] = ['HOME', 'ABOUT', 'BUSINESS', 'CONTACT']

const pageDescriptions: Record<PageKey, string> = {
  HOME: '메인 히어로, 연혁, 사업 소개 등 첫 화면 핵심 섹션을 관리합니다.',
  ABOUT: '회사 소개, 비전, 기업 문화처럼 브랜딩 중심 페이지를 정리합니다.',
  BUSINESS: '사업 요약과 세부 소개 페이지에 노출되는 콘텐츠를 관리합니다.',
  CONTACT: '문의, 주소, 안내 문구 등 전환형 섹션을 정리합니다.',
}

type ContentDraftMap = Record<number, Partial<ContentUpdatePayload>>

function getRateLabel(activeCount: number, totalCount: number) {
  if (totalCount === 0) {
    return '0%'
  }

  return `${Math.round((activeCount / totalCount) * 100)}%`
}

function AdminContentPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [selectedPage, setSelectedPage] = useState<PageKey>('HOME')
  const [drafts, setDrafts] = useState<ContentDraftMap>({})
  const [uploadingItemId, setUploadingItemId] = useState<number | null>(null)
  const [uploadedFileIds, setUploadedFileIds] = useState<Record<number, number | null>>({})
  const contentFilters = useMemo(
    () => ({
      page: 0,
      size: 100,
      sortBy: 'displayOrder' as const,
      sortDirection: 'ASC' as const,
    }),
    [],
  )

  const adminQuery = useQuery({
    queryKey: adminQueryKeys.me,
    queryFn: getAdminMe,
  })

  const contentQuery = useQuery({
    queryKey: adminQueryKeys.pageContents({ pageKey: selectedPage, ...contentFilters }),
    queryFn: () => getAdminPageContents(selectedPage, contentFilters),
  })

  const saveMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ContentUpdatePayload
    }) => updateContent(id, payload),
    onSuccess: async (_, variables) => {
      showToast({
        title: 'Section saved',
        description: 'The selected content section is synced to the CMS.',
      })
      setDrafts((current) => {
        const nextDrafts = { ...current }
        delete nextDrafts[variables.id]
        return nextDrafts
      })
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'content'],
      })
      await queryClient.invalidateQueries({
        queryKey: publicQueryKeys.pageContents(selectedPage),
      })
    },
    onError: (error) => {
      showToast({
        title: 'Save failed',
        description: getErrorMessage(
          error,
          'A problem occurred while saving the content section.',
        ),
        variant: 'error',
      })
    },
  })

  const items = useMemo(() => contentQuery.data?.items ?? [], [contentQuery.data?.items])

  const selectedDraftCount = useMemo(
    () =>
      items.filter((item) => {
        const draft = drafts[item.id]
        return Boolean(draft && Object.keys(draft).length > 0)
      }).length,
    [drafts, items],
  )

  const activeCount = items.filter((item) => item.isActive).length
  const imageCoverageCount = items.filter((item) => Boolean(item.imageUrl)).length
  const latestUpdatedItem =
    [...items].sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )[0] ?? null

  const getDraftValue = <K extends keyof ContentUpdatePayload>(
    item: PageContentItem,
    key: K,
  ): ContentUpdatePayload[K] => {
    const draft = drafts[item.id]?.[key]
    return (draft ?? item[key]) as ContentUpdatePayload[K]
  }

  const updateDraft = <K extends keyof ContentUpdatePayload>(
    id: number,
    key: K,
    value: ContentUpdatePayload[K],
  ) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [key]: value,
      },
    }))
  }

  const handleUpload = async (itemId: number, file: File) => {
    setUploadingItemId(itemId)

    try {
      const uploaded = await uploadImage(file)
      updateDraft(itemId, 'imageUrl', uploaded.filePath)
      setUploadedFileIds((current) => ({
        ...current,
        [itemId]: uploaded.id,
      }))
      showToast({
        title: 'Image uploaded',
        description: 'The section visual was attached to the draft.',
      })
    } catch (error) {
      showToast({
        title: 'Upload failed',
        description: getErrorMessage(
          error,
          'A problem occurred while uploading the section image.',
        ),
        variant: 'error',
      })
    } finally {
      setUploadingItemId(null)
    }
  }

  const handleClearImage = async (itemId: number) => {
    const uploadId = uploadedFileIds[itemId]

    if (uploadId) {
      try {
        await deleteUpload(uploadId)
      } catch {
        // Ignore temporary cleanup failures.
      }
    }

    updateDraft(itemId, 'imageUrl', null)
    setUploadedFileIds((current) => ({
      ...current,
      [itemId]: null,
    }))
  }

  const buildPayload = (item: PageContentItem): ContentUpdatePayload => ({
    title: String(getDraftValue(item, 'title')),
    content: String(getDraftValue(item, 'content')),
    imageUrl: getDraftValue(item, 'imageUrl') as string | null,
    displayOrder: Number(getDraftValue(item, 'displayOrder')),
    isActive: Boolean(getDraftValue(item, 'isActive')),
  })

  return (
    <PageTransition>
      <Helmet>
        <title>{formatPageTitle('콘텐츠 관리')}</title>
        <meta
          content="관리자 콘텐츠 관리 페이지입니다."
          name="description"
        />
      </Helmet>
      <section
        className={styles.loginShell}
        style={{ minHeight: 'auto', paddingTop: '7rem' }}
      >
        <div className={styles.adminViewport}>
          <AdminLayout
            adminName={adminQuery.data?.name}
            description="페이지별 섹션 편집, 이미지 교체, 게시 상태 제어를 한 흐름으로 정리했습니다."
            title="콘텐츠 관리"
          >
            {contentQuery.isLoading ? (
              <SectionSkeleton count={3} variant="cards" />
            ) : (
              <>
                <div className={styles.metrics}>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Selected Page</span>
                    <strong className={styles.metricValue}>{selectedPage}</strong>
                    <span className={styles.metricMeta}>
                      현재 작업 중인 페이지 키
                    </span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Page Sections</span>
                    <strong className={styles.metricValue}>{items.length}</strong>
                    <span className={styles.metricMeta}>
                      선택 페이지에 포함된 섹션 수
                    </span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Visible Sections</span>
                    <strong className={styles.metricValue}>{activeCount}</strong>
                    <span className={styles.metricMeta}>
                      현재 공개 중인 섹션 수
                    </span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Draft Pressure</span>
                    <strong className={styles.metricValue}>{selectedDraftCount}</strong>
                    <span className={styles.metricMeta}>
                      저장 대기 중인 섹션 변경 수
                    </span>
                  </article>
                </div>

                <div className={styles.workspaceGrid}>
                  <div className={styles.workspaceMain}>
                    <section className={styles.surface}>
                      <div className={styles.pageOverview}>
                        <div className={styles.pageOverviewCopy}>
                          <span className={styles.metricLabel}>Page workspace</span>
                          <h2 className={styles.pageOverviewTitle}>{selectedPage}</h2>
                          <p className={styles.sectionLead}>
                            {pageDescriptions[selectedPage]}
                          </p>
                        </div>
                        <div className={styles.toolbarMeta}>
                          <span className={styles.statPill}>
                            <strong>{selectedDraftCount}</strong> unsaved drafts
                          </span>
                          <span className={styles.statPill}>
                            <strong>{imageCoverageCount}</strong> image-ready
                          </span>
                          <span className={styles.statPill}>
                            <strong>{getRateLabel(activeCount, items.length)}</strong> live
                          </span>
                        </div>
                      </div>

                      <div className={styles.tabRow}>
                        {pageKeys.map((pageKey) => (
                          <button
                            className={`${styles.tabButton} ${
                              selectedPage === pageKey ? styles.tabActive : ''
                            }`}
                            data-testid={`content-tab-${pageKey}`}
                            key={pageKey}
                            onClick={() => setSelectedPage(pageKey)}
                            type="button"
                          >
                            {pageKey}
                          </button>
                        ))}
                      </div>

                      {items.length > 0 ? (
                        <div className={styles.editorGrid}>
                          {items.map((item) => {
                            const isDirty = Boolean(
                              drafts[item.id] && Object.keys(drafts[item.id]!).length > 0,
                            )

                            return (
                              <article
                                className={`${styles.editorCard} ${
                                  isDirty ? styles.editorCardDirty : ''
                                }`}
                                key={item.id}
                              >
                                <div className={styles.editorCardHeader}>
                                  <div>
                                    <p className={styles.editorEyebrow}>
                                      {item.pageKey} / {item.sectionKey}
                                    </p>
                                    <h2 className={styles.contentTitle}>{item.title}</h2>
                                    <p className={styles.small}>
                                      Last updated {formatKoreanDate(item.updatedAt)}
                                    </p>
                                  </div>
                                  <div className={styles.assetBadges}>
                                    <span
                                      className={
                                        getDraftValue(item, 'isActive')
                                          ? styles.badge
                                          : styles.badgeMuted
                                      }
                                    >
                                      {getDraftValue(item, 'isActive') ? 'Active' : 'Hidden'}
                                    </span>
                                    {isDirty ? (
                                      <span className={styles.inlineBadgeWarn}>Draft</span>
                                    ) : (
                                      <span className={styles.inlineBadge}>Synced</span>
                                    )}
                                  </div>
                                </div>

                                <div className={styles.formGrid} style={{ marginTop: '1rem' }}>
                                  <div className={styles.inlineField}>
                                    <label
                                      className={styles.fieldLabel}
                                      htmlFor={`content-title-${item.id}`}
                                    >
                                      Section title
                                    </label>
                                    <input
                                      className={styles.inlineInput}
                                      data-testid={`content-title-input-${item.id}`}
                                      id={`content-title-${item.id}`}
                                      onChange={(event) =>
                                        updateDraft(item.id, 'title', event.target.value)
                                      }
                                      value={String(getDraftValue(item, 'title'))}
                                    />
                                  </div>

                                  <div className={styles.inlineField}>
                                    <label
                                      className={styles.fieldLabel}
                                      htmlFor={`content-body-${item.id}`}
                                    >
                                      Body copy
                                    </label>
                                    <textarea
                                      className={styles.inlineTextarea}
                                      id={`content-body-${item.id}`}
                                      onChange={(event) =>
                                        updateDraft(item.id, 'content', event.target.value)
                                      }
                                      value={String(getDraftValue(item, 'content'))}
                                    />
                                  </div>

                                  <div className={styles.formRow}>
                                    <ImageUploadField
                                      helper="Section image for cards, banners, or inline visual areas."
                                      label="Section image"
                                      onClear={() => void handleClearImage(item.id)}
                                      onSelect={(file) => void handleUpload(item.id, file)}
                                      testIdPrefix={`content-image-${item.id}`}
                                      uploading={uploadingItemId === item.id}
                                      value={getDraftValue(item, 'imageUrl') as string | null}
                                    />
                                    <div className={styles.formGrid}>
                                      <div className={styles.field}>
                                        <label
                                          className={styles.fieldLabel}
                                          htmlFor={`content-order-${item.id}`}
                                        >
                                          Display order
                                        </label>
                                        <input
                                          className={styles.input}
                                          id={`content-order-${item.id}`}
                                          min={0}
                                          onChange={(event) =>
                                            updateDraft(
                                              item.id,
                                              'displayOrder',
                                              Number(event.target.value),
                                            )
                                          }
                                          type="number"
                                          value={Number(getDraftValue(item, 'displayOrder'))}
                                        />
                                      </div>
                                      <div
                                        className={`${styles.toggleRow} ${
                                          getDraftValue(item, 'isActive')
                                            ? styles.switchActive
                                            : ''
                                        }`}
                                      >
                                        <div className={styles.toggleLabel}>
                                          <strong>Section visibility</strong>
                                          <span className={styles.toggleHelper}>
                                            Use hidden for staged edits before publishing.
                                          </span>
                                        </div>
                                        <label
                                          className={`${styles.switch} ${
                                            getDraftValue(item, 'isActive')
                                              ? styles.switchActive
                                              : ''
                                          }`}
                                        >
                                          <input
                                            checked={Boolean(getDraftValue(item, 'isActive'))}
                                            onChange={(event) =>
                                              updateDraft(
                                                item.id,
                                                'isActive',
                                                event.target.checked,
                                              )
                                            }
                                            type="checkbox"
                                          />
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className={styles.modalActions}>
                                  <button
                                    className={styles.ghostButton}
                                    onClick={() =>
                                      setDrafts((current) => {
                                        const next = { ...current }
                                        delete next[item.id]
                                        return next
                                      })
                                    }
                                    type="button"
                                  >
                                    Reset draft
                                  </button>
                                  <button
                                    className={styles.primaryButton}
                                    data-testid={`content-save-${item.id}`}
                                    disabled={saveMutation.isPending}
                                    onClick={() =>
                                      saveMutation.mutate({
                                        id: item.id,
                                        payload: buildPayload(item),
                                      })
                                    }
                                    type="button"
                                  >
                                    Save section
                                  </button>
                                </div>
                              </article>
                            )
                          })}
                        </div>
                      ) : (
                        <div className={styles.emptyState}>
                          선택한 페이지에 등록된 콘텐츠가 없습니다.
                        </div>
                      )}
                    </section>
                  </div>

                  <aside className={styles.workspaceSide}>
                    <section className={styles.surface}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h2 className={styles.sectionTitle}>Page summary</h2>
                          <p className={styles.sectionLead}>
                            현재 페이지의 게시 준비 상태를 빠르게 파악합니다.
                          </p>
                        </div>
                      </div>
                      <div className={styles.statusGrid}>
                        <div className={styles.statusRow}>
                          <div>
                            <strong>Section count</strong>
                            <p className={styles.small}>Registered sections in this page</p>
                          </div>
                          <span className={styles.statusValue}>{items.length}</span>
                        </div>
                        <div className={styles.statusRow}>
                          <div>
                            <strong>Image coverage</strong>
                            <p className={styles.small}>Sections with an attached visual</p>
                          </div>
                          <span className={styles.statusValue}>
                            {getRateLabel(imageCoverageCount, items.length)}
                          </span>
                        </div>
                        <div className={styles.statusRow}>
                          <div>
                            <strong>Last sync</strong>
                            <p className={styles.small}>Most recent section update timestamp</p>
                          </div>
                          <span className={styles.statusValue}>
                            {latestUpdatedItem
                              ? formatKoreanDate(latestUpdatedItem.updatedAt)
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </section>

                    <section className={styles.surface}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h2 className={styles.sectionTitle}>Section map</h2>
                          <p className={styles.sectionLead}>
                            각 섹션의 노출 상태와 편집 상태를 확인합니다.
                          </p>
                        </div>
                      </div>
                      <div className={styles.list}>
                        {items.map((item) => {
                          const isDirty = Boolean(
                            drafts[item.id] && Object.keys(drafts[item.id]!).length > 0,
                          )

                          return (
                            <article className={styles.listItem} key={item.id}>
                              <div>
                                <strong className={styles.itemTitle}>
                                  {item.sectionKey}
                                </strong>
                                <span className={styles.itemMeta}>
                                  order {item.displayOrder} /{' '}
                                  {getDraftValue(item, 'isActive') ? 'visible' : 'hidden'}
                                </span>
                              </div>
                              <span
                                className={
                                  isDirty ? styles.inlineBadgeWarn : styles.inlineBadge
                                }
                              >
                                {isDirty ? 'Draft' : 'Synced'}
                              </span>
                            </article>
                          )
                        })}
                      </div>
                    </section>

                    <section className={styles.surface}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h2 className={styles.sectionTitle}>Publishing guide</h2>
                          <p className={styles.sectionLead}>
                            페이지 편집 중 자주 확인하는 기준입니다.
                          </p>
                        </div>
                      </div>
                      <ul className={styles.noteList}>
                        <li className={styles.noteItem}>
                          <strong className={styles.noteTitle}>1. Keep titles concise</strong>
                          <span className={styles.noteCopy}>
                            섹션 제목은 카드, 배너, 모바일 모두에서 깨지지 않을 길이로 유지하세요.
                          </span>
                        </li>
                        <li className={styles.noteItem}>
                          <strong className={styles.noteTitle}>2. Stage with hidden mode</strong>
                          <span className={styles.noteCopy}>
                            문안이나 이미지 교체 중이면 hidden 상태로 먼저 저장해두는 편이 안전합니다.
                          </span>
                        </li>
                        <li className={styles.noteItem}>
                          <strong className={styles.noteTitle}>3. Save per section</strong>
                          <span className={styles.noteCopy}>
                            각 카드가 독립 저장이므로, 수정한 섹션마다 바로 저장해 변경 범위를 작게 유지하세요.
                          </span>
                        </li>
                      </ul>
                    </section>
                  </aside>
                </div>
              </>
            )}
          </AdminLayout>
        </div>
      </section>
    </PageTransition>
  )
}

export default AdminContentPage
