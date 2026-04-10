import type { HeaderMenuSection } from '../types/navigation'

export const headerMenuSections: HeaderMenuSection[] = [
  {
    id: 'about',
    label: '\uadf8\ub8f9\uc18c\uac1c',
    href: '/about',
    matchPaths: ['/about'],
    summary: 'Company overview and history.',
    children: [
      {
        id: 'about-overview',
        label: '\uae30\uc5c5 \uc18c\uac1c',
        href: '/about',
      },
      {
        id: 'about-ceo',
        label: 'CEO \uc778\uc0ac\ub9d0',
        href: '/about/ceo',
      },
      {
        id: 'about-history',
        label: '\uae30\uc5c5 \uc5f0\ud601',
        href: '/about/history',
      },
    ],
  },
  {
    id: 'business',
    label: '\uc0ac\uc5c5\ubd84\uc57c',
    href: '/business',
    matchPaths: ['/business'],
    summary: 'Business portfolio and flagship solutions.',
    children: [
      {
        id: 'business-overview',
        label: '\uc0ac\uc5c5 \ubaa9\ub85d',
        href: '/business',
      },
      {
        id: 'business-energy',
        label: '\uc5d0\ub108\uc9c0 \uc194\ub8e8\uc158',
        href: '/business/1',
      },
      {
        id: 'business-digital',
        label: '\ub514\uc9c0\ud138 \ud50c\ub7ab\ud3fc',
        href: '/business/3',
      },
    ],
  },
  {
    id: 'news',
    label: '\ub274\uc2a4\ub8f8',
    href: '/about/history',
    matchPaths: [],
    summary: 'Updates and brand stories.',
    children: [
      {
        id: 'news-updates',
        label: '\uc8fc\uc694 \uc5c5\ub370\uc774\ud2b8',
        href: '/about/history',
      },
      {
        id: 'news-brand',
        label: '\ube0c\ub79c\ub4dc \uc2a4\ud1a0\ub9ac',
        href: '/about',
      },
      {
        id: 'news-notice',
        label: '\uacf5\uc2dd \uc18c\uc2dd',
        href: '/about/ceo',
      },
    ],
  },
  {
    id: 'careers',
    label: '\uc778\uc7ac\ucc44\uc6a9',
    href: '/about',
    matchPaths: [],
    summary: 'Careers and workplace culture.',
    children: [
      {
        id: 'careers-guide',
        label: '\ucc44\uc6a9 \uc548\ub0b4',
        href: '/about',
      },
      {
        id: 'careers-culture',
        label: '\uc870\uc9c1 \ubb38\ud654',
        href: '/about/ceo',
      },
      {
        id: 'careers-benefit',
        label: '\ubcf5\ub9ac\ud6c4\uc0dd',
        href: '/about/history',
      },
    ],
  },
]
