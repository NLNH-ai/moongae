USE `company_website`;

INSERT INTO `company_info` (
  `company_name`,
  `ceo_name`,
  `established_date`,
  `address`,
  `phone`,
  `email`,
  `description`,
  `logo_url`
) VALUES (
  '한화넥스트',
  '김도현',
  '1998-04-08',
  '서울특별시 중구 세종대로 110',
  '02-1234-5678',
  'contact@hanwha-next.co.kr',
  '한화넥스트는 에너지, 디지털 전환, 미래 제조 역량을 기반으로 산업의 다음 기준을 만드는 기업입니다.',
  '/uploads/images/logo/company-logo.svg'
);

INSERT INTO `history` (
  `year`,
  `month`,
  `title`,
  `description`,
  `image_url`,
  `display_order`,
  `is_active`
) VALUES
  (2025, 3, '미래에너지 통합 브랜드 공개', '친환경 에너지와 스마트 운영 플랫폼을 통합한 신규 브랜드를 론칭했습니다.', '/uploads/images/history/2025-brand.jpg', 1, 1),
  (2024, 10, '디지털 관제센터 개소', '국내외 사업장을 통합 모니터링하는 디지털 관제센터를 개소했습니다.', '/uploads/images/history/2024-control-center.jpg', 2, 1),
  (2022, 6, '수소 인프라 사업 진출', '차세대 수소 생산 및 저장 인프라 사업에 본격 진출했습니다.', '/uploads/images/history/2022-hydrogen.jpg', 3, 1),
  (2018, 9, '글로벌 생산 거점 확장', '동남아 및 유럽 생산 거점을 확대하며 글로벌 공급망을 강화했습니다.', '/uploads/images/history/2018-global.jpg', 4, 1),
  (2012, 1, '스마트 제조 혁신 착수', '전사 제조 라인에 스마트 팩토리 전략을 도입했습니다.', '/uploads/images/history/2012-smart-factory.jpg', 5, 1);

INSERT INTO `business_area` (
  `title`,
  `subtitle`,
  `description`,
  `icon_url`,
  `image_url`,
  `display_order`,
  `is_active`
) VALUES
  ('에너지 솔루션', '지속 가능한 에너지 포트폴리오', '태양광, ESS, 수소 기반 인프라를 결합해 산업 현장의 에너지 효율과 안정성을 높입니다.', '/uploads/icons/energy.svg', '/uploads/images/business/energy.jpg', 1, 1),
  ('스마트 제조', '데이터 중심 생산 혁신', '설비 데이터 분석과 자동화를 기반으로 생산성과 품질을 동시에 끌어올리는 스마트 제조 서비스를 제공합니다.', '/uploads/icons/manufacturing.svg', '/uploads/images/business/manufacturing.jpg', 2, 1),
  ('디지털 플랫폼', '운영 효율을 높이는 통합 서비스', '사업 운영에 필요한 데이터를 연결하고 시각화하는 B2B 플랫폼과 관제 서비스를 제공합니다.', '/uploads/icons/platform.svg', '/uploads/images/business/platform.jpg', 3, 1);

INSERT INTO `page_content` (
  `page_key`,
  `section_key`,
  `title`,
  `content`,
  `image_url`,
  `display_order`,
  `is_active`
) VALUES
  ('HOME', 'hero', '경계 없는 혁신과 한계 없는 도전으로', '새로운 역사를 열어가는 기업의 비전을 메인 비주얼에 담습니다.', '/uploads/images/content/home-hero.jpg', 1, 1),
  ('ABOUT', 'intro', '기업 소개', '한화넥스트는 변화가 빠른 시장에서 기술과 실행력을 연결해 고객의 성장을 지원합니다.', '/uploads/images/content/about-intro.jpg', 1, 1),
  ('BUSINESS', 'overview', '사업분야', '에너지, 제조, 디지털 플랫폼 영역에서 통합 사업 역량을 제공합니다.', '/uploads/images/content/business-overview.jpg', 1, 1),
  ('CONTACT', 'head-office', '본사 안내', '서울 본사를 중심으로 글로벌 거점과 긴밀하게 협업합니다.', '/uploads/images/content/contact-office.jpg', 1, 1);

INSERT INTO `admin_user` (
  `username`,
  `password`,
  `name`,
  `role`,
  `last_login_at`
) VALUES (
  'superadmin',
  '$2b$10$CKIysUDhM45xUFFwP.TTDuPrS56VbZOjkW3FozSWF.H46i2QIv5/e',
  '최고관리자',
  'SUPER_ADMIN',
  NULL
);

INSERT INTO `file_upload` (
  `original_name`,
  `stored_name`,
  `file_path`,
  `file_size`,
  `content_type`
) VALUES
  ('company-logo.svg', '3f6a6f9e-logo.svg', '/uploads/images/logo/company-logo.svg', 18234, 'image/svg+xml'),
  ('home-hero.jpg', '5c42f8b1-home-hero.jpg', '/uploads/images/content/home-hero.jpg', 483920, 'image/jpeg');
