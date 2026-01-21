# Backend Code Convention

## 1. 기본 코드 스타일

### 1.1 ESLint + Prettier

- 본 프로젝트는 **ESLint + Prettier**를 사용하여 코드 스타일을 통일한다.
- 모든 코드는 저장 시 자동 포맷팅되는 것을 전제로 한다.

### 1.2 설정 파일

- `.prettierrc`
- `.editorconfig`

위 설정 파일을 **임의로 수정하지 않는다**.  
스타일 변경이 필요할 경우 반드시 팀 합의를 거친다.

---

## 2. 레이어드 아키텍처 규칙

본 프로젝트는 아래 레이어 구조를 따른다.

```markdown
API Layer (route.ts)
|
▼
Service Layer (\*.service.ts)
|
▼
Repository Layer (\*.repository.ts)
|
▼
Query Layer (\*.query.ts)
|
▼
Database (PostgreSQL)
```

각 레이어는 자신의 책임을 벗어나는 로직을 포함하지 않는다.

---

## 3. API Layer Convention

### 3.1 책임

- HTTP 요청/응답 처리
- 인증 / 인가 미들웨어 적용
- Request Validation
- 에러 → HTTP Status 매핑
- 비즈니스 로직 작성 금지

### 3.2 메소드 네이밍 규칙

API Layer의 메소드는 반드시 `Handler` 접미사를 사용한다.

#### 허용 접두어

- `get*Handler`
- `register*Handler`
- `modify*Handler`
- `delete*Handler`

#### 예시

```ts
getMemberHandler
registerMemberHandler
modifyMemberProfileHandler
deleteMemberHandler
```

### 3.3 수정(modify) 관련 규칙 (중요)

- `modify` 메소드는 **반드시 수정 대상을 명시한다**

❌ 금지

```tsx
modifyMemberHandler
```

✅ 허용

```tsx
modifyMemberProfileHandler
modifyMemberStatusHandler
modifyMemberPasswordHandler
```

---

## 4. Service Layer Convention

### 4.1 책임

- 비즈니스 로직
- 유즈케이스 단위 처리
- 권한 및 정책 검증
- 트랜잭션 관리
- 도메인 상태 변경

### 4.2 메소드 네이밍 규칙

- **동사 + 도메인**
- HTTP / DB / SQL 개념 사용 금지

### 허용 접두어

- `get*`
- `register*`
- `assign*`
- `change*`

### 예시

```tsx
getMemberDetail
registerMember
assignRoleToMember
changeMemberStatus
changeMemberPassword
```

❌ 금지

```tsx
patchMember
updateMemberRow
selectMember
```

---

## 5. Repository Layer Convention

### 5.1 책임

- 도메인 엔티티 단위의 영속성 관리
- DB 구현 세부사항 은닉
- 비즈니스 판단 금지

### 5.2 메소드 네이밍 규칙

Repository는 **엔티티 기준 네이밍**을 사용한다.

### 허용 접두어

- `find*`
- `save*`
- `exists*`
- `delete*`

### 예시

```tsx
findById
findByEmail
existsById
save(member)
deleteById
```

### 5.3 수정(update) 관련 규칙

- 기본적으로 수정은 `save(entity)` 로 처리한다.
- 엔티티를 로드하지 않는 최적화 케이스에 한해 `update*By*` 허용

✅ 허용

```tsx
save(member)
updateStatusById(memberId, status)
```

❌ 금지

```tsx
updateMemberProfile
modifyMember
patchMember
```

---

## 6. Query Layer Convention

### 6.1 책임

- 순수 SQL 실행
- Row 단위 데이터 반환
- 도메인 의미 사용 금지

### 6.2 메소드 네이밍 규칙

Query Layer는 **SQL 동사 기반 네이밍**을 사용한다.

### 허용 접두어

- `select*`
- `insert*`
- `update*`
- `delete*`

### 예시

```tsx
selectMemberById
selectMembersByStatus
insertMember
updateMemberStatusById
deleteMemberById
```

### 6.3 추가 규칙

- Query Layer는 Entity를 생성하지 않는다
- 반환 타입은 `Row` 또는 Primitive 타입만 허용한다

---

## 7. 레이어 간 네이밍 흐름 예시

### 회원 상태 변경 예시

```tsx
// API Layer
modifyMemberStatusHandler

// Service Layer
changeMemberStatus

// Repository Layer
findById
save

// Query Layer
updateMemberStatusById
```

동일한 기능이더라도 레이어별 책임에 따라 이름은 달라야 한다.

---

## 8. 금지 사항 요약

- API Layer에서 비즈니스 로직 작성 금지
- Service Layer에서 SQL 직접 호출 금지
- Repository Layer에서 도메인 규칙 판단 금지
- Query Layer에서 도메인 객체 생성 금지
- 모든 레이어에서 동일한 메소드명 사용 금지

---

## 9. 컨벤션 변경 규칙

- 컨벤션 변경은 반드시 팀 합의를 거친다
- 임의 변경 및 예외 적용 금지
- 예외가 필요한 경우 문서에 명시한다
