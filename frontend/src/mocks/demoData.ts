import type {
  BusinessAreaItem,
  CompanyProfile,
  HistoryGroup,
  PageContentItem,
  PageKey,
} from '../types/domain'
import { BRAND_EMAIL, BRAND_NAME } from '../config/branding'

const timestamp = '2026-04-08T12:00:00'

export const demoCompanyProfile: CompanyProfile = {
  id: 1,
  companyName: BRAND_NAME,
  ceoName: 'Kim Dohyun',
  establishedDate: '1998-04-08',
  address: '110 Sejong-daero, Jung-gu, Seoul',
  phone: '+82-2-1234-5678',
  email: BRAND_EMAIL,
  description:
    'This is a temporary company profile placeholder for the preview build and can be replaced with the official brand story later.',
  logoUrl: null,
  createdAt: timestamp,
  updatedAt: timestamp,
}

export const demoHistoryGroups: HistoryGroup[] = [
  {
    year: 2025,
    items: [
      {
        id: 101,
        year: 2025,
        month: 3,
        title: 'Integrated energy platform launched',
        description:
          'The company opened a new operating model that connects industrial energy optimization with digital field operations.',
        imageUrl: null,
        displayOrder: 1,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: 102,
        year: 2025,
        month: 1,
        title: 'Corporate brand renewal',
        description:
          'The company introduced a renewed brand system focused on clarity, execution, and scalable industrial growth.',
        imageUrl: null,
        displayOrder: 2,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  },
  {
    year: 2023,
    items: [
      {
        id: 103,
        year: 2023,
        month: 9,
        title: 'Smart manufacturing center established',
        description:
          'A new delivery center was created to connect plant data, site execution, and operations support.',
        imageUrl: null,
        displayOrder: 3,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  },
  {
    year: 2020,
    items: [
      {
        id: 104,
        year: 2020,
        month: 4,
        title: 'Global project delivery model expanded',
        description:
          'The business expanded its cross-functional delivery process to support overseas industrial clients.',
        imageUrl: null,
        displayOrder: 4,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  },
]

export const demoBusinessAreas: BusinessAreaItem[] = [
  {
    id: 201,
    title: 'Energy Solutions',
    subtitle: 'Sustainable industrial energy operations',
    description:
      'We design and operate energy programs that help industrial customers reduce complexity across production sites.\n\nThe portfolio spans infrastructure planning, energy analytics, and field execution support.',
    iconUrl: null,
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 202,
    title: 'Smart Manufacturing',
    subtitle: 'Connected factory execution systems',
    description:
      'We connect plant systems, site operators, and delivery teams into a unified manufacturing workflow.\n\nThis helps customers move from fragmented reporting to consistent operational action.',
    iconUrl: null,
    imageUrl: null,
    displayOrder: 2,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 203,
    title: 'Digital Operations',
    subtitle: 'Data-driven execution and service delivery',
    description:
      'We translate operational data into delivery decisions, performance dashboards, and field response workflows.\n\nThe result is a more stable execution model with faster feedback loops.',
    iconUrl: null,
    imageUrl: null,
    displayOrder: 3,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
]

export const demoPageContents: PageContentItem[] = [
  {
    id: 301,
    pageKey: 'HOME',
    sectionKey: 'hero',
    title: 'Open the next chapter of industrial innovation',
    content:
      'We build connected industrial platforms with strong execution, clear direction, and measurable operational outcomes.',
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 302,
    pageKey: 'ABOUT',
    sectionKey: 'intro',
    title: 'An integrated company built around execution',
    content:
      'The company aligns industrial technology, operational planning, and delivery systems so customers can move faster with less friction.',
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 303,
    pageKey: 'BUSINESS',
    sectionKey: 'overview',
    title: 'Business areas that move together as one system',
    content:
      'Each business area is designed to connect strategy, site execution, and customer outcomes through a unified operating model.',
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 304,
    pageKey: 'CONTACT',
    sectionKey: 'headline',
    title: 'Start a conversation',
    content:
      'Contact the team to discuss integrated industrial delivery, energy transition, and digital operations programs.',
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
]

export function getDemoPageContents(pageKey: PageKey) {
  return demoPageContents.filter((item) => item.pageKey === pageKey)
}
