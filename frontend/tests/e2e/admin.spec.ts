import { expect, test } from '@playwright/test'
import { mockAdminApi } from './fixtures'

test('admin can log in and create a history entry', async ({ page }) => {
  const fixture = await mockAdminApi(page)

  await page.goto('/admin')

  await page.getByTestId('admin-username').fill('superadmin')
  await page.getByTestId('admin-password').fill('admin1234')
  await page.getByTestId('admin-login-button').click()

  await expect(page).toHaveURL(/\/admin\/dashboard$/)

  await page.goto('/admin/history')

  await page.getByTestId('history-create-button').click()
  await page.getByTestId('history-year-input').fill('2026')
  await page.getByTestId('history-month-select').selectOption('4')
  await page.getByTestId('history-title-input').fill('E2E Created History')
  await page.getByTestId('history-description-input').fill(
    'This history entry was created inside the Playwright test.',
  )
  await page.getByTestId('history-submit-button').click()

  await expect.poll(() => fixture.getHistoryItems().length).toBe(3)
  await expect(page.getByTestId('history-row-3')).toContainText('E2E Created History')
})
