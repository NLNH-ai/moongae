import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import type { HistoryUpsertPayload } from '../types/admin'
import type { HistoryEntry } from '../types/domain'
import {
  createHistory,
  deleteHistory,
  deleteUpload,
  getAdminHistoryEntries,
  getAdminMe,
  updateHistory,
  updateHistoryOrder,
  uploadImage,
} from '../api/admin'
import { adminQueryKeys, publicQueryKeys } from '../api/queryKeys'
import type { AdminDataTableColumn } from '../components/admin/AdminDataTable'
import AdminDataTable from '../components/admin/AdminDataTable'
import AdminTableToolbar from '../components/admin/AdminTableToolbar'
import ImageUploadField from '../components/admin/ImageUploadField'
import AdminLayout from '../components/admin/AdminLayout'
import Modal from '../components/common/Modal'
import PageTransition from '../components/common/PageTransition'
import SectionSkeleton from '../components/common/SectionSkeleton'
import { useToast } from '../components/common/toast-context'
import { getErrorMessage } from '../utils/errors'
import {
  formatKoreanDate,
  formatMonth,
  formatPageTitle,
} from '../utils/formatters'
import { toHistoryGroups, trimText } from '../utils/helpers'
import styles from './AdminScreens.module.css'

type HistoryStatusFilter = 'all' | 'active' | 'hidden'

interface HistoryEditorFormProps {
  initialValue?: HistoryEntry | null
  isPending: boolean
  nextOrder: number
  onCancel: () => void
  onSubmit: (payload: HistoryUpsertPayload) => Promise<void> | void
}

