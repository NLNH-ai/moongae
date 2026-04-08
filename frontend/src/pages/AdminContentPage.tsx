import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import type { ContentUpdatePayload } from '../types/admin'
import type { PageContentItem, PageKey } from '../types/domain'
import { deleteUpload, getAdminMe, updateContent, uploadImage } from '../api/admin'
import { publicQueryKeys } from '../api/queryKeys'
import { getPageContents } from '../api/public'
import ImageUploadField from '../components/admin/ImageUploadField'
import AdminLayout from '../components/admin/AdminLayout'
import PageTransition from '../components/common/PageTransition'
import SectionSkeleton from '../components/common/SectionSkeleton'
import { useToast } from '../components/common/toast-context'
import { getErrorMessage } from '../utils/errors'
import styles from './AdminScreens.module.css'

const pageKeys: PageKey[] = ['HOME', 'ABOUT', 'BUSINESS', 'CONTACT']

type ContentDraftMap = Record<number, Partial<ContentUpdatePayload>>

function AdminContentPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [selectedPage, setSelectedPage] = useState<PageKey>('HOME')
  const [drafts, setDrafts] = useState<ContentDraftMap>({})
  const [uploadingItemId, setUploadingItemId] = useState<number | null>(null)
  const [uploadedFileIds, setUploadedFileIds] = useState<Record<number, number | null>>({})

  const adminQuery = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: getAdminMe,
  })

  const contentQuery = useQuery({
    queryKey: publicQueryKeys.pageContents(selectedPage),
    queryFn: () => getPageContents(selectedPage),
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
        title: '콘텐츠 저장 완료',
        description: '섹션 변경 사항이 저장되었습니다.',
      })
      setDrafts((current) => {
        const nextDrafts = { ...current }
        delete nextDrafts[variables.id]
        return nextDrafts
      })
      await queryClient.invalidateQueries({
        queryKey: publicQueryKeys.pageContents(selectedPage),
      })
    },
    onError: (error) => {
      showToast({
        title: '콘텐츠 저장 실패',
        description: getErrorMessage(error, '콘텐츠 저장 중 문제가 발생했습니다.'),
        variant: 'error',
      })
    },
  })

  const items = contentQuery.data ?? []

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
        title: '이미지 업로드 완료',
        description: '섹션 이미지를 교체했습니다.',
      })
    } catch (error) {
      showToast({
        title: '이미지 업로드 실패',
        description: getErrorMessage(error, '이미지 업로드 중 문제가 발생했습니다.'),
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
        <title>콘텐츠 관리 | Hanwha Next</title>
        <meta content="한화넥스트 관리자 콘텐츠 관리 페이지입니다." name="description" />
      </Helmet>
      <section className={styles.loginShell} style={{ minHeight: 'auto', paddingTop: '7rem' }}>
        <div className="container" style={{ width: 'var(--container-width)' }}>
          <AdminLayout
            adminName={adminQuery.data?.name}
            description="페이지별 섹션 제목, 본문, 이미지와 노출 상태를 인라인으로 수정합니다."
            title="콘텐츠 관리"
          >
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

            {contentQuery.isLoading ? (
              <SectionSkeleton count={3} variant="cards" />
            ) : items.length > 0 ? (
              <div className={styles.contentGrid}>
                {items.map((item) => (
                  <article className={styles.contentCard} key={item.id}>
                    <div className={styles.contentHeader}>
                      <div>
                        <h2 className={styles.contentTitle}>
                          {item.pageKey} · {item.sectionKey}
                        </h2>
                        <p className={styles.small}>Display Order: {item.displayOrder}</p>
                      </div>
                      <span className={item.isActive ? styles.badge : styles.badgeMuted}>
                        {getDraftValue(item, 'isActive') ? 'Active' : 'Hidden'}
                      </span>
                    </div>

                    <div className={styles.formGrid} style={{ marginTop: '1rem' }}>
                      <div className={styles.inlineField}>
                        <label className={styles.fieldLabel} htmlFor={`content-title-${item.id}`}>
                          제목
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
                        <label className={styles.fieldLabel} htmlFor={`content-body-${item.id}`}>
                          본문
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
                          helper="섹션 이미지를 교체하거나 제거할 수 있습니다."
                          label="섹션 이미지"
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
                              표시 순서
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
                              <strong>노출 여부</strong>
                              <span className={styles.toggleHelper}>
                                섹션별 공개 상태를 즉시 관리합니다.
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
                                  updateDraft(item.id, 'isActive', event.target.checked)
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
                        변경 취소
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
                        저장
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>선택한 페이지에 등록된 콘텐츠가 없습니다.</div>
            )}
          </AdminLayout>
        </div>
      </section>
    </PageTransition>
  )
}

export default AdminContentPage
