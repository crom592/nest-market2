🟢 구현된 서비스
사용자 관리 시스템
사용자 역할 (참새, 어미새, 관리자)
프로필 완성도 추적 기능
패널티 점수 관리
평판 점수 시스템
문서 검증 프로세스
유연한 권한 관리
공동 구매 시스템
공동 구매 생성 기능
참여자 모집 로직
기본 입찰 및 투표 메커니즘
참여 이력 추적
경매 규칙 기본 구성
입찰 시스템
기본 입찰 생성 및 관리
입찰 경쟁력 점수 계산
평판 기반 입찰 선택 로직
입찰 이력 추적
🔴 아직 구현되지 않은 서비스
사용자 경험 관련
진행 중인 공구 목록
카테고리별 검색 필터
인기순, 남은 시간순, 참여 인원순 정렬
공구 찜하기 기능
공구 공유하기 기능
공구 세부 내용
제품/서비스 세부 정보 페이지
남은 시간 카운팅
상세 참여/탈퇴 기능
패널티 정책 상세 UI
신규 공구 등록
제품 리스트 노출 (인기순, 가격, 브랜드 필터)
카테고리별 제품 분류 (전자제품, 가전, 통신, 렌탈)
공구 등록 상세 페이지
자동 저장 기능
참여 중인 공구 목록
상세한 공구 상태 표시
입찰 판매자 수 확인
탈퇴 사유 입력 기능
완료된 공구 리스트
리뷰 및 별점 시스템
최근 1~3개월 리스트 필터링
마이페이지
일반 회원 (참새)
상세 프로필 수정 기능
배송지 관리
결제 수단 등록
주문/배송 추적
상세 구매 후기 시스템
사업자 회원 (어미새)
사업자 번호/등록증 검증
입찰 내역 상세 추적
판매 확정/포기 상세 기능
고객 정보 관리 시스템
추가 기능
이벤트 배너 시스템
포인트 적립/경품 추첨
공지사항 게시판
FAQ 시스템
부정행위 신고 게시판
🟠 부분적으로 구현된 서비스
패널티 시스템
기본 패널티 추적 메커니즘 구현
세부 패널티 적용 로직 보완 필요
패널티에 따른 사용자 제재 세부 구현 필요
투표 시스템
기본 투표 메커니즘 구현
복잡한 투표 규칙 및 예외 처리 필요
투표 결과에 따른 세부 액션 로직 보완 필요
등급 시스템
기본 등급 구조 존재
세부적인 등급 진행 로직 필요
뱃지 및 캐릭터 시스템 미완성
```

```
nest-market
├─ .eslintrc.json
├─ .gitignore
├─ README.md
├─ app
│  ├─ admin
│  │  └─ page.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  ├─ create
│  │  │  │  └─ route.ts
│  │  │  ├─ group-purchases
│  │  │  │  ├─ bulk
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ route.ts
│  │  │  ├─ stats
│  │  │  │  └─ route.ts
│  │  │  └─ users
│  │  │     └─ route.ts
│  │  ├─ auth
│  │  │  └─ [...nextauth]
│  │  │     └─ route.ts
│  │  ├─ group-purchases
│  │  │  ├─ [id]
│  │  │  │  ├─ bids
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ messages
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ participate
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ review
│  │  │  │  │  └─ route.ts
│  │  │  │  ├─ route.ts
│  │  │  │  ├─ vote
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ withdraw
│  │  │  │     └─ route.ts
│  │  │  ├─ __tests__
│  │  │  │  └─ route.test.ts
│  │  │  ├─ completed
│  │  │  │  └─ route.ts
│  │  │  ├─ filter
│  │  │  │  └─ route.ts
│  │  │  ├─ participating
│  │  │  │  ├─ __tests__
│  │  │  │  │  └─ route.test.ts
│  │  │  │  └─ route.ts
│  │  │  └─ route.ts
│  │  ├─ notifications
│  │  │  └─ route.ts
│  │  ├─ user
│  │  │  └─ route.ts
│  │  └─ users
│  │     └─ stats
│  │        └─ route.ts
│  ├─ auth
│  │  ├─ error
│  │  │  └─ page.tsx
│  │  ├─ signin
│  │  │  └─ page.tsx
│  │  └─ signup
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ AuthModal.tsx
│  │  ├─ CreatePurchaseForm.tsx
│  │  ├─ FilterBar.tsx
│  │  ├─ Footer.tsx
│  │  ├─ GroupPurchaseCard.tsx
│  │  ├─ GroupPurchaseList.tsx
│  │  ├─ Header.tsx
│  │  ├─ admin
│  │  │  ├─ GroupPurchaseManagement.tsx
│  │  │  └─ UserManagement.tsx
│  │  ├─ auth
│  │  │  ├─ SignInForm.tsx
│  │  │  └─ SignUpForm.tsx
│  │  ├─ category-nav.tsx
│  │  ├─ events
│  │  │  └─ PrizeRoulette.tsx
│  │  ├─ filter-bar.tsx
│  │  ├─ group-purchase
│  │  │  ├─ BidForm.tsx
│  │  │  ├─ ChatRoom.tsx
│  │  │  ├─ CompletedGroupPurchaseList.tsx
│  │  │  ├─ CompletedPurchases.tsx
│  │  │  ├─ CreateGroupPurchaseForm.tsx
│  │  │  ├─ GroupPurchaseCard.tsx
│  │  │  ├─ GroupPurchaseDetail.tsx
│  │  │  ├─ GroupPurchaseGrid.tsx
│  │  │  ├─ GroupPurchaseList.tsx
│  │  │  ├─ ParticipatingPurchases.tsx
│  │  │  └─ ProductSearch.tsx
│  │  ├─ hero
│  │  │  └─ HeroSection.tsx
│  │  ├─ inquiry
│  │  │  ├─ CreateInquiryButton.tsx
│  │  │  └─ InquiryList.tsx
│  │  ├─ main-nav.tsx
│  │  ├─ notice
│  │  │  ├─ CreateNotice.tsx
│  │  │  └─ NoticeBoard.tsx
│  │  ├─ notifications
│  │  │  ├─ NotificationCenter.tsx
│  │  │  └─ __tests__
│  │  │     └─ NotificationCenter.test.tsx
│  │  ├─ points
│  │  │  └─ PointSystem.tsx
│  │  ├─ product-grid.tsx
│  │  └─ ui
│  │     ├─ accordion.tsx
│  │     ├─ alert-dialog.tsx
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ button copy.tsx
│  │     ├─ button.tsx
│  │     ├─ card copy.tsx
│  │     ├─ card.tsx
│  │     ├─ dialog copy.tsx
│  │     ├─ dialog.tsx
│  │     ├─ form.tsx
│  │     ├─ input copy.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ popover.tsx
│  │     ├─ progress copy.tsx
│  │     ├─ progress.tsx
│  │     ├─ scroll-area.tsx
│  │     ├─ select copy.tsx
│  │     ├─ select.tsx
│  │     ├─ skeleton.tsx
│  │     ├─ table.tsx
│  │     ├─ tabs copy.tsx
│  │     ├─ tabs.tsx
│  │     ├─ textarea copy.tsx
│  │     └─ textarea.tsx
│  ├─ contact
│  │  └─ page.tsx
│  ├─ create-purchase
│  │  └─ page.tsx
│  ├─ faq
│  │  └─ page.tsx
│  ├─ fonts
│  │  ├─ GeistMonoVF.woff
│  │  └─ GeistVF.woff
│  ├─ globals.css
│  ├─ group-purchases
│  │  └─ page.tsx
│  ├─ inquiries
│  │  └─ page.tsx
│  ├─ layout.tsx
│  ├─ my-purchases
│  │  └─ page.tsx
│  ├─ page.tsx
│  ├─ profile
│  │  └─ page.tsx
│  ├─ terms
│  │  └─ page.tsx
│  └─ types.ts
├─ components.json
├─ lib
│  ├─ api.ts
│  ├─ auth.ts
│  ├─ prisma.ts
│  ├─ s3.ts
│  ├─ utils
│  │  ├─ date.ts
│  │  ├─ notification.ts
│  │  └─ websocket.ts
│  └─ utils.ts
├─ next-env.d.ts
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  │  ├─ 20241209124020_add_group_purchase_category_fields
│  │  │  └─ migration.sql
│  │  ├─ 20241209124421_add_group_purchase_category_fields
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ public
│  ├─ android-chrome-192x192.png
│  ├─ android-chrome-512x512.png
│  ├─ apple-touch-icon.png
│  ├─ favicon-16x16.png
│  ├─ favicon-32x32.png
│  ├─ favicon.ico
│  ├─ favicon_io.zip
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ google.svg
│  ├─ images
│  │  ├─ dyson.avif
│  │  ├─ dyson.jpg
│  │  ├─ macbook.jpg
│  │  ├─ nintendo.avif
│  │  └─ switch.jpg
│  ├─ kakao.svg
│  ├─ logo.jpeg
│  ├─ logo.png
│  ├─ naver.svg
│  ├─ next.svg
│  ├─ site.webmanifest
│  ├─ vercel.svg
│  ├─ window.svg
│  ├─ 공구_템플릿.xlsx
│  └─ 등급별이미지베타
│     ├─ 등급별어미새케릭터
│     │  ├─ vip어미새.jpg
│     │  ├─ 우두머리어미새.jpg
│     │  ├─ 우수한어미새.jpg
│     │  ├─ 초보어미새.jpg
│     │  └─ 최우수어미새.jpg
│     └─ 등급별참새케릭터
│        ├─ vip참새.jpg
│        ├─ 우두머리참새.jpg
│        ├─ 우수한참새.jpg
│        ├─ 초보참새.jpg
│        └─ 최우수참새.jpg
├─ scripts
│  └─ test-group-purchase-filters.ts
├─ src
│  └─ services
│     ├─ bidding.service.ts
│     ├─ group-purchase.service.ts
│     └─ user-management.service.ts
├─ tailwind.config.js
├─ tailwind.config.ts
├─ tsconfig.json
└─ yarn.lock

```