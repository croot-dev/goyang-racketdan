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
