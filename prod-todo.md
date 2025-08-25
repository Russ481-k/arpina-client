### 핵심 요약

- **정원 보호**: 결제 진입 시점에 5분 홀드(pending)를 카운트에 포함해 동시 진입으로 인한 정원 초과 결제를 방지.
- **가용 슬롯 노출**: 레슨/자격확인 응답에 `availablePaymentSlots`(= capacity - PAID - pending) 제공.
- **즉시 해제**: 결제 창 닫힘/실패 시 보류 해제 API로 즉시 슬롯 반환(백엔드는 TTL 5분으로 자동 소멸도 유지).

### 백엔드(연동 사양)

- 결제 준비: `POST /payment/prepare-kispg-payment`
  - 정원 계산(capacity - paid - pending) → 가능 시 5분 홀드 생성 → KISPG 파라미터와 함께 `holdId`, `holdExpireAt` 반환.
- 결제 승인: `POST /payment/approve-and-create-enrollment`
  - 기존 홀드가 있으면 `PAID`로 승격해 확정(없으면 기존 로직 유지).
- 즉시 해제: `POST /payment/release-pending` (선택 최적화)
  - Body: `{ holdId }` → 보류 있으면 삭제 후 성공 반환.
- 목록/자격확인 응답
  - `availablePaymentSlots`, `currentPaidCount`, `currentPendingCount` 노출.

### 프런트엔드(적용 내용)

- 타입 확장
  - `EnrollInitiationResponseDto`에 `holdId?`, `holdExpireAt?` 추가.
- 해제 API 래핑
  - `swimmingPaymentService.releasePendingHold(holdId)` 추가.
- 결제 닫힘/실패 시 해제
  - `application/confirm/page.tsx`:
    - `handlePaymentClose`: `paymentData.holdId` 존재 시 `releasePendingHold` 호출.
    - `handlePaymentComplete(false, ...)`: 실패 시에도 `releasePendingHold` 호출.
- 에러 UX(결제 준비 단계)
  - 409: “정원이 초과되었거나, 결제 중인 인원이 많아 현재 결제를 시작할 수 없습니다.”
  - 400: “입력 값이 유효하지 않습니다.”
  - 401: 로그인 유도.
- 리스트 버튼 활성화 기준 고도화
  - `LessonCardActions.tsx`: 접수기간 내 버튼 활성 판단 시 `availablePaymentSlots > 0` 우선, 값이 없으면 기존 `remaining > 0` 사용.

### 사용자 경험 변화

- 결제 진입 시 슬롯이 5분간 임시 점유되어 초과 결제 방지.
- 결제 창을 닫거나 실패하면 슬롯을 즉시 반환(또는 최대 5분 후 자동 해제).
- 리스트/자격확인에서 가용 슬롯 수(`availablePaymentSlots`) 기반으로 신청 가능 여부를 더 정확히 반영.

### 참고

- 기존 UNPAID 상태는 사용하지 않으며, “결제 성공 시 `PAID`로 확정” 흐름은 유지.
- `availablePaymentSlots`가 백엔드에서 항상 내려올 때, 버튼 비활성화/툴팁 등 UX를 더 강화할 수 있음.

### 테스트 시나리오 개요

- 목적: 결제 진입 5분 홀드로 정원 초과 방지, `availablePaymentSlots` 노출, 실패/취소 시 즉시 해제 흐름 검증
- 범위: 백엔드(단위/통합), 프론트(통합/UX), 동시성(E2E), 보안/에러, 관측성

### 1) 백엔드 단위/통합 테스트

- 시나리오 BE-01: 결제 준비 성공(홀드 생성)

  - 선행조건: 특정 강습 capacity=30, paid=28, pending=1
  - 액션: POST /payment/prepare-kispg-payment
  - 기대: 200, 응답에 holdId/holdExpireAt; pending=2로 증가(가용=0)

- 시나리오 BE-02: 결제 준비 실패(가용 슬롯 0)

  - 선행조건: capacity=30, paid=29, pending=1 (가용=0)
  - 액션: POST /payment/prepare-kispg-payment
  - 기대: 409, 메시지 포함

- 시나리오 BE-03: 동시 결제 준비(원자성)

  - 선행조건: capacity=30, paid=28, pending=0 (가용=2)
  - 액션: 동일 강습에 대해 5개 동시 요청
  - 기대: 정확히 2건만 성공, 3건은 409

- 시나리오 BE-04: 승인 시 홀드 승격

  - 선행조건: 유효 holdId 존재(pending 1)
  - 액션: POST /payment/approve-and-create-enrollment
  - 기대: 기존 홀드가 PAID로 전환, pending 감소, paid 증가

- 시나리오 BE-05: 승인(홀드 없음, 후방호환)

  - 선행조건: pending 0
  - 액션: POST /payment/approve-and-create-enrollment
  - 기대: 종전 로직대로 PAID 생성

