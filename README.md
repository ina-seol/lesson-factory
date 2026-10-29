# Lesson Factory V1

초등 영어교사를 위한 Teacher Authoring Tool입니다. 하나의 수업안을 교사가 검토·확정한 뒤 학습지, 교실 게임, 형성평가를 제작합니다. 현재는 V1 작업판이며 전체 현장 검증이 끝난 정식 배포본은 아닙니다.

## 현재 구현

- 한국어 Dashboard, 수업 주문서, 교사 기본 설정
- 구조화된 Lesson Blueprint와 Zod 검증, 활동·표현·목표 편집, 수업 시간 확인
- 교사 확정 단계 및 수업안 변경 시 자료의 이전 버전 표시
- A4 학습지, 문항별 편집과 부분 재생성, 브라우저 인쇄
- 고정 React 게임 엔진: Quiz Show / Speed Quiz / Matching Game
- Exit Ticket 및 5·10문항 평가, 교사용 정답·낭독문
- LocalStorage 자동 저장, JSON 백업·불러오기, 탭 충돌 경고
- 키 없이 동작하는 Mock Mode와 서버 측 OpenAI-compatible AI 연결 계층
- GitHub Actions: 타입 검사 → 회귀 테스트 → 프로덕션 빌드

## 프로젝트 구조

```text
app/                 진입 화면, 스타일, /api/ai 서버 라우트
src/App.tsx          교사 작업 공간과 화면 연결
src/components/      수업 주문서·수업안·자료 편집·인쇄 미리보기
src/games/           고정 게임 엔진 및 점수·타이머 상태 로직
src/model/           Zod 스키마, 어휘 일관성 검사, 레코드 ID
src/ai/              Mock/HTTP Provider 및 서버 응답 검증·재시도
src/prompts/         결과물별 프롬프트
src/storage/         저장, 백업 및 복원
src/hooks/           자동 저장 상태와 탭 충돌 처리
tests/               Node 테스트 러너 기반 회귀 테스트
.github/workflows/   GitHub 빌드 검사
docs/ARCHITECTURE.md  구조와 설계 결정
```

React 19 + TypeScript + Vite/Vinext를 사용합니다. CSS 토큰으로 스타일을 관리하며, 무거운 데이터베이스나 학생 계정은 사용하지 않습니다. `components/ui`, `worker`, `scripts`, `lib` 일부는 호스팅 스타터의 기반 파일입니다.

## 로컬 실행

Node.js 24 LTS와 pnpm 11.25.0을 사용합니다. Windows PowerShell, macOS, Linux에서 실행할 수 있습니다.

