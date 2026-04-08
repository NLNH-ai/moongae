import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import React, { type ReactElement } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter } from 'react-router-dom'
import { ToastProvider } from '../../src/components/common/ToastProvider'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface RenderWithProvidersOptions {
  route?: string
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: RenderWithProvidersOptions = {},
) {
  const queryClient = createTestQueryClient()

  window.history.pushState({}, 'Test Page', route)

  return {
    queryClient,
    ...render(
      <HelmetProvider>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter
              future={{
                v7_relativeSplatPath: true,
                v7_startTransition: true,
              }}
              initialEntries={[route]}
            >
              {ui}
            </MemoryRouter>
          </QueryClientProvider>
        </ToastProvider>
      </HelmetProvider>,
    ),
  }
}
