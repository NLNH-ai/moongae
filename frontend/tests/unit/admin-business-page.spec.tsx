import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminBusinessPage from '../../src/pages/AdminBusinessPage'
import { makeAdminMe, makeBusinessArea } from './fixtures'
import { renderWithProviders } from './renderWithProviders'

const businessState = vi.hoisted(() => ({
  items: [],
}))

const adminApiMocks = vi.hoisted(() => ({
  createBusiness: vi.fn(),
  deleteBusiness: vi.fn(),
  deleteUpload: vi.fn(),
  getAdminBusinessAreas: vi.fn(),
  getAdminMe: vi.fn(),
  updateBusiness: vi.fn(),
  uploadImage: vi.fn(),
}))

vi.mock('../../src/api/admin', () => ({
  createBusiness: adminApiMocks.createBusiness,
  deleteBusiness: adminApiMocks.deleteBusiness,
  deleteUpload: adminApiMocks.deleteUpload,
  getAdminBusinessAreas: adminApiMocks.getAdminBusinessAreas,
  getAdminMe: adminApiMocks.getAdminMe,
  updateBusiness: adminApiMocks.updateBusiness,
  uploadImage: adminApiMocks.uploadImage,
}))

vi.mock('../../src/components/admin/RichTextEditor', () => ({
  default: ({
    onChange,
    value,
  }: {
    onChange: (value: string) => void
    value: string
  }) => (
    <textarea
      data-testid="business-description-input"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    />
  ),
}))

describe('AdminBusinessPage', () => {
  beforeEach(() => {
    businessState.items = [
      makeBusinessArea({
        id: 301,
        title: '에너지 솔루션',
        subtitle: '친환경 인프라',
        displayOrder: 1,
      }),
    ]

    adminApiMocks.getAdminMe.mockResolvedValue(makeAdminMe())
    adminApiMocks.getAdminBusinessAreas.mockImplementation(async () => businessState.items)
    adminApiMocks.updateBusiness.mockImplementation(async (id, payload) => {
      const updated = makeBusinessArea({
        ...businessState.items.find((item) => item.id === id),
        id,
        title: payload.title,
        subtitle: payload.subtitle,
        description: payload.description,
        iconUrl: payload.iconUrl,
        imageUrl: payload.imageUrl,
        displayOrder: payload.displayOrder,
        isActive: payload.isActive,
      })

      businessState.items = businessState.items.map((item) =>
        item.id === id ? updated : item,
      )

      return updated
    })
    adminApiMocks.createBusiness.mockResolvedValue(businessState.items[0])
    adminApiMocks.deleteBusiness.mockResolvedValue(undefined)
    adminApiMocks.uploadImage.mockResolvedValue({
      id: 9002,
      originalName: 'business.webp',
      storedName: 'business.webp',
      filePath: '/uploads/business.webp',
      fileSize: 2048,
      contentType: 'image/webp',
      createdAt: '2026-04-08T12:00:00',
    })
    adminApiMocks.deleteUpload.mockResolvedValue(undefined)
  })

  it('updates an existing business area', async () => {
    const user = userEvent.setup()

    renderWithProviders(<AdminBusinessPage />, { route: '/admin/business' })

    await screen.findByTestId('business-row-301')

    await user.click(screen.getByTestId('business-edit-301'))
    await user.clear(await screen.findByTestId('business-title-input'))
    await user.type(screen.getByTestId('business-title-input'), '스마트 물류')
    await user.click(screen.getByTestId('business-submit-button'))

    await waitFor(() => {
      expect(adminApiMocks.updateBusiness).toHaveBeenCalledWith(
        301,
        expect.objectContaining({
          title: '스마트 물류',
        }),
      )
    })

    await waitFor(() => {
      expect(
        within(screen.getByTestId('business-row-301')).getByText('스마트 물류'),
      ).toBeInTheDocument()
    })
  })
})
