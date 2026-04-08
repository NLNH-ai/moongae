import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import type { HistoryUpsertPayload } from '../types/admin'
import type { HistoryEntry } from '../types/domain'
import {
  createHistory,
  deleteHistory,
  deleteUpload,
  getAdminMe,
  updateHistory,
  updateHistoryOrder,
  uploadImage,
} from '../api/admin'
import { publicQueryKeys } from '../api/queryKeys'
import { getHistoryGroups } from '../api/public'
import ImageUploadField from '../components/admin/ImageUploadField'
import AdminLayout from '../components/admin/AdminLayout'
import Modal from '../components/common/Modal'
import PageTransition from '../components/common/PageTransition'
import SectionSkeleton from '../components/common/SectionSkeleton'
import { useToast } from '../components/common/toast-context'
import { getErrorMessage } from '../utils/errors'
import { formatMonth, formatPageTitle } from '../utils/formatters'
import { flattenHistoryGroups, toHistoryGroups } from '../utils/helpers'
import styles from './AdminScreens.module.css'

interface HistoryEditorFormProps {
  initialValue?: HistoryEntry | null
  isPending: boolean
  nextOrder: number
  onCancel: () => void
  onSubmit: (payload: HistoryUpsertPayload) => Promise<void> | void
}

function HistoryEditorForm({
  initialValue,
  isPending,
  nextOrder,
  onCancel,
  onSubmit,
}: HistoryEditorFormProps) {
  const { showToast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [uploadedImageId, setUploadedImageId] = useState<number | null>(null)
  const [form, setForm] = useState<HistoryUpsertPayload>({
    year: initialValue?.year ?? new Date().getFullYear(),
    month: initialValue?.month ?? 1,
    title: initialValue?.title ?? '',
    description: initialValue?.description ?? '',
    imageUrl: initialValue?.imageUrl ?? null,
    displayOrder: initialValue?.displayOrder ?? nextOrder,
    isActive: initialValue?.isActive ?? true,
  })

  const handleUpload = async (file: File) => {
    setUploading(true)

    try {
      const uploaded = await uploadImage(file)
      setForm((current) => ({
        ...current,
        imageUrl: uploaded.filePath,
      }))
      setUploadedImageId(uploaded.id)
      showToast({
        title: '이미지 업로드 완료',
        description: '연혁 이미지가 업로드되었습니다.',
      })
    } catch (error) {
      showToast({
        title: '이미지 업로드 실패',
        description: getErrorMessage(error, '이미지 업로드 중 문제가 발생했습니다.'),
        variant: 'error',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleClearImage = async () => {
    if (uploadedImageId) {
      try {
        await deleteUpload(uploadedImageId)
      } catch {
        // Keep the form responsive even if temporary cleanup fails.
      }
    }

    setUploadedImageId(null)
    setForm((current) => ({
      ...current,
      imageUrl: null,
    }))
  }

  return (
    <form
      className={styles.formGrid}
      onSubmit={async (event) => {
        event.preventDefault()
        await onSubmit(form)
      }}
    >
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="history-year">
            연도
          </label>
          <input
            className={styles.input}
            data-testid="history-year-input"
            id="history-year"
            max={2100}
            min={1900}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                year: Number(event.target.value),
              }))
            }
            required
            type="number"
            value={form.year}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="history-month">
            월
          </label>
          <select
            className={styles.select}
            data-testid="history-month-select"
            id="history-month"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                month: Number(event.target.value),
              }))
            }
            value={form.month}
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}월
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="history-title">
          제목
        </label>
        <input
          className={styles.input}
          data-testid="history-title-input"
          id="history-title"
          maxLength={150}
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
        <label className={styles.fieldLabel} htmlFor="history-description">
          설명
        </label>
        <textarea
          className={styles.textarea}
          data-testid="history-description-input"
          id="history-description"
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          required
          value={form.description}
        />
      </div>

      <div className={styles.formRow}>
        <ImageUploadField
          helper="jpg, png, gif, webp / 최대 5MB"
          label="연혁 이미지"
          onClear={handleClearImage}
          onSelect={handleUpload}
          testIdPrefix="history-image"
          uploading={uploading}
          value={form.imageUrl}
        />
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="history-order">
              표시 순서
            </label>
            <input
              className={styles.input}
              id="history-order"
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
                비활성으로 두면 사이트에 노출되지 않습니다.
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
      </div>

      <div className={styles.modalActions}>
        <button className={styles.ghostButton} onClick={onCancel} type="button">
          취소
        </button>
        <button
          className={styles.primaryButton}
          data-testid="history-submit-button"
          disabled={isPending}
          type="submit"
        >
          {isPending ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  )
}

