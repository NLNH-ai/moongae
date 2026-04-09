import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminHistoryPage from '../../src/pages/AdminHistoryPage'
import { toHistoryGroups } from '../../src/utils/helpers'
import { makeAdminMe, makeHistoryEntry } from './fixtures'
import { renderWithProviders } from './renderWithProviders'

const historyState = vi.hoisted(() => ({
  entries: [],
}))

const adminApiMocks = vi.hoisted(() => ({
  createHistory: vi.fn(),
  deleteHistory: vi.fn(),
  deleteUpload: vi.fn(),
  getAdminHistoryGroups: vi.fn(),
  getAdminMe: vi.fn(),
  updateHistory: vi.fn(),
  updateHistoryOrder: vi.fn(),
  uploadImage: vi.fn(),
}))

vi.mock('../../src/api/admin', () => ({
  createHistory: adminApiMocks.createHistory,
  deleteHistory: adminApiMocks.deleteHistory,
  deleteUpload: adminApiMocks.deleteUpload,
  getAdminHistoryGroups: adminApiMocks.getAdminHistoryGroups,
  getAdminMe: adminApiMocks.getAdminMe,
  updateHistory: adminApiMocks.updateHistory,
  updateHistoryOrder: adminApiMocks.updateHistoryOrder,
  uploadImage: adminApiMocks.uploadImage,
}))

describe('AdminHistoryPage', () => {
  beforeEach(() => {
    historyState.entries = [
      makeHistoryEntry({
        id: 101,
        year: 2024,
        month: 3,
        title: '국내 생산 거점 확대',
        displayOrder: 1,
      }),
      makeHistoryEntry({
        id: 102,
        year: 2023,
        month: 11,
        title: '디지털 전환 센터 설립',
        displayOrder: 2,
      }),
    ]

    adminApiMocks.getAdminMe.mockResolvedValue(makeAdminMe())
    adminApiMocks.getAdminHistoryGroups.mockImplementation(async () =>
      toHistoryGroups(historyState.entries),
    )
    adminApiMocks.createHistory.mockImplementation(async (payload) => {
      const created = makeHistoryEntry({
        id: 103,
        year: payload.year,
        month: payload.month,
        title: payload.title,
        description: payload.description,
        imageUrl: payload.imageUrl,
        displayOrder: payload.displayOrder,
        isActive: payload.isActive,
      })

      historyState.entries = [...historyState.entries, created]
      return created
    })
    adminApiMocks.deleteHistory.mockImplementation(async (id: number) => {
      historyState.entries = historyState.entries.filter((entry) => entry.id !== id)
    })
    adminApiMocks.updateHistory.mockResolvedValue(historyState.entries[0])
    adminApiMocks.updateHistoryOrder.mockImplementation(async (items) => {
      const orderMap = new Map(
        items.map((item: { id: number; displayOrder: number }) => [
          item.id,
          item.displayOrder,
        ]),
      )

      historyState.entries = historyState.entries
        .map((entry) => ({
          ...entry,
          displayOrder: orderMap.get(entry.id) ?? entry.displayOrder,
        }))
        .sort((left, right) => left.displayOrder - right.displayOrder)

      return historyState.entries
    })
    adminApiMocks.uploadImage.mockResolvedValue({
      id: 9001,
      originalName: 'history.webp',
      storedName: 'history.webp',
      filePath: '/uploads/history.webp',
      fileSize: 1024,
      contentType: 'image/webp',
      createdAt: '2026-04-08T12:00:00',
    })
    adminApiMocks.deleteUpload.mockResolvedValue(undefined)
  })

  it('creates a history entry and refreshes the table', async () => {
    const user = userEvent.setup()

    renderWithProviders(<AdminHistoryPage />, { route: '/admin/history' })

    await screen.findByTestId('history-row-101')

    await user.click(screen.getByTestId('history-create-button'))
    await user.clear(screen.getByTestId('history-year-input'))
    await user.type(screen.getByTestId('history-year-input'), '2030')
    await user.selectOptions(screen.getByTestId('history-month-select'), '4')
    await user.type(screen.getByTestId('history-title-input'), '글로벌 혁신 센터 오픈')
    await user.type(
      screen.getByTestId('history-description-input'),
      '테스트를 위한 신규 연혁 항목입니다.',
    )
    await user.click(screen.getByTestId('history-submit-button'))

    await waitFor(() => {
      expect(adminApiMocks.createHistory).toHaveBeenCalled()
      expect(adminApiMocks.createHistory.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          year: 2030,
          month: 4,
          title: '글로벌 혁신 센터 오픈',
          description: '테스트를 위한 신규 연혁 항목입니다.',
        }),
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('history-row-103')).toBeInTheDocument()
    })

    expect(
      within(screen.getByTestId('history-row-103')).getByText('글로벌 혁신 센터 오픈'),
    ).toBeInTheDocument()
  })

  it('deletes a history entry after confirmation', async () => {
    const user = userEvent.setup()

    renderWithProviders(<AdminHistoryPage />, { route: '/admin/history' })

    await screen.findByTestId('history-row-102')

    await user.click(screen.getByTestId('history-delete-102'))
    await user.click(screen.getByTestId('history-confirm-delete-button'))

    await waitFor(() => {
      expect(adminApiMocks.deleteHistory).toHaveBeenCalled()
      expect(adminApiMocks.deleteHistory.mock.calls[0][0]).toBe(102)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('history-row-102')).not.toBeInTheDocument()
    })
  })

  it('uploads and clears a history image in the editor form', async () => {
    const user = userEvent.setup()

    renderWithProviders(<AdminHistoryPage />, { route: '/admin/history' })

    await screen.findByTestId('history-row-101')

    await user.click(screen.getByTestId('history-create-button'))
    await user.upload(
      screen.getByTestId('history-image-input'),
      new File(['history-image'], 'history.webp', { type: 'image/webp' }),
    )

    await waitFor(() => {
      expect(adminApiMocks.uploadImage).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByTestId('history-image-image')).toHaveAttribute(
        'src',
        '/uploads/history.webp',
      )
    })

    await user.click(screen.getByTestId('history-image-clear-button'))

    await waitFor(() => {
      expect(adminApiMocks.deleteUpload).toHaveBeenCalled()
      expect(adminApiMocks.deleteUpload.mock.calls[0][0]).toBe(9001)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('history-image-image')).not.toBeInTheDocument()
    })
  })

  it('reorders history rows with drag and drop', async () => {
    renderWithProviders(<AdminHistoryPage />, { route: '/admin/history' })

    const sourceRow = await screen.findByTestId('history-row-102')
    const targetRow = screen.getByTestId('history-row-101')

    fireEvent.dragStart(sourceRow)
    fireEvent.dragOver(targetRow)
    fireEvent.drop(targetRow)

    await waitFor(() => {
      expect(adminApiMocks.updateHistoryOrder).toHaveBeenCalled()
      expect(adminApiMocks.updateHistoryOrder.mock.calls[0][0]).toEqual([
        { id: 102, displayOrder: 1 },
        { id: 101, displayOrder: 2 },
      ])
    })

    await waitFor(() => {
      expect(screen.getAllByTestId(/history-row-/)[0]).toHaveAttribute(
        'data-testid',
        'history-row-102',
      )
    })
  })
})