function getRateLabel(activeCount: number, totalCount: number) {
  if (totalCount === 0) {
    return '0%'
  }

  return `${Math.round((activeCount / totalCount) * 100)}%`
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
        title: 'Image uploaded',
        description: 'The timeline image was added to the entry.',
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
            Year
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
            Month
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
          Title
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
          Description
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
          helper="jpg, png, gif, webp / max 5MB"
          label="Timeline image"
          onClear={handleClearImage}
          onSelect={handleUpload}
          testIdPrefix="history-image"
          uploading={uploading}
          value={form.imageUrl}
        />
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="history-order">
              Display order
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
              <strong>Visibility</strong>
              <span className={styles.toggleHelper}>
                Hidden entries remain stored but are removed from the public site.
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
          Cancel
        </button>
        <button
          className={styles.primaryButton}
          data-testid="history-submit-button"
          disabled={isPending}
          type="submit"
        >
          {isPending ? 'Saving...' : 'Save entry'}
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
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<HistoryStatusFilter>('all')

  const historyFilters = useMemo(
    () => ({
      keyword: searchKeyword.trim() || undefined,
      isActive:
        statusFilter === 'all' ? undefined : statusFilter === 'active',
      page: 0,
      size: 100,
      sortBy: 'timeline' as const,
      sortDirection: 'DESC' as const,
    }),
    [searchKeyword, statusFilter],
  )

  const adminQuery = useQuery({
    queryKey: adminQueryKeys.me,
    queryFn: getAdminMe,
  })

  const historyQuery = useQuery({
    queryKey: adminQueryKeys.history(historyFilters),
    queryFn: () => getAdminHistoryEntries(historyFilters),
  })

  const entries = useMemo(() => historyQuery.data?.items ?? [], [historyQuery.data?.items])

  const yearGroups = useMemo(() => toHistoryGroups(entries), [entries])

  const createMutation = useMutation({
    mutationFn: createHistory,
    onSuccess: async () => {
      showToast({
        title: 'Entry created',
        description: 'The history timeline was updated successfully.',
      })
      setIsCreateOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'history'] })
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.history })
    },
    onError: (error) => {
      showToast({
        title: 'Create failed',
        description: getErrorMessage(
          error,
          'A problem occurred while creating the history entry.',
        ),
        variant: 'error',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: HistoryUpsertPayload }) =>
      updateHistory(id, payload),
    onSuccess: async () => {
      showToast({
        title: 'Entry updated',
        description: 'The selected timeline record is now live.',
      })
      setEditingItem(null)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'history'] })
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.history })
    },
    onError: (error) => {
      showToast({
        title: 'Update failed',
        description: getErrorMessage(
          error,
          'A problem occurred while updating the history entry.',
        ),
        variant: 'error',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteHistory,
    onSuccess: async () => {
      showToast({
        title: 'Entry removed',
        description: 'The history entry was removed from the registry.',
      })
      setDeleteTarget(null)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'history'] })
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.history })
    },
    onError: (error) => {
      showToast({
        title: 'Delete failed',
        description: getErrorMessage(
          error,
          'A problem occurred while deleting the history entry.',
        ),
        variant: 'error',
      })
    },
  })

  const orderMutation = useMutation({
    mutationFn: updateHistoryOrder,
    onSuccess: async () => {
      showToast({
        title: 'Order updated',
        description: 'The drag-and-drop sequence is synced to the workspace.',
      })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'history'] })
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.history })
    },
    onError: (error) => {
      showToast({
        title: 'Reorder failed',
        description: getErrorMessage(
          error,
          'A problem occurred while updating the display order.',
        ),
        variant: 'error',
      })
    },
  })

  const activeCount = entries.filter((entry) => entry.isActive).length
  const inactiveCount = entries.length - activeCount
  const latestYear = yearGroups[0]?.year ?? 'N/A'
  const visibilityRate = getRateLabel(activeCount, entries.length)

  const latestUpdatedEntry =
    [...entries].sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )[0] ?? null

  const canReorder = !searchKeyword.trim() && statusFilter === 'all'

  const historyColumns = useMemo<AdminDataTableColumn<HistoryEntry>[]>(
    () => [
      {
        id: 'drag',
        header: '',
        render: () => <span className={styles.dragHandle}>⋮⋮</span>,
      },
      {
        id: 'year',
        header: 'Year',
        render: (entry) => entry.year,
      },
      {
        id: 'month',
        header: 'Month',
        render: (entry) => formatMonth(entry.month),
      },
      {
        id: 'event',
        header: 'Event',
        render: (entry) => (
          <div className={styles.tableLead}>
            <span className={styles.cellTitle}>{entry.title}</span>
            <span className={styles.tableSubtext}>
              {trimText(entry.description, 96)}
            </span>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        render: (entry) => (
          <span className={entry.isActive ? styles.badge : styles.badgeMuted}>
            {entry.isActive ? 'Active' : 'Hidden'}
          </span>
        ),
      },
      {
        id: 'order',
        header: 'Order',
        render: (entry) => entry.displayOrder,
      },
      {
        id: 'updated',
        header: 'Updated',
        render: (entry) => formatKoreanDate(entry.updatedAt),
      },
      {
        id: 'action',
        header: 'Action',
        render: (entry) => (
          <div className={styles.rowActions}>
            <button
              className={styles.actionButton}
              data-testid={`history-edit-${entry.id}`}
              onClick={() => setEditingItem(entry)}
              type="button"
            >
              Edit
            </button>
            <button
              className={styles.actionButton}
              data-testid={`history-delete-${entry.id}`}
              onClick={() => setDeleteTarget(entry)}
              type="button"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [],
  )

  const handleDrop = (targetId: number) => {
    if (!canReorder || !draggingId || draggingId === targetId || orderMutation.isPending) {
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
        <meta
          content="관리자 연혁 관리 페이지입니다."
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
            description="타임라인 기록, 공개 상태, 노출 순서를 한 화면에서 통제합니다."
            title="연혁 관리"
          >
            {historyQuery.isLoading ? (
              <SectionSkeleton count={3} variant="cards" />
            ) : (
              <>
                <div className={styles.metrics}>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>History Items</span>
                    <strong className={styles.metricValue}>{entries.length}</strong>
                    <span className={styles.metricMeta}>
                      전체 등록 수와 운영 대상 레코드 수
                    </span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Visible Records</span>
                    <strong className={styles.metricValue}>{activeCount}</strong>
                    <span className={styles.metricMeta}>
                      현재 공개 중인 타임라인 항목 수
                    </span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Latest Year</span>
                    <strong className={styles.metricValue}>{latestYear}</strong>
                    <span className={styles.metricMeta}>
                      가장 최근 연혁 기준 연도
                    </span>
                  </article>
                  <article className={styles.metricCard}>
                    <span className={styles.metricLabel}>Publishing Health</span>
                    <strong className={styles.metricValue}>{visibilityRate}</strong>
                    <span className={styles.metricMeta}>
                      전체 항목 중 공개 가능한 비율
                    </span>
                  </article>
                </div>

                <div className={styles.workspaceGrid}>
                  <div className={styles.workspaceMain}>
                    <section className={styles.surface}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h2 className={styles.sectionTitle}>Timeline registry</h2>
                          <p className={styles.sectionLead}>
                            연도별 기록을 정리하고, 드래그로 노출 순서를 바로 바꿉니다.
                          </p>
                        </div>
                        <button
                          className={styles.primaryButton}
                          data-testid="history-create-button"
                          onClick={() => setIsCreateOpen(true)}
                          type="button"
                        >
                          Add history
                        </button>
                      </div>

                      <AdminTableToolbar
                        controls={[
                          {
                            id: 'history-search-input',
                            label: 'Search',
                            control: (
                              <input
                                className={styles.input}
                                data-testid="history-search-input"
                                id="history-search-input"
                                onChange={(event) => setSearchKeyword(event.target.value)}
                                placeholder="Search title or description"
                                value={searchKeyword}
                              />
                            ),
                          },
                          {
                            id: 'history-status-filter',
                            label: 'Status',
                            control: (
                              <select
                                className={styles.select}
                                data-testid="history-status-filter"
                                id="history-status-filter"
                                onChange={(event) =>
                                  setStatusFilter(event.target.value as HistoryStatusFilter)
                                }
                                value={statusFilter}
                              >
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="hidden">Hidden</option>
                              </select>
                            ),
                          },
                        ]}
                        meta={
                          <>
                            <span className={styles.statPill}>
                              <strong>{yearGroups.length}</strong> year clusters
                            </span>
                            <span className={styles.statPill}>
                              <strong>{inactiveCount}</strong> hidden items
                            </span>
                            <span className={styles.statPill}>
                              <strong>{orderMutation.isPending ? 'Saving' : 'Live'}</strong>{' '}
                              ordering mode
                            </span>
                            <span className={styles.tableNote}>
                              {canReorder
                                ? 'Drag any row and drop it on another row to reorder instantly.'
                                : 'Clear the current filters to enable drag-and-drop ordering.'}
                            </span>
                          </>
                        }
                      />

                      <AdminDataTable
                        columns={historyColumns}
                        emptyCellClassName={styles.emptyTableCell}
                        emptyState={
                          <div className={styles.emptyState}>
                            No history entries are registered in the timeline.
                          </div>
                        }
                        getRowKey={(entry) => entry.id}
                        getRowProps={(entry) => ({
                          draggable: canReorder && !orderMutation.isPending,
                          onDragOver: (event) => event.preventDefault(),
                          onDragStart: () => setDraggingId(entry.id),
                          onDrop: () => handleDrop(entry.id),
                        })}
                        getRowTestId={(entry) => `history-row-${entry.id}`}
                        rows={entries}
                        tableClassName={styles.table}
                        wrapClassName={styles.tableWrap}
                      />
                    </section>
                  </div>

                  <aside className={styles.workspaceSide}>
                    <section className={styles.surface}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h2 className={styles.sectionTitle}>Operational controls</h2>
                          <p className={styles.sectionLead}>
                            현재 게시 상태와 작업 흐름을 빠르게 점검합니다.
                          </p>
                        </div>
                      </div>
                      <div className={styles.statusGrid}>
                        <div className={styles.statusRow}>
                          <div>
                            <strong>Ordering workflow</strong>
                            <p className={styles.small}>
                              Drag-and-drop publishing order for all rows
                            </p>
                          </div>
                          <span className={styles.statusValue}>
                            {orderMutation.isPending ? 'Saving' : 'Live'}
                          </span>
                        </div>
                        <div className={styles.statusRow}>
                          <div>
                            <strong>Latest activity</strong>
                            <p className={styles.small}>
                              Most recent synced timeline update
                            </p>
                          </div>
                          <span className={styles.statusValue}>
                            {latestUpdatedEntry
                              ? formatKoreanDate(latestUpdatedEntry.updatedAt)
                              : 'N/A'}
                          </span>
                        </div>
                        <div className={styles.statusRow}>
                          <div>
                            <strong>Visibility rate</strong>
                            <p className={styles.small}>Publicly exposed record ratio</p>
                          </div>
                          <span className={styles.statusValue}>{visibilityRate}</span>
                        </div>
                      </div>
                    </section>

                    <section className={styles.surface}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h2 className={styles.sectionTitle}>Year clusters</h2>
                          <p className={styles.sectionLead}>
                            최근 연도별로 기록 분포를 확인합니다.
                          </p>
                        </div>
                      </div>
                      <div className={styles.list}>
                        {yearGroups.slice(0, 5).map((group) => (
                          <article className={styles.listItem} key={group.year}>
                            <div>
                              <strong className={styles.itemTitle}>{group.year}</strong>
                              <span className={styles.itemMeta}>
                                {trimText(group.items[0]?.title ?? 'No records', 52)}
                              </span>
                            </div>
                            <span className={styles.badgeMuted}>
                              {group.items.length} items
                            </span>
                          </article>
                        ))}
                      </div>
                    </section>

                    <section className={styles.surface}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h2 className={styles.sectionTitle}>Editing guide</h2>
                          <p className={styles.sectionLead}>
                            운영 중 자주 쓰는 기준을 고정 패널로 배치했습니다.
                          </p>
                        </div>
                      </div>
                      <ul className={styles.noteList}>
                        <li className={styles.noteItem}>
                          <strong className={styles.noteTitle}>1. Prioritize by narrative</strong>
                          <span className={styles.noteCopy}>
                            가장 최근 이벤트가 위에 오도록 유지하고, 시리즈 항목은
                            같은 연도 내에서 순서를 묶어주세요.
                          </span>
                        </li>
                        <li className={styles.noteItem}>
                          <strong className={styles.noteTitle}>2. Hide before delete</strong>
                          <span className={styles.noteCopy}>
                            임시 보관이 필요하면 삭제보다 숨김을 먼저 사용하세요.
                          </span>
                        </li>
                        <li className={styles.noteItem}>
                          <strong className={styles.noteTitle}>3. Keep image coverage lean</strong>
                          <span className={styles.noteCopy}>
                            모든 연혁에 이미지를 넣기보다, 대표 항목에만 비주얼을
                            집중하는 편이 관리 효율이 높습니다.
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
        description="연도, 월, 제목, 설명, 대표 이미지와 공개 여부를 설정합니다."
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
        description="삭제된 연혁 항목은 복구되지 않습니다."
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
        title="연혁 삭제 확인"
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
            data-testid="history-confirm-delete-button"
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

export default AdminHistoryPage
