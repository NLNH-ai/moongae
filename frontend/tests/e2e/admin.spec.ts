import { expect, test, type Page } from '@playwright/test'
import { mockAdminApi } from './fixtures'

async function loginAsAdmin(page: Page) {
  await page.goto('/admin')
  await page.getByTestId('admin-username').fill('superadmin')
  await page.getByTestId('admin-password').fill('admin1234')
  await page.getByTestId('admin-login-button').click()
  await expect(page).toHaveURL(/\/admin\/dashboard$/)
}

test('admin can log in and create a history entry', async ({ page }) => {
  const fixture = await mockAdminApi(page)

  await loginAsAdmin(page)

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

test('admin login shows an error for invalid credentials', async ({ page }) => {
  await mockAdminApi(page)

  await page.goto('/admin')

  await page.getByTestId('admin-username').fill('wrong-user')
  await page.getByTestId('admin-password').fill('wrong-password')
  await page.getByTestId('admin-login-button').click()

  await expect(page).toHaveURL(/\/admin$/)
  await expect(
    page.getByText('Login failed. Check the account credentials and try again.'),
  ).toBeVisible()
})

test('authenticated admin is redirected away from the login page', async ({ page }) => {
  await mockAdminApi(page)

  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.setItem('adminAccessToken', 'mock-jwt-token')
  })

  await page.goto('/admin')

  await expect(page).toHaveURL(/\/admin\/dashboard$/)
  await expect(page.getByTestId('admin-logout-button')).toBeVisible()
})

test('login returns the admin to the originally requested route', async ({ page }) => {
  await mockAdminApi(page)

  await page.goto('/admin/history')

  await expect(page).toHaveURL(/\/admin$/)

  await page.getByTestId('admin-username').fill('superadmin')
  await page.getByTestId('admin-password').fill('admin1234')
  await page.getByTestId('admin-login-button').click()

  await expect(page).toHaveURL(/\/admin\/history$/)
  await expect(page.getByTestId('history-create-button')).toBeVisible()
})

test('logout clears the admin session and returns to the login page', async ({ page }) => {
  await mockAdminApi(page)

  await loginAsAdmin(page)

  await page.getByTestId('admin-logout-button').click()

  await expect(page).toHaveURL(/\/admin$/)
  await expect.poll(async () =>
    page.evaluate(() => window.localStorage.getItem('adminAccessToken')),
  ).toBeNull()
})

test('invalid stored token is cleared and redirected to login', async ({ page }) => {
  await mockAdminApi(page)

  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.setItem('adminAccessToken', 'stale-token')
  })

  await page.goto('/admin/dashboard')

  await expect(page).toHaveURL(/\/admin$/)
  await expect.poll(async () => {
    try {
      return await page.evaluate(() => window.localStorage.getItem('adminAccessToken'))
    } catch {
      return 'navigating'
    }
  }).toBeNull()
})

test('expired admin session returns to the original route after reauthentication', async ({
  page,
}) => {
  await mockAdminApi(page)

  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.setItem('adminAccessToken', 'stale-token')
  })

  await page.goto('/admin/dashboard')

  await expect(page).toHaveURL(/\/admin$/)

  await page.getByTestId('admin-username').fill('superadmin')
  await page.getByTestId('admin-password').fill('admin1234')
  await page.getByTestId('admin-login-button').click()

  await expect(page).toHaveURL(/\/admin\/dashboard$/)
  await expect(page.getByTestId('admin-logout-button')).toBeVisible()
})
