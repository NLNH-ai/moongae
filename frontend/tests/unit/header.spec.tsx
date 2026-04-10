import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it } from 'vitest'
import Header from '../../src/components/common/Header'
import { renderWithProviders } from './renderWithProviders'

describe('Header', () => {
  it('keeps the correct top-level section active for nested routes', () => {
    renderWithProviders(<Header />, { route: '/about/history' })

    expect(
      screen.getByRole('button', { name: '\uadf8\ub8f9\uc18c\uac1c' }),
    ).toHaveAttribute('data-active', 'true')
  })

  it('opens the desktop mega menu from a primary trigger', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Header />, { route: '/' })

    await user.hover(screen.getByRole('button', { name: '\uc0ac\uc5c5\ubd84\uc57c' }))

    expect(screen.getByTestId('desktop-mega-menu')).toHaveAttribute('data-open', 'true')
    expect(
      screen.getByRole('link', { name: '\uc0ac\uc5c5 \ubaa9\ub85d' }),
    ).toBeInTheDocument()
  })

  it('opens the mobile drawer and expands a section', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Header />, { route: '/' })

    await user.click(screen.getByLabelText('\uba54\ub274 \uc5f4\uae30'))

    expect(screen.getByTestId('mobile-menu-drawer')).toHaveAttribute('data-open', 'true')

    expect(
      screen.getByText((_, element) => element?.textContent === '\uadf8\ub8f9\uc18c\uac1c \uc804\uccb4 \ubcf4\uae30'),
    ).toBeInTheDocument()
  })
})
