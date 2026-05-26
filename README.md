# HireVisa Mobile — CS Chat System (Beta)

모바일 개통 신청 CS 채팅 시뮬레이터. 학생 시점(📱)과 오퍼레이터 시점(💻)을 동시에 확인할 수 있는 개발용 프로토타입입니다.

## 개요

- **PRD**: Chat Feature v0.1
- **대상**: 유학생 모바일 개통 지원팀(오퍼레이터) + 신청 고객(학생)
- **방식**: 항목별 1:1 매칭 → Status A/B/C/D 자동 계산 → 개통 완료

## 진입 경로 (2가지)

| 경로 | 조건 | 항목 초기 상태 |
|------|------|--------------|
| **앱번호 경로** | 학생이 사이트에서 신청 완료 후 신청번호 보유 | `submitted` (서류 이미 제출됨 가정) |
| **워크플로우 경로** | 신청번호 없음 → 채팅 내 간편신청 | `empty` (채팅으로 직접 제출) |

## 기술 스택

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React hooks (`useChat` custom hook)
- **Config**: `config/segments.json` (항목 정의 단일 소스)

## 주요 파일

```
src/
├── app/chat/page.tsx           # 메인 채팅 페이지 (학생/오퍼레이터/분할 뷰)
├── components/chat/
│   ├── StudentView.tsx          # 학생 시점 채팅 UI
│   ├── OperatorView.tsx         # 오퍼레이터 어드민 패널
│   ├── ApplicationEntryView.tsx # 신청번호 입력 화면
│   ├── ApplicationWorkflowView.tsx # 채팅 내 간편신청 (Q1→Q2→Q3)
│   ├── StudentPreChat.tsx       # 진입 분기 래퍼
│   ├── SuppModal.tsx            # 보완 요청 모달
│   └── CloseModal.tsx           # 개통 취소 모달
├── hooks/useChat.ts             # 모든 케이스 상태 & 액션 (단일 진실 공급원)
└── lib/
    ├── types.ts                 # 타입 정의
    ├── computeStatus.ts         # Status A/B/C/D 계산 로직
    ├── segRequirements.ts       # Seg별 항목 목록 조회
    ├── suppCategories.ts        # 항목별 보완 사유 목록
    └── utils.ts                 # ID 생성, 시각 포맷, 데모 학생 데이터
config/
└── segments.json               # Seg/SimType별 항목 정의 (단일 소스)
docs/
├── workflow-spec.md            # 워크플로우 & 분기 로직 전체 명세
└── workflow-branches.xlsx      # 분기별 상세 정의 (프로덕트/UX용)
```

## 실행

```bash
npm install
npm run dev   # http://localhost:3000 → /chat 자동 리디렉션
```

## 워크플로우 명세

전체 분기 로직, 자동 발송 멘트, 항목 상태 머신, 퀵리플라이 정의는
**`docs/workflow-spec.md`** 및 **`docs/workflow-branches.xlsx`** 참고.

## Status 계산 (자동, 결정론적)

| Status | 조건 | 의미 |
|--------|------|------|
| `null` | 항목 없음 | 초기 상태 |
| **A** | 기본값 | 검토 중 |
| **B** | 1개 이상 `supp_requested` | 보완 요청 중 |
| **C** | 1개 이상 `resubmitted` (B 미해당) | 재제출됨 |
| **D** | 전체 `approved` | 개통 준비 완료 → 원클릭 개통 |

우선순위: `D > B > C > A`
