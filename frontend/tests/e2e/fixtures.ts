import type { Page, Route } from '@playwright/test'

interface ApiEnvelope<T> {
  success: boolean
  data: T
  message: string
  timestamp: string
}

function respond<T>(route: Route, data: T, message = 'ok') {
  const body: ApiEnvelope<T> = {
    success: true,
    data,
    message,
    timestamp: '2026-04-08T12:00:00',
  }

  return route.fulfill({
    contentType: 'application/json',
    status: 200,
    body: JSON.stringify(body),
  })
}

export function publicFixtureData() {
  const company = {
    id: 1,
    companyName: 'COMPANY LOGO',
    ceoName: 'Kim Dohyun',
    establishedDate: '1998-04-08',
    address: 'Seoul, Korea',
    phone: '02-1234-5678',
    email: 'contact@example.com',
    description: 'Integrated industrial platform company.',
    logoUrl: null,
    createdAt: '2026-04-08T12:00:00',
    updatedAt: '2026-04-08T12:00:00',
  }

  const hero = {
    id: 101,
    pageKey: 'HOME',
    sectionKey: 'hero',
    title: 'Hero',
    content: 'Delivering connected execution for energy, manufacturing, and digital operations.',
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: '2026-04-08T12:00:00',
    updatedAt: '2026-04-08T12:00:00',
  }

  const history = [
    {
      year: 2025,
      items: [
        {
          id: 1,
          year: 2025,
          month: 3,
          title: 'Future energy brand launch',
          description: 'Unified operations brand for new industrial programs.',
          imageUrl: null,
          displayOrder: 1,
          isActive: true,
          createdAt: '2026-04-08T12:00:00',
          updatedAt: '2026-04-08T12:00:00',
        },
      ],
    },
    {
      year: 2024,
      items: [
        {
          id: 2,
          year: 2024,
          month: 10,
          title: 'Operations control center opened',
          description: 'Integrated monitoring platform for domestic sites.',
          imageUrl: null,
          displayOrder: 2,
          isActive: true,
          createdAt: '2026-04-08T12:00:00',
          updatedAt: '2026-04-08T12:00:00',
        },
      ],
    },
  ]

  const business = [
    {
      id: 1,
      title: 'Energy Solutions',
      subtitle: 'Sustainable transition portfolio',
      description: 'Energy solutions for renewable operations and storage.',
      iconUrl: null,
      imageUrl: null,
      displayOrder: 1,
      isActive: true,
      createdAt: '2026-04-08T12:00:00',
      updatedAt: '2026-04-08T12:00:00',
    },
    {
      id: 2,
      title: 'Smart Manufacturing',
      subtitle: 'Factory intelligence and automation',
      description: 'Operational intelligence for production sites.',
      iconUrl: null,
      imageUrl: null,
      displayOrder: 2,
      isActive: true,
      createdAt: '2026-04-08T12:00:00',
      updatedAt: '2026-04-08T12:00:00',
    },
    {
      id: 3,
      title: 'Digital Platform',
      subtitle: 'Connected operating system',
      description: 'Platform services that tie data and field operations together.',
      iconUrl: null,
      imageUrl: null,
      displayOrder: 3,
      isActive: true,
      createdAt: '2026-04-08T12:00:00',
      updatedAt: '2026-04-08T12:00:00',
    },
  ]

  const contents = {
    HOME: [hero],
    ABOUT: [
      {
        id: 201,
        pageKey: 'ABOUT',
        sectionKey: 'intro',
        title: 'Company Intro',
        content: 'About page content.',
        imageUrl: null,
        displayOrder: 1,
        isActive: true,
        createdAt: '2026-04-08T12:00:00',
        updatedAt: '2026-04-08T12:00:00',
      },
    ],
    BUSINESS: [
      {
        id: 301,
        pageKey: 'BUSINESS',
        sectionKey: 'overview',
        title: 'Business Overview',
        content: 'Business page summary content.',
        imageUrl: null,
        displayOrder: 1,
        isActive: true,
        createdAt: '2026-04-08T12:00:00',
        updatedAt: '2026-04-08T12:00:00',
      },
    ],
    CONTACT: [
      {
        id: 401,
        pageKey: 'CONTACT',
        sectionKey: 'office',
        title: 'Head Office',
        content: 'Contact content.',
        imageUrl: null,
        displayOrder: 1,
        isActive: true,
        createdAt: '2026-04-08T12:00:00',
        updatedAt: '2026-04-08T12:00:00',
      },
    ],
  }

  return { business, company, contents, hero, history }
}

