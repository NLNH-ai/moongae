import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { lazy, Suspense, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import type { BusinessUpsertPayload } from '../types/admin'
import type { BusinessAreaItem } from '../types/domain'
import {
  createBusiness,
  deleteBusiness,
  deleteUpload,
  getAdminBusinessAreas,
  getAdminMe,
  updateBusiness,
  uploadImage,
} from '../api/admin'
import { publicQueryKeys } from '../api/queryKeys'
import ImageUploadField from '../components/admin/ImageUploadField'
import AdminLayout from '../components/admin/AdminLayout'
import Modal from '../components/common/Modal'
import PageTransition from '../components/common/PageTransition'
import SectionSkeleton from '../components/common/SectionSkeleton'
import { useToast } from '../components/common/toast-context'
import { getErrorMessage } from '../utils/errors'
import {
  formatKoreanDate,
  formatPageTitle,
} from '../utils/formatters'
import { trimText } from '../utils/helpers'
import styles from './AdminScreens.module.css'

const RichTextEditor = lazy(() => import('../components/admin/RichTextEditor'))

interface BusinessEditorFormProps {
  initialValue?: BusinessAreaItem | null
  isPending: boolean
  nextOrder: number
  onCancel: () => void
  onSubmit: (payload: BusinessUpsertPayload) => Promise<void> | void
}

function getRateLabel(activeCount: number, totalCount: number) {
  if (totalCount === 0) {
    return '0%'
  }

  return `${Math.round((activeCount / totalCount) * 100)}%`
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function BusinessEditorForm({
  initialValue,
  isPending,
  nextOrder,
  onCancel,
  onSubmit,
}: BusinessEditorFormProps) {
  const { showToast } = useToast()
  const [uploadingTarget, setUploadingTarget] = useState<'icon' | 'image' | null>(null)
  const [uploadedIconId, setUploadedIconId] = useState<number | null>(null)
  const [uploadedImageId, setUploadedImageId] = useState<number | null>(null)
  const [form, setForm] = useState<BusinessUpsertPayload>({
    title: initialValue?.title ?? '',
    subtitle: initialValue?.subtitle ?? '',
    description: initialValue?.description ?? '',
    iconUrl: initialValue?.iconUrl ?? null,
    imageUrl: initialValue?.imageUrl ?? null,
    displayOrder: initialValue?.displayOrder ?? nextOrder,
    isActive: initialValue?.isActive ?? true,
  })

  const handleUpload = async (target: 'icon' | 'image', file: File) => {
    setUploadingTarget(target)

    try {
      const uploaded = await uploadImage(file)

      setForm((current) => ({
        ...current,
        iconUrl: target === 'icon' ? uploaded.filePath : current.iconUrl,
        imageUrl: target === 'image' ? uploaded.filePath : current.imageUrl,
      }))

      if (target === 'icon') {
        setUploadedIconId(uploaded.id)
      } else {
        setUploadedImageId(uploaded.id)
      }

      showToast({
        title: 'Asset uploaded',
        description:
          target === 'icon'
            ? 'The icon asset is now attached to the business area.'
            : 'The key visual asset is now attached to the business area.',
      })
    } catch (error) {
      showToast({
        title: 'Upload failed',
        description: getErrorMessage(
          error,
          'A problem occurred while uploading the image.',
        ),
        variant: 'error',
      })
    } finally {
      setUploadingTarget(null)
    }
  }

  const clearUploadedImage = async (target: 'icon' | 'image') => {
    const uploadId = target === 'icon' ? uploadedIconId : uploadedImageId

    if (uploadId) {
      try {
        await deleteUpload(uploadId)
      } catch {
        // Ignore cleanup failures for orphaned temporary uploads.
      }
    }

    if (target === 'icon') {
      setUploadedIconId(null)
    } else {
      setUploadedImageId(null)
    }

    setForm((current) => ({
      ...current,
      iconUrl: target === 'icon' ? null : current.iconUrl,
      imageUrl: target === 'image' ? null : current.imageUrl,
    }))
  }

  return (
    <form
      className={styles.formGrid}
      onSubmit={async (event) => {
        event.preventDefault()
        await onSubmit({
          ...form,
          subtitle: form.subtitle?.trim() ? form.subtitle.trim() : null,
        })
      }}
    >
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="business-title">
            Title
          </label>
          <input
            className={styles.input}
            data-testid="business-title-input"
            id="business-title"
            maxLength={120}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            required
            value={form.title}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="business-subtitle">
            Subtitle
          </label>
          <input
            className={styles.input}
            data-testid="business-subtitle-input"
            id="business-subtitle"
            maxLength={160}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                subtitle: event.target.value,
              }))
            }
            value={form.subtitle ?? ''}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Description</label>
        <div className={styles.editorWrap}>
          <Suspense
            fallback={
              <textarea
                className={styles.textarea}
                readOnly
                value="Editor loading..."
              />
            }
          >
            <RichTextEditor
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  description: value,
                }))
              }
              value={form.description}
            />
          </Suspense>
        </div>
      </div>

      <div className={styles.formRow}>
        <ImageUploadField
          helper="Upload a compact icon asset."
          label="Icon asset"
          onClear={() => void clearUploadedImage('icon')}
          onSelect={(file) => void handleUpload('icon', file)}
          testIdPrefix="business-icon"
          uploading={uploadingTarget === 'icon'}
          value={form.iconUrl}
        />
        <ImageUploadField
          helper="Upload a wide visual for detail and overview pages."
          label="Key visual"
          onClear={() => void clearUploadedImage('image')}
          onSelect={(file) => void handleUpload('image', file)}
          testIdPrefix="business-image"
          uploading={uploadingTarget === 'image'}
          value={form.imageUrl}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="business-order">
            Display order
          </label>
          <input
            className={styles.input}
            id="business-order"
            min={0}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                displayOrder: Number(event.target.value),
              }))
            }
            required
            type="number"
            value={form.displayOrder}
          />
        </div>
        <div
          className={`${styles.toggleRow} ${
            form.isActive ? styles.switchActive : ''
          }`}
        >
          <div className={styles.toggleLabel}>
            <strong>Visibility</strong>
            <span className={styles.toggleHelper}>
              Hidden business areas stay in the CMS and are removed from public listings.
            </span>
          </div>
          <label
            className={`${styles.switch} ${
              form.isActive ? styles.switchActive : ''
            }`}
          >
            <input
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
              type="checkbox"
            />
          </label>
        </div>
      </div>

      <div className={styles.modalActions}>
        <button className={styles.ghostButton} onClick={onCancel} type="button">
          Cancel
        </button>
        <button
          className={styles.primaryButton}
          data-testid="business-submit-button"
          disabled={isPending}
          type="submit"
        >
          {isPending ? 'Saving...' : 'Save area'}
        </button>
      </div>
    </form>
  )
}

function AdminBusinessPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [editingItem, setEditingItem] = useState<BusinessAreaItem | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BusinessAreaItem | null>(null)

  const adminQuery = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: getAdminMe,
  })

  const businessQuery = useQuery({
    queryKey: publicQueryKeys.business,
    queryFn: getAdminBusinessAreas,
  })

  const items = useMemo(
    () =>
      [...(businessQuery.data ?? [])].sort(
        (left, right) => left.displayOrder - right.displayOrder,
      ),
    [businessQuery.data],
  )

  const activeCount = items.filter((item) => item.isActive).length
  const hiddenCount = items.length - activeCount
  const iconCoverageCount = items.filter((item) => Boolean(item.iconUrl)).length
  const visualCoverageCount = items.filter((item) => Boolean(item.imageUrl)).length
  const contentCoverageCount = items.filter((item) => stripHtml(item.description).length > 0).length
  const latestUpdatedItem =
    [...items].sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )[0] ?? null

  const createMutation = useMutation({
    mutationFn: createBusiness,
    onSuccess: async () => {
      showToast({
        title: 'Area created',
        description: 'The business catalog is updated and ready for publishing.',
      })
      setIsCreateOpen(false)
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.business })
    },
    onError: (error) => {
      showToast({
        title: 'Create failed',
        description: getErrorMessage(
          error,
          'A problem occurred while creating the business area.',
        ),
        variant: 'error',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BusinessUpsertPayload }) =>
      updateBusiness(id, payload),
    onSuccess: async () => {
      showToast({
        title: 'Area updated',
        description: 'The business content is synced to the admin workspace.',
      })
      setEditingItem(null)
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.business })
    },
    onError: (error) => {
      showToast({
        title: 'Update failed',
        description: getErrorMessage(
          error,
          'A problem occurred while updating the business area.',
        ),
        variant: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBusiness,
    onSuccess: async () => {
      showToast({
        title: 'Area removed',
        description: 'The selected business area was removed from the registry.',
      })
      setDeleteTarget(null)
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.business })
    },
    onError: (error) => {
      showToast({
        title: 'Delete failed',
        description: getErrorMessage(
          error,
          'A problem occurred while deleting the business area.',
        ),
        variant: 'error',
      })
    },
  })

  return (
    <PageTransition>
      <Helmet>
        <title>{formatPageTitle('사업분야 관리')}</title>
        <meta
          content="관리자 사업분야 관리 페이지입니다."
          name="description"
        />
      </Helmet>
      <section
        className={styles.loginShell}
        style={{ minHeight: 'auto', paddingTop: '7rem' }}
      >
        <div className="container" style={{ width: 'var(--container-width)' }}>
          <AdminLayout
            adminName={adminQuery.data?.name}
            description="사업 카탈로그, 리치 텍스트, 아이콘과 비주얼 자산을 함께 관리합니다."
            title="사업분야 관리"
          >
            {businessQuery.isLoading ? (
              <SectionSkeleton count={3} variant="cards" />
            ) : (
              <>
                <div className={styles.metrics}>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Business Areas</span>
                    <strong className={styles.metricValue}>{items.length}</strong>
                    <span className={styles.metricMeta}>
                      운영 대상 사업분야 총 개수
                    </span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Visible Areas</span>
                    <strong className={styles.metricValue}>{activeCount}</strong>
                    <span className={styles.metricMeta}>
                      현재 대외 페이지에 공개된 항목 수
                    </span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Asset Coverage</span>
                    <strong className={styles.metricValue}>
                      {getRateLabel(visualCoverageCount, items.length)}
                    </strong>
                    <span className={styles.metricMeta}>
                      대표 이미지가 연결된 사업 카탈로그 비율
                    </span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Content Ready</span>
                    <strong className={styles.metricValue}>
                      {getRateLabel(contentCoverageCount, items.length)}
                    </strong>
                    <span className={styles.metricMeta}>
                      설명 문안이 준비된 리치 텍스트 항목 비율
                    </span>
                  </article>
                </div>

                <div className={styles.workspaceGrid}>
                  <div className={styles.workspaceMain}>
                    <section className={styles.surface}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h2 className={styles.sectionTitle}>Business catalog</h2>
                          <p className={styles.sectionLead}>
                            타이틀, 에셋, 본문 상태를 한 번에 보면서 사업 카탈로그를 관리합니다.
                          </p>
                        </div>
                        <button
                          className={styles.primaryButton}
                          data-testid="business-create-button"
                          onClick={() => setIsCreateOpen(true)}
                          type="button"
                        >
                          Add business area
                        </button>
                      </div>

                      <div className={styles.toolbarRow}>
                        <div className={styles.toolbarMeta}>
                          <span className={styles.statPill}>
                            <strong>{iconCoverageCount}</strong> icon-ready
                          </span>
                          <span className={styles.statPill}>
                            <strong>{visualCoverageCount}</strong> visual-ready
                          </span>
                          <span className={styles.statPill}>
                            <strong>{hiddenCount}</strong> hidden
                          </span>
                        </div>
                        <span className={styles.tableNote}>
                          Keep priority businesses near the top and ensure key visuals are attached.
                        </span>
                      </div>

                      <div className={styles.tableWrap}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Area</th>
                              <th>Content</th>
                              <th>Assets</th>
                              <th>Status</th>
                              <th>Order</th>
                              <th>Updated</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item) => (
                              <tr data-testid={`business-row-${item.id}`} key={item.id}>
                                <td>
                                  <div className={styles.tableLead}>
                                    <span className={styles.cellTitle}>{item.title}</span>
                                    <span className={styles.tableSubtext}>
                                      {item.subtitle || 'No subtitle configured'}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className={styles.tableSubtext}>
                                    {trimText(stripHtml(item.description) || 'No description', 96)}
                                  </span>
                                </td>
                                <td>
                                  <div className={styles.assetBadges}>
                                    <span
                                      className={`${styles.inlineBadge} ${
                                        item.iconUrl ? styles.inlineBadgeActive : ''
                                      }`}
                                    >
                                      {item.iconUrl ? 'Icon ready' : 'No icon'}
                                    </span>
                                    <span
                                      className={`${styles.inlineBadge} ${
                                        item.imageUrl ? styles.inlineBadgeActive : ''
                                      }`}
                                    >
                                      {item.imageUrl ? 'Visual ready' : 'No visual'}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span
                                    className={
                                      item.isActive ? styles.badge : styles.badgeMuted
                                    }
                                  >
                                    {item.isActive ? 'Active' : 'Hidden'}
                                  </span>
                                </td>
                                <td>{item.displayOrder}</td>
                                <td>{formatKoreanDate(item.updatedAt)}</td>
                                <td>
                                  <div className={styles.rowActions}>
                                    <button
                                      className={styles.actionButton}
                                      data-testid={`business-edit-${item.id}`}
                                      onClick={() => setEditingItem(item)}
                                      type="button"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className={styles.actionButton}
                                      data-testid={`business-delete-${item.id}`}
                                      onClick={() => setDeleteTarget(item)}
                                      type="button"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>

                  <aside className={styles.workspaceSide}>
                    <section className={styles.surface}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h2 className={styles.sectionTitle}>Asset readiness</h2>
                          <p className={styles.sectionLead}>
                            아이콘과 상세 비주얼 연결 상태를 즉시 파악합니다.
                          </p>
                        </div>
                      </div>
                      <div className={styles.statusGrid}>
                        <div className={styles.statusRow}>
                          <div>
                            <strong>Icon coverage</strong>
                            <p className={styles.small}>Items with a connected icon asset</p>
                          </div>
                          <span className={styles.statusValue}>
                            {getRateLabel(iconCoverageCount, items.length)}
                          </span>
                        </div>
                        <div className={styles.statusRow}>
                          <div>
                            <strong>Visual coverage</strong>
                            <p className={styles.small}>Items with a connected hero visual</p>
                          </div>
                          <span className={styles.statusValue}>
                            {getRateLabel(visualCoverageCount, items.length)}
                          </span>
                        </div>
                        <div className={styles.statusRow}>
                          <div>
                            <strong>Latest sync</strong>
                            <p className={styles.small}>Most recently updated business record</p>
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
                          <h2 className={styles.sectionTitle}>Priority sequence</h2>
                          <p className={styles.sectionLead}>
                            상단 노출 우선순위를 바로 확인합니다.
                          </p>
                        </div>
                      </div>
                      <div className={styles.list}>
                        {items.slice(0, 5).map((item) => (
                          <article className={styles.listItem} key={item.id}>
                            <div>
                              <strong className={styles.itemTitle}>{item.title}</strong>
                              <span className={styles.itemMeta}>
                                {item.subtitle || 'No subtitle configured'}
                              </span>
                            </div>
                            <span className={styles.badgeMuted}>#{item.displayOrder}</span>
                          </article>
                        ))}
                      </div>
                    </section>

                    <section className={styles.surface}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h2 className={styles.sectionTitle}>Publishing notes</h2>
                          <p className={styles.sectionLead}>
                            사업 소개 화면 품질을 유지하기 위한 운영 메모입니다.
                          </p>
                        </div>
                      </div>
                      <ul className={styles.noteList}>
                        <li className={styles.noteItem}>
                          <strong className={styles.noteTitle}>Lead with business value</strong>
                          <span className={styles.noteCopy}>
                            상단 우선순위 항목에는 짧은 부제와 선명한 비주얼을 먼저 갖춰주세요.
                          </span>
                        </li>
                        <li className={styles.noteItem}>
                          <strong className={styles.noteTitle}>Keep HTML lean</strong>
                          <span className={styles.noteCopy}>
                            설명문은 과도한 인라인 스타일보다 구조화된 문단 중심으로 유지하는 편이 안정적입니다.
                          </span>
                        </li>
                        <li className={styles.noteItem}>
                          <strong className={styles.noteTitle}>Hide deprecated lines</strong>
                          <span className={styles.noteCopy}>
                            종료되었거나 준비 중인 사업은 바로 삭제하지 말고 먼저 hidden 상태로 전환하세요.
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

      <Modal
        description="제목, 부제목, 리치 텍스트 설명과 비주얼 에셋을 설정합니다."
        onClose={() => setIsCreateOpen(false)}
        open={isCreateOpen}
        size="large"
        title="사업분야 추가"
      >
        <BusinessEditorForm
          isPending={createMutation.isPending}
          nextOrder={items.length + 1}
          onCancel={() => setIsCreateOpen(false)}
          onSubmit={async (payload) => {
            await createMutation.mutateAsync(payload)
          }}
        />
      </Modal>

      <Modal
        description="기존 사업분야 항목을 수정합니다."
        onClose={() => setEditingItem(null)}
        open={Boolean(editingItem)}
        size="large"
        title="사업분야 수정"
      >
        {editingItem ? (
          <BusinessEditorForm
            initialValue={editingItem}
            isPending={updateMutation.isPending}
            key={editingItem.id}
            nextOrder={editingItem.displayOrder}
            onCancel={() => setEditingItem(null)}
            onSubmit={async (payload) => {
              await updateMutation.mutateAsync({
                id: editingItem.id,
                payload,
              })
            }}
          />
        ) : null}
      </Modal>

      <Modal
        description="삭제된 사업분야는 목록과 상세 페이지에서 모두 제거됩니다."
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
        title="사업분야 삭제 확인"
      >
        <p className={styles.sectionLead}>
          {deleteTarget?.title} 항목을 정말 삭제하시겠습니까?
        </p>
        <div className={styles.modalActions}>
          <button
            className={styles.ghostButton}
            onClick={() => setDeleteTarget(null)}
            type="button"
          >
            Cancel
          </button>
          <button
            className={styles.dangerButton}
            onClick={() => {
              if (deleteTarget) {
                deleteMutation.mutate(deleteTarget.id)
              }
            }}
            type="button"
          >
            Delete
          </button>
        </div>
      </Modal>
    </PageTransition>
  )
}

export default AdminBusinessPage
