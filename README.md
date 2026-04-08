# Company Website Monorepo

한화 스타일의 기업 브랜딩 사이트를 목표로 하는 초기 스캐폴드입니다.

## 구조

- `frontend/`: Vite + React + TypeScript 프론트엔드
- `backend/`: Java 17 + Spring Boot + Gradle 백엔드
- `database/mysql/`: MySQL 스키마와 샘플 데이터
- `infra/`: Nginx, systemd, 배포 스크립트용 디렉터리

## 현재 포함 범위

- 프로젝트 기본 구조 생성
- MySQL DDL / seed SQL
- 핵심 JPA 엔티티 및 Repository
- 기본 보안 / CORS / Swagger 설정 뼈대
- 프론트엔드 공통 레이아웃과 홈 화면 초기 UI

## 다음 단계

1. 관리자 인증과 JWT 구현
2. 공개 / 관리자 REST API 구현
3. 상세 서브 페이지와 관리자 화면 확장
4. 배포 인프라 설정 추가