function AdminHistoryPage() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [editingItem, setEditingItem] = useState<HistoryEntry | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<HistoryEntry | null>(null)
  const [draggingId, setDraggingId] = useState<number | null>(null)

  const adminQuery = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: getAdminMe,
  })

  const historyQuery = useQuery({
    queryKey: publicQueryKeys.history,
    queryFn: getHistoryGroups,
  })

  const entries = flattenHistoryGroups(historyQuery.data ?? []).sort(
    (left, right) => left.displayOrder - right.displayOrder,
  )

  const createMutation = useMutation({
    mutationFn: createHistory,
    onSuccess: async () => {
      showToast({
        title: '연혁 등록 완료',
        description: '새 연혁 항목이 추가되었습니다.',
      })
      setIsCreateOpen(false)
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.history })
    },
    onError: (error) => {
      showToast({
        title: '연혁 등록 실패',
        description: getErrorMessage(error, '연혁 등록 중 문제가 발생했습니다.'),
        variant: 'error',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: HistoryUpsertPayload }) =>
      updateHistory(id, payload),
    onSuccess: async () => {
      showToast({
        title: '연혁 수정 완료',
        description: '연혁 항목이 업데이트되었습니다.',
      })
      setEditingItem(null)
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.history })
    },
    onError: (error) => {
      showToast({
        title: '연혁 수정 실패',
        description: getErrorMessage(error, '연혁 수정 중 문제가 발생했습니다.'),
        variant: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteHistory,
    onSuccess: async () => {
      showToast({
        title: '연혁 삭제 완료',
        description: '선택한 연혁 항목이 삭제되었습니다.',
      })
      setDeleteTarget(null)
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.history })
    },
    onError: (error) => {
      showToast({
        title: '연혁 삭제 실패',
        description: getErrorMessage(error, '연혁 삭제 중 문제가 발생했습니다.'),
        variant: 'error',
      })
    },
  })

  const orderMutation = useMutation({
    mutationFn: updateHistoryOrder,
    onSuccess: async (data) => {
      queryClient.setQueryData(publicQueryKeys.history, toHistoryGroups(data))
      showToast({
        title: '순서 변경 완료',
        description: '드래그앤드롭 결과가 저장되었습니다.',
      })
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.history })
    },
    onError: (error) => {
      showToast({
        title: '순서 변경 실패',
        description: getErrorMessage(error, '연혁 순서 저장 중 문제가 발생했습니다.'),
        variant: 'error',
      })
    },
  })

  const activeCount = entries.filter((entry) => entry.isActive).length
  const latestYear =
    entries.length > 0 ? Math.max(...entries.map((entry) => entry.year)) : 'N/A'

  const handleDrop = (targetId: number) => {
    if (!draggingId || draggingId === targetId || orderMutation.isPending) {
      setDraggingId(null)
      return
    }

    const sourceIndex = entries.findIndex((entry) => entry.id === draggingId)
    const targetIndex = entries.findIndex((entry) => entry.id === targetId)

    if (sourceIndex < 0 || targetIndex < 0) {
      setDraggingId(null)
      return
    }

    const reordered = [...entries]
    const [movedItem] = reordered.splice(sourceIndex, 1)
    reordered.splice(targetIndex, 0, movedItem)

    orderMutation.mutate(
      reordered.map((entry, index) => ({
        id: entry.id,
        displayOrder: index + 1,
      })),
    )
    setDraggingId(null)
  }

  return (
    <PageTransition>
      <Helmet>
        <title>{formatPageTitle('연혁 관리')}</title>
        <meta content="한화넥스트 관리자 연혁 관리 페이지입니다." name="description" />
      </Helmet>
      <section className={styles.loginShell} style={{ minHeight: 'auto', paddingTop: '7rem' }}>
        <div className="container" style={{ width: 'var(--container-width)' }}>
          <AdminLayout
            adminName={adminQuery.data?.name}
            description="연혁 데이터를 표 형식으로 관리하고 드래그앤드롭으로 순서를 변경합니다."
            title="연혁 관리"
          >
            {historyQuery.isLoading ? (
              <SectionSkeleton count={3} variant="cards" />
            ) : (
              <>
                <div className={styles.metrics}>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Total Entries</span>
                    <strong className={styles.metricValue}>{entries.length}</strong>
                    <span className={styles.metricMeta}>등록된 연혁 전체 수</span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Active Entries</span>
                    <strong className={styles.metricValue}>{activeCount}</strong>
                    <span className={styles.metricMeta}>현재 노출 중인 연혁 수</span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Latest Year</span>
                    <strong className={styles.metricValue}>{latestYear}</strong>
                    <span className={styles.metricMeta}>가장 최근 기준 연도</span>
                  </article>
                </div>

                <section className={styles.surface} style={{ marginTop: '1rem' }}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>연혁 목록</h2>
                      <p className={styles.sectionLead}>
                        추가, 수정, 삭제와 함께 행을 끌어 순서를 변경할 수 있습니다.
                      </p>
                    </div>
                    <button
                      className={styles.primaryButton}
                      data-testid="history-create-button"
                      onClick={() => setIsCreateOpen(true)}
                      type="button"
                    >
                      연혁 추가
                    </button>
                  </div>
                  <p className={styles.dragHint}>
                    순서 변경은 왼쪽 핸들을 잡아 원하는 위치에 놓으면 바로 저장됩니다.
                  </p>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th />
                          <th>Year</th>
                          <th>Month</th>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Order</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry) => (
                          <tr
                            data-testid={`history-row-${entry.id}`}
                            draggable={!orderMutation.isPending}
                            key={entry.id}
                            onDragOver={(event) => event.preventDefault()}
                            onDragStart={() => setDraggingId(entry.id)}
                            onDrop={() => handleDrop(entry.id)}
                          >
                            <td>
                              <span className={styles.dragHandle}>⋮⋮</span>
                            </td>
                            <td>{entry.year}</td>
                            <td>{formatMonth(entry.month)}</td>
                            <td>
                              <span className={styles.cellTitle}>{entry.title}</span>
                              <span className={styles.cellSubtle}>{entry.description}</span>
                            </td>
                            <td>
                              <span className={entry.isActive ? styles.badge : styles.badgeMuted}>
                                {entry.isActive ? 'Active' : 'Hidden'}
                              </span>
                            </td>
                            <td>{entry.displayOrder}</td>
                            <td>
                              <div className={styles.rowActions}>
                                <button
                                  className={styles.actionButton}
                                  data-testid={`history-edit-${entry.id}`}
                                  onClick={() => setEditingItem(entry)}
                                  type="button"
                                >
                                  수정
                                </button>
                                <button
                                  className={styles.actionButton}
                                  data-testid={`history-delete-${entry.id}`}
                                  onClick={() => setDeleteTarget(entry)}
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
        description="연도, 월, 제목, 설명, 이미지와 활성 여부를 설정합니다."
        onClose={() => setIsCreateOpen(false)}
        open={isCreateOpen}
        title="연혁 추가"
      >
        <HistoryEditorForm
          isPending={createMutation.isPending}
          nextOrder={entries.length + 1}
          onCancel={() => setIsCreateOpen(false)}
          onSubmit={async (payload) => {
            await createMutation.mutateAsync(payload)
          }}
        />
      </Modal>

      <Modal
        description="기존 연혁 항목을 수정합니다."
        onClose={() => setEditingItem(null)}
        open={Boolean(editingItem)}
        title="연혁 수정"
      >
        {editingItem ? (
          <HistoryEditorForm
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
        description="삭제한 연혁 항목은 복구되지 않습니다."
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
        title="연혁 삭제 확인"
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
            data-testid="history-confirm-delete-button"
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

export default AdminHistoryPage
