# 고양 라켓단 (Goyang Racketdan)

[![Netlify Status](https://api.netlify.com/api/v1/badges/efee58a8-ed4f-40cd-b3d2-915fe62cb668/deploy-status)](https://app.netlify.com/projects/racketdan/deploys)

**서비스 URL**: https://racketdan.netlify.app/

## 프로젝트 개요

고양 라켓단은 테니스 동호회 회원 관리 및 커뮤니티 웹 애플리케이션입니다.

### 주요 기능

- **회원 인증**: 카카오 소셜 로그인, JWT 기반 인증
- **회원 관리**: 프로필 조회/수정, NTRP 등급 관리
- **공지사항**: 게시글 작성/조회/수정/삭제 (WYSIWYG 에디터)
- **대시보드**: 회원 정보, 최근 공지사항, 코트 예약 바로가기
- **일정 관리**: 캘린더 기반 일정 관리 (FullCalendar)

---

## 환경 정보

### 기술 스택

| 구분                 | 기술                          |
| -------------------- | ----------------------------- |
| **Framework**        | Next.js 15 (App Router)       |
| **Language**         | TypeScript 5                  |
| **Runtime**          | Node.js 24.5.0                |
| **UI Library**       | Chakra UI v3, Tailwind CSS v4 |
| **State Management** | TanStack React Query          |
| **Database**         | Neon (PostgreSQL Serverless)  |
| **Authentication**   | JWT (jose), 카카오 OAuth      |
| **Editor**           | Quill                         |
| **Calendar**         | FullCalendar                  |
| **Form**             | React Hook Form               |
| **Deployment**       | Netlify                       |

### 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요.

```env
# 데이터베이스
DATABASE_URL=

# 카카오 OAuth
NEXT_PUBLIC_KAKAO_CLIENT_SECRET=
NEXT_PUBLIC_KAKAO_REDIRECT_URI=
NEXT_PUBLIC_KAKAO_RESTAPI_KEY=

# JWT
JWT_SECRET=your-secret-key-change-this-in-production-use-long-random-string
```

> `.env.sample` 파일을 참고하여 설정하세요.

---

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.sample .env
# .env 파일을 열어 실제 값으로 수정
```

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 4. 프로덕션 빌드

```bash
npm run build
npm run start
```

### 5. 배포 (Netlify)

```bash
npm install -g netlify-cli
netlify login
netlify build
netlify deploy --prod
```

---

## 디렉토리 구조

```
src/
├── app/                          # Next.js App Router 페이지
│   ├── api/                      # API Routes
│   │   ├── auth/                 # 인증 API
│   │   └── bbs/                  # 게시판 API
│   │
│   └── auth/                     # 인증 페이지
│       └── _components/          # 인증 페이지 컴포넌트
│
├── components/                   # 공통 컴포넌트
│   ├── common/                   # 공통 UI
│   ├── layouts/                  # 레이아웃
│   └── ui/                       # Chakra UI 커스텀 컴포넌트
│
├── domains/                      # 도메인 레이어 (비즈니스 로직)
│   └── [domain]/                 # 도메인명
│       ├── [domain].model.ts     # 도메인 타입 정의
│       ├── [domain].query.ts     # 도메인 DB 접근
│       └── [domain].service.ts   # 도메인 비즈니스 로직
│
├── lib/                          # 유틸리티 및 공통 라이브러리
│   ├── *.client.ts               # 클라이언트 유틸
│   ├── *.server.ts               # 서버 유틸
│   └── hooks/                    # 커스텀 훅
│
├── constants/                    # 상수 정의
│
└── styles/                       # 전역 스타일
```

### 주요 컨벤션

- **`_components/`**: 해당 페이지에서만 사용되는 단독 컴포넌트
- **`domains/`**: Repository-Service 패턴으로 비즈니스 로직 분리
- **`.server.ts`**: 서버에서만 실행되는 코드
- **`.client.ts`**: 클라이언트에서만 실행되는 코드

---

## 아키텍처

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                       │
│              React Components, Custom Hooks                 │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP Request
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (route.ts)                     │
│         HTTP 처리, 인증 미들웨어, 에러→HTTP 상태 매핑         │
└─────────────────────────┬───────────────────────────────────┘
                          │ Function Call
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                Service Layer (*.service.ts)                 │
│          비즈니스 로직, 유효성 검증, 권한 검증                │
└─────────────────────────┬───────────────────────────────────┘
                          │ Function Call
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Query Layer (*.query.ts)                    │
│                  순수 SQL 쿼리 실행                          │
└─────────────────────────┬───────────────────────────────────┘
                          │ SQL
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL)                     │
└─────────────────────────────────────────────────────────────┘
```

### 레이어별 책임

| 레이어      | 파일             | 책임                                         |
| ----------- | ---------------- | -------------------------------------------- |
| **Client**  | React 컴포넌트   | UI 렌더링, 사용자 입력, API 호출             |
| **API**     | `route.ts`       | HTTP 요청/응답 처리, 인증 미들웨어, 쿠키 설정 |
| **Service** | `*.service.ts`   | 비즈니스 로직, 유효성 검증, 권한 검증        |
| **Query**   | `*.query.ts`     | SQL 쿼리 실행, 데이터 반환                   |
| **DB**      | PostgreSQL       | 데이터 저장                                  |

### 에러 처리 구조

Service 레이어에서 발생하는 에러는 `ServiceError` 클래스를 통해 정의되고, API 레이어에서 `handleApiError()`를 통해 HTTP 응답으로 변환됩니다.

```typescript
// Service Layer: 비즈니스 에러 발생
throw new ServiceError(ErrorCode.NOT_OWNER, '본인의 정보만 수정할 수 있습니다.')

// API Layer: 공통 에러 핸들러로 HTTP 응답 변환
return handleApiError(error, '기본 에러 메시지')
// → { error: '본인의 정보만 수정할 수 있습니다.', code: 'NOT_OWNER' }, status: 403
```

**에러 코드 → HTTP 상태 매핑**

| 에러 코드                              | HTTP 상태 |
| -------------------------------------- | --------- |
| `UNAUTHORIZED`, `TOKEN_EXPIRED`        | 401       |
| `FORBIDDEN`, `NOT_OWNER`               | 403       |
| `NOT_FOUND`, `MEMBER_NOT_FOUND`        | 404       |
| `DUPLICATE_EMAIL`, `DUPLICATE_NICKNAME`| 409       |
| `VALIDATION_ERROR`, `INVALID_INPUT`    | 400       |
| `INTERNAL_ERROR`                       | 500       |

### 데이터 흐름 예시

**회원정보 수정 요청**

```
1. Client: PUT /api/member { member_id, name, ... }
2. API: withAuth()로 인증 확인 → modifyMember() 호출
3. Service: 권한 검증 (본인 확인) → 중복 체크 → updateMember() 호출
4. Query: UPDATE SQL 실행
5. DB: 데이터 수정
6. 역순으로 결과 반환 → Client에 JSON 응답
```

---

## 기타

### 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

### 코드 스타일

- ESLint + Prettier 적용
- `.prettierrc`, `.editorconfig` 설정 파일 참고

### 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [Chakra UI v3](https://www.chakra-ui.com/)
- [Neon Database](https://neon.tech/)
- [카카오 로그인 API](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