export async function mockPublicApi(page: Page) {
  const fixture = publicFixtureData()

  await page.route('**/*', async (route) => {
    const { pathname } = new URL(route.request().url())

    if (!pathname.startsWith('/api/')) {
      return route.continue()
    }

    if (pathname === '/api/company') {
      return respond(route, fixture.company)
    }

    if (pathname === '/api/history') {
      return respond(route, fixture.history)
    }

    if (pathname === '/api/business') {
      return respond(route, fixture.business)
    }

    if (pathname === '/api/business/1') {
      return respond(route, fixture.business[0])
    }

    if (pathname === '/api/business/2') {
      return respond(route, fixture.business[1])
    }

    if (pathname === '/api/business/3') {
      return respond(route, fixture.business[2])
    }

    if (pathname === '/api/content/HOME/hero') {
      return respond(route, fixture.hero)
    }

    if (pathname === '/api/content/ABOUT/intro') {
      return respond(route, fixture.contents.ABOUT[0])
    }

    if (pathname === '/api/content/BUSINESS/overview') {
      return respond(route, fixture.contents.BUSINESS[0])
    }

    if (pathname === '/api/content/HOME') {
      return respond(route, fixture.contents.HOME)
    }

    if (pathname === '/api/content/ABOUT') {
      return respond(route, fixture.contents.ABOUT)
    }

    if (pathname === '/api/content/BUSINESS') {
      return respond(route, fixture.contents.BUSINESS)
    }

    if (pathname === '/api/content/CONTACT') {
      return respond(route, fixture.contents.CONTACT)
    }

    return route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        message: `Unhandled mock path: ${pathname}`,
      }),
    })
  })

  return fixture
}

export async function mockAdminApi(page: Page) {
  const fixture = publicFixtureData()
  let historyItems = fixture.history.flatMap((group) => group.items)

  await page.route('**/*', async (route) => {
    const request = route.request()
    const { pathname } = new URL(request.url())
    const method = request.method()

    if (!pathname.startsWith('/api/')) {
      return route.continue()
    }

    if (pathname === '/api/admin/login' && method === 'POST') {
      return respond(route, {
        accessToken: 'mock-jwt-token',
        tokenType: 'Bearer',
        expiresIn: 86400000,
        admin: {
          id: 1,
          username: 'superadmin',
          name: 'Admin User',
          role: 'SUPER_ADMIN',
          lastLoginAt: '2026-04-08T12:00:00',
          createdAt: '2026-04-08T12:00:00',
        },
      })
    }

    if (pathname === '/api/admin/me') {
      return respond(route, {
        id: 1,
        username: 'superadmin',
        name: 'Admin User',
        role: 'SUPER_ADMIN',
        lastLoginAt: '2026-04-08T12:00:00',
        createdAt: '2026-04-08T12:00:00',
      })
    }

    if (pathname === '/api/admin/history' && method === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}')
      const created = {
        id: historyItems.length + 1,
        createdAt: '2026-04-08T12:00:00',
        updatedAt: '2026-04-08T12:00:00',
        ...body,
      }
      historyItems = [...historyItems, created]
      return respond(route, created, 'created')
    }

    if (pathname === '/api/history') {
      const grouped = historyItems
        .sort((left, right) => right.year - left.year || left.displayOrder - right.displayOrder)
        .reduce<Array<{ year: number; items: typeof historyItems }>>((accumulator, entry) => {
          const current = accumulator.find((group) => group.year === entry.year)

          if (current) {
            current.items.push(entry)
          } else {
            accumulator.push({ year: entry.year, items: [entry] })
          }

          return accumulator
        }, [])

      return respond(route, grouped)
    }

    if (pathname === '/api/business') {
      return respond(route, fixture.business)
    }

    if (pathname === '/api/content/HOME') {
      return respond(route, fixture.contents.HOME)
    }

    if (pathname === '/api/content/ABOUT') {
      return respond(route, fixture.contents.ABOUT)
    }

    if (pathname === '/api/content/BUSINESS') {
      return respond(route, fixture.contents.BUSINESS)
    }

    if (pathname === '/api/content/CONTACT') {
      return respond(route, fixture.contents.CONTACT)
    }

    return route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        message: `Unhandled mock path: ${pathname}`,
      }),
    })
  })

  return {
    getHistoryItems: () => historyItems,
  }
}
