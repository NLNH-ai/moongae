import { expect, test } from '@playwright/test'
import { mockPublicApi } from './fixtures'

test('public pages render home content and navigate to business detail', async ({ page }) => {
  await mockPublicApi(page)

  await page.goto('/')

  await expect(page.getByTestId('home-page')).toBeVisible()
  await expect(page.getByTestId('hero-section')).toBeVisible()
  await expect(page.getByTestId('site-logo')).toBeVisible()
  await expect(page.getByTestId('business-card-1')).toBeVisible()

  await page.getByTestId('business-card-1').click()

  await expect(page).toHaveURL(/\/business\/1$/)
  await expect(page.getByRole('heading', { name: 'Energy Solutions' })).toBeVisible()
})