```sh
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

터미널에 출력되는 주소를 여세요. 일반 로컬 환경의 기본 포트는 5173입니다. 새로 복제한 프로젝트는 별도 호스팅 도구 없이 portable 프로필을 선택합니다.

```sh
pnpm run typecheck
pnpm test
pnpm run build
pnpm start
```

`pnpm start`는 빌드된 Worker를 로컬에서 실행합니다. API 키는 빌드나 테스트에 필요하지 않습니다.

## Mock Mode

기본 모드는 Mock AI Mode입니다. `새 수업 만들기 → 예시 입력하기 → Lesson Blueprint 만들기` 또는 Dashboard의 `예시 수업 열기`를 사용하세요.

Mock은 준비된 규칙 기반 콘텐츠입니다. 자유 요청의 의미를 실제 AI처럼 이해하지 않으며, 사전에 없는 단어의 뜻은 교사가 확인해야 합니다. 수업안을 확정한 후 자료를 만들고, 자료의 `검토 완료로 표시`를 누르면 인쇄·게임 실행이 활성화됩니다.

## 환경변수와 AI API

`.env.example`은 공개해도 되는 설정 양식입니다. 로컬 Worker 환경에는 이를 `.dev.vars`로 복사해 실제 값을 입력하고 개발 서버를 재시작하세요. 배포 환경에는 해당 플랫폼의 서버 환경변수/secret 설정을 사용합니다.

```dotenv
AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_KEY=your-server-side-key
AI_MODEL=your-available-json-capable-model
```

`AI_MODEL`은 사용 중인 계정에서 지원하는 모델 ID를 지정합니다. OpenAI-compatible Chat Completions와 JSON object 응답을 지원하는 공급자를 사용할 수 있습니다. 키는 frontend, localStorage, GitHub 소스에 넣지 않습니다. `VITE_` 또는 `NEXT_PUBLIC_` 접두사를 키에 사용하지 마세요.

설정 화면에서 `실제 AI 연결`을 선택하면 브라우저가 같은 출처의 `/api/ai`에 요청합니다. 서버가 외부 모델을 호출하고 Zod 검증 실패 시 한 번 수정 요청합니다. 실제 제공업체 API를 통한 종단 검증은 아직 별도로 필요합니다.

## GitHub 빌드와 배포

`main` push 또는 PR에서 `.github/workflows/ci.yml`이 실행됩니다. Actions 탭에서 `Build and test`를 확인할 수 있습니다. API key나 GitHub secret 없이 타입 검사·Mock 테스트·빌드를 수행합니다.

이 workflow는 **검증용 빌드**입니다. GitHub Pages 자동 배포를 포함하지 않습니다. 현재 앱은 `/api/ai` 서버 라우트가 있으므로 전체 기능을 정적 GitHub Pages로 그대로 배포할 수 없습니다.

기존 호스팅 구성을 사용하면 `pnpm run build`가 `dist/client`와 `dist/server`를 생성합니다. Sites 게시 도구에서 동일 커밋의 빌드 결과를 저장·배포합니다. `.openai/hosting.json`에는 기존 프로젝트 ID가 있으며 새 프로젝트를 만들지 말고 재사용하세요. 다른 Cloudflare 배포 환경으로 옮길 때에는 호스팅 설정과 인증을 별도로 구성해야 합니다.

실제 AI endpoint는 개인용 비공개 호스팅을 전제로 합니다. 공개 배포 전 서버 접근 제어와 요청 한도 설정이 필요합니다. `.env*`, `.dev.vars*`, 빌드 결과, node_modules는 Git에서 제외됩니다.

## 저장과 검증의 현재 한계

- 계정·클라우드 동기화가 없습니다. 자료는 접속 주소와 브라우저별로 저장됩니다. Preview와 다른 배포 주소 간 자료 이동에는 JSON 백업이 필요합니다.
- 브라우저 데이터 삭제 전 백업이 필요합니다. 손상 데이터 복구와 저장 용량 한도는 추가 실사용 검증 대상입니다.
- 어휘 검사는 보조 장치이며 뜻·문법·평가 타당성까지 보장하지 않습니다.
- 활동 순서 변경은 위/아래 버튼 방식입니다. 그림 문항은 기본 동작 6개만 지원합니다.
- 자동 테스트는 데이터 검증·Mock 생성·백업·게임 상태를 다룹니다. 실기기 터치, 실제 인쇄, 장시간 수업 운영, 실제 AI 응답은 별도 검증해야 합니다.
- 서비스 워커를 통한 완전한 오프라인 재접속은 구현하지 않았습니다.

## V2 / V3 후보

1. 교과 내용과 정답 검증 강화, 교사가 승인한 자료 템플릿
2. 저장 복구·실기기·인쇄 회귀 테스트 및 데이터 마이그레이션
3. 선택적 클라우드 동기화와 수업 공유
4. PPTX·이미지·오디오 자료 확장
5. 명시적 동의와 개인정보 설계를 전제로 한 학급 도구 연동

## 디자인 참고

프로젝트에 `elayadesign/ai-design-skills`의 MIT 스킬을 포함했습니다. `.agents/skills/landing-page-design/`에 원본과 라이선스가 있습니다. 마케팅 페이지 구성은 제외하고 시각 계층·간격·상호작용 원칙을 참고했습니다. 자세한 적용 범위는 `docs/ARCHITECTURE.md`에 기록했습니다.
