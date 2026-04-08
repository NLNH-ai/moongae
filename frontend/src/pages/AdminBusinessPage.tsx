import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { lazy, Suspense, useState } from 'react'
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
import { formatKoreanDate, formatPageTitle } from '../utils/formatters'
import styles from './AdminScreens.module.css'

const RichTextEditor = lazy(() => import('../components/admin/RichTextEditor'))

interface BusinessEditorFormProps {
  initialValue?: BusinessAreaItem | null
  isPending: boolean
  nextOrder: number
  onCancel: () => void
  onSubmit: (payload: BusinessUpsertPayload) => Promise<void> | void
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
        title: '이미지 업로드 완료',
        description:
          target === 'icon'
            ? '사업분야 아이콘이 업로드되었습니다.'
            : '대표 이미지가 업로드되었습니다.',
      })
    } catch (error) {
      showToast({
        title: '이미지 업로드 실패',
        description: getErrorMessage(error, '이미지 업로드 중 문제가 발생했습니다.'),
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
            제목
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
            부제목
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
        <label className={styles.fieldLabel}>설명</label>
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
          helper="아이콘 또는 심볼 이미지를 업로드합니다."
          label="아이콘 이미지"
          onClear={() => void clearUploadedImage('icon')}
          onSelect={(file) => void handleUpload('icon', file)}
          testIdPrefix="business-icon"
          uploading={uploadingTarget === 'icon'}
          value={form.iconUrl}
        />
        <ImageUploadField
          helper="상세 페이지 상단에 사용할 대표 이미지입니다."
          label="대표 이미지"
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
            표시 순서
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
            <strong>활성 여부</strong>
            <span className={styles.toggleHelper}>
              비활성으로 두면 목록과 상세 페이지에서 숨겨집니다.
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
          취소
        </button>
        <button
          className={styles.primaryButton}
          data-testid="business-submit-button"
          disabled={isPending}
          type="submit"
        >
          {isPending ? '저장 중...' : '저장'}
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

  const items = [...(businessQuery.data ?? [])].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  )
  const activeCount = items.filter((item) => item.isActive).length

  const createMutation = useMutation({
    mutationFn: createBusiness,
    onSuccess: async () => {
      showToast({
        title: '사업분야 등록 완료',
        description: '새 사업분야가 추가되었습니다.',
      })
      setIsCreateOpen(false)
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.business })
    },
    onError: (error) => {
      showToast({
        title: '사업분야 등록 실패',
        description: getErrorMessage(error, '사업분야 등록 중 문제가 발생했습니다.'),
        variant: 'error',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BusinessUpsertPayload }) =>
      updateBusiness(id, payload),
    onSuccess: async () => {
      showToast({
        title: '사업분야 수정 완료',
        description: '사업분야 항목이 업데이트되었습니다.',
      })
      setEditingItem(null)
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.business })
    },
    onError: (error) => {
      showToast({
        title: '사업분야 수정 실패',
        description: getErrorMessage(error, '사업분야 수정 중 문제가 발생했습니다.'),
        variant: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBusiness,
    onSuccess: async () => {
      showToast({
        title: '사업분야 삭제 완료',
        description: '선택한 사업분야 항목이 삭제되었습니다.',
      })
      setDeleteTarget(null)
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.business })
    },
    onError: (error) => {
      showToast({
        title: '사업분야 삭제 실패',
        description: getErrorMessage(error, '사업분야 삭제 중 문제가 발생했습니다.'),
        variant: 'error',
      })
    },
  })

  return (
    <PageTransition>
      <Helmet>
        <title>{formatPageTitle('사업분야 관리')}</title>
        <meta content="한화넥스트 관리자 사업분야 관리 페이지입니다." name="description" />
      </Helmet>
      <section className={styles.loginShell} style={{ minHeight: 'auto', paddingTop: '7rem' }}>
        <div className="container" style={{ width: 'var(--container-width)' }}>
          <AdminLayout
            adminName={adminQuery.data?.name}
            description="사업분야별 핵심 정보, 아이콘, 대표 이미지를 관리합니다."
            title="사업분야 관리"
          >
            {businessQuery.isLoading ? (
              <SectionSkeleton count={3} variant="cards" />
            ) : (
              <>
                <div className={styles.metrics}>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Total Areas</span>
                    <strong className={styles.metricValue}>{items.length}</strong>
                    <span className={styles.metricMeta}>등록된 사업분야 수</span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Active Areas</span>
                    <strong className={styles.metricValue}>{activeCount}</strong>
                    <span className={styles.metricMeta}>현재 공개 중인 사업분야 수</span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Last Updated</span>
                    <strong className={styles.metricValue}>
                      {items[0] ? formatKoreanDate(items[0].updatedAt) : 'N/A'}
                    </strong>
                    <span className={styles.metricMeta}>최근 수정 기준일</span>
                  </article>
                </div>

                <section className={styles.surface} style={{ marginTop: '1rem' }}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>사업분야 목록</h2>
                      <p className={styles.sectionLead}>
                        CRUD와 이미지 업로드를 포함한 전체 사업분야 관리 화면입니다.
                      </p>
                    </div>
                    <button
                      className={styles.primaryButton}
                      data-testid="business-create-button"
                      onClick={() => setIsCreateOpen(true)}
                      type="button"
                    >
                      사업분야 추가
                    </button>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Subtitle</th>
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
                              <span className={styles.cellTitle}>{item.title}</span>
                            </td>
                            <td>
                              <span className={styles.cellSubtle}>
                                {item.subtitle || '부제목 없음'}
                              </span>
                            </td>
                            <td>
                              <span className={item.isActive ? styles.badge : styles.badgeMuted}>
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
                                  수정
                                </button>
                                <button
                                  className={styles.actionButton}
                                  data-testid={`business-delete-${item.id}`}
                                  onClick={() => setDeleteTarget(item)}
                                  type="button"
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </AdminLayout>
        </div>
      </section>

      <Modal
        description="제목, 부제목, 리치 텍스트 설명과 이미지를 설정합니다."
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
        description="삭제한 사업분야는 목록과 상세 페이지에서 제거됩니다."
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
        title="사업분야 삭제 확인"
      >
        <p className={styles.sectionLead}>
          {deleteTarget?.title} 항목을 정말 삭제하시겠습니까?
        </p>
        <div className={styles.modalActions}>
          <button className={styles.ghostButton} onClick={() => setDeleteTarget(null)} type="button">
            취소
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
            삭제
          </button>
        </div>
      </Modal>
    </PageTransition>
  )
}

export default AdminBusinessPage
