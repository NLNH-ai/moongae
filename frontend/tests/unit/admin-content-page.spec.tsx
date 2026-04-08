import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminContentPage from '../../src/pages/AdminContentPage'
import { createPageContentMap, makeAdminMe, makePageContent } from './fixtures'
import { renderWithProviders } from './renderWithProviders'

const contentState = vi.hoisted(() => ({
  itemsByPage: {
    ABOUT: [],
    BUSINESS: [],
    CONTACT: [],
    HOME: [],
  },
}))

const adminApiMocks = vi.hoisted(() => ({
  deleteUpload: vi.fn(),
  getAdminMe: vi.fn(),
  updateContent: vi.fn(),
  uploadImage: vi.fn(),
}))

const publicApiMocks = vi.hoisted(() => ({
  getPageContents: vi.fn(),
}))

vi.mock('../../src/api/admin', () => ({
  deleteUpload: adminApiMocks.deleteUpload,
  getAdminMe: adminApiMocks.getAdminMe,
  updateContent: adminApiMocks.updateContent,
  uploadImage: adminApiMocks.uploadImage,
}))

vi.mock('../../src/api/public', () => ({
  getPageContents: publicApiMocks.getPageContents,
}))

describe('AdminContentPage', () => {
  beforeEach(() => {
    contentState.itemsByPage = createPageContentMap({
      HOME: [
        makePageContent({
          id: 401,
          pageKey: 'HOME',
          sectionKey: 'hero',
          title: '혁신적인 미래',
        }),
      ],
      ABOUT: [
        makePageContent({
          id: 402,
          pageKey: 'ABOUT',
          sectionKey: 'intro',
          title: '회사 소개',
        }),
      ],
    })

    adminApiMocks.getAdminMe.mockResolvedValue(makeAdminMe())
    publicApiMocks.getPageContents.mockImplementation(async (pageKey) => {
      return contentState.itemsByPage[pageKey]
    })
    adminApiMocks.updateContent.mockImplementation(async (id, payload) => {
      const pageKey = (
        Object.keys(contentState.itemsByPage) as Array<keyof typeof contentState.itemsByPage>
      ).find((key) => contentState.itemsByPage[key].some((item) => item.id === id))

      if (!pageKey) {
        throw new Error(`Missing content item ${id}`)
      }

      const currentItem = contentState.itemsByPage[pageKey].find(
        (item) => item.id === id,
      )

      if (!currentItem) {
        throw new Error(`Missing content item ${id}`)
      }

      const updated = {
        ...currentItem,
        ...payload,
      }

      contentState.itemsByPage = {
        ...contentState.itemsByPage,
        [pageKey]: contentState.itemsByPage[pageKey].map((item) =>
          item.id === id ? updated : item,
        ),
      }

      return updated
    })
    adminApiMocks.uploadImage.mockResolvedValue({
      id: 9003,
      originalName: 'content.webp',
      storedName: 'content.webp',
      filePath: '/uploads/content.webp',
      fileSize: 4096,
      contentType: 'image/webp',
      createdAt: '2026-04-08T12:00:00',
    })
    adminApiMocks.deleteUpload.mockResolvedValue(undefined)
  })

  it('saves inline content changes for the selected page', async () => {
    const user = userEvent.setup()

    renderWithProviders(<AdminContentPage />, { route: '/admin/content' })

    const titleInput = await screen.findByTestId('content-title-input-401')
    await user.clear(titleInput)
    await user.type(titleInput, '새로운 홈 히어로 카피')
    await user.click(screen.getByTestId('content-save-401'))

    await waitFor(() => {
      expect(adminApiMocks.updateContent).toHaveBeenCalledWith(
        401,
        expect.objectContaining({
          title: '새로운 홈 히어로 카피',
        }),
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('content-title-input-401')).toHaveValue(
        '새로운 홈 히어로 카피',
      )
    })
  })

  it('uploads and clears a content image before saving', async () => {
    const user = userEvent.setup()

    renderWithProviders(<AdminContentPage />, { route: '/admin/content' })

    await screen.findByTestId('content-title-input-401')

    await user.upload(
      screen.getByTestId('content-image-401-input'),
      new File(['content-image'], 'content.webp', { type: 'image/webp' }),
    )

    await waitFor(() => {
      expect(adminApiMocks.uploadImage).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByTestId('content-image-401-image')).toHaveAttribute(
        'src',
        '/uploads/content.webp',
      )
    })

    await user.click(screen.getByTestId('content-image-401-clear-button'))

    await waitFor(() => {
      expect(adminApiMocks.deleteUpload).toHaveBeenCalled()
      expect(adminApiMocks.deleteUpload.mock.calls[0][0]).toBe(9003)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('content-image-401-image')).not.toBeInTheDocument()
    })
  })
})