- 시나리오 BE-06: 즉시 해제 API

  - 선행조건: 유효 holdId 보유
  - 액션: POST /payment/release-pending {holdId}
  - 기대: 200 {success:true}, pending 감소, 재호출 시에도 idempotent

- 시나리오 BE-07: TTL 만료 자동 해제

  - 선행조건: pending 1 (TTL=300s)
  - 액션: 5분 경과 후 조회
  - 기대: pending 자동 0, 결제 준비 재시도 성공

- 시나리오 BE-08: 응답 스키마 노출

  - 액션1: GET /swimming/lessons
  - 액션2: GET /swimming/enroll/eligibility?lessonId=…
  - 기대: 두 응답에 availablePaymentSlots, currentPaidCount, currentPendingCount 포함 및 값 일관

- 시나리오 BE-09: 경계상황(승인 시점에 홀드 만료)

  - 선행조건: hold TTL 임박
  - 액션: 만료 직후 승인 시도
  - 기대: 최종 재검증 정책에 따라 승인 성공 또는 좌석 부족 에러 반환(정책대로)

- 시나리오 BE-10: 보안(사용자 분리)
  - 선행조건: A유저의 holdId 존재
  - 액션: B유저가 release-pending/approve에 A의 holdId 사용
  - 기대: 403 또는 유효하지 않은 hold 처리

### 2) 프론트 통합/UX 테스트

- 시나리오 FE-01: 리스트 버튼 활성화(availablePaymentSlots 우선)

  - 선행조건: lesson.availablePaymentSlots=1, remaining=0
  - 기대: “신청하기” 활성(available 우선), 클릭 시 확인 페이지 이동

- 시나리오 FE-02: 409 처리 UX

  - 액션: 결제 준비 호출 시 409 응답 유도
  - 기대: 토스트 “정원이 초과되었거나…” 메시지 노출, 버튼 재시도 가능

- 시나리오 FE-03: 400/401 처리 UX

  - 400: “입력 값이 유효하지 않습니다.”
  - 401: 로그인 페이지로 리다이렉션

- 시나리오 FE-04: 결제창 닫힘 시 즉시 해제

  - 선행조건: prepare 성공(holdId 보유)
  - 액션: KISPG 창 닫기(onPaymentClose)
  - 기대: release-pending 호출됨(네트워크 OK 시), 실패해도 UX 영향 없음

- 시나리오 FE-05: 결제 실패 시 즉시 해제

  - 선행조건: prepare 성공(holdId 보유)
  - 액션: onPaymentComplete(false, …)
  - 기대: release-pending 호출, 이후 재시도 가능

- 시나리오 FE-06: 슬롯 재노출 확인
  - 액션: 해제 후 리스트/eligibility 리프레시
  - 기대: availablePaymentSlots 증가, 버튼 활성화

### 3) E2E 동시성 시나리오

- 시나리오 EE-01: 두 사용자 동시 결제 진입

  - 선행조건: 가용=1
  - 액션: 사용자 A,B 동시에 prepare 호출
  - 기대: 1명 성공(hold 획득), 다른 1명 409

- 시나리오 EE-02: 창 닫힘 vs 승인 경합

  - 선행조건: A hold 획득
  - 액션: A가 결제 중 닫기, 즉시 B가 재시도
  - 기대: A 해제 성공 후 B prepare 성공

- 시나리오 EE-03: 다중 탭(동일 사용자)
  - 선행조건: 같은 계정에서 2탭 동시 prepare
  - 기대: 중복 홀드 방지(한 탭만 성공) 또는 동일 hold 재사용 정책 준수

### 4) 예외/보안/회복

- 시나리오 NX-01: release-pending 2회 호출

  - 기대: 첫 성공 후 두 번째도 에러 없이 성공(true/false 정책 일관)

- 시나리오 NX-02: 잘못된 holdId

  - 기대: 400 또는 {success:false} 정책 일관

- 시나리오 NX-03: 네트워크 오류 복구
  - 액션: release 실패 후 TTL 경과
  - 기대: 5분 후 자동 슬롯 복귀

### 5) 관측성/모니터링

- 시나리오 OB-01: 로깅

  - 기대: prepare/approve/release/expire 이벤트 로그에 lessonId, userId, holdId, 결과 기록

- 시나리오 OB-02: 메트릭
  - 기대: 현재 pending 수, 409 비율, 평균 대기시간, 해제 사유(닫힘/실패/TTL) 대시보드 노출

### 비고

- 승인 전 최종 재검증(좌석 부족 시 거절/대체 메시지)은 정책대로 기대값 정의 필요.
- holdId-사용자 바인딩/권한 검사는 반드시 통과해야 함.
- 고부하(100 동시요청) 부하테스트로 409 정확성과 지연시간 확인 권장.
