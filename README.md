# 셀렉트 조이 (celect-joi)

선택지 기반 인터랙티브 캐릭터 스토리 앱. Electron + React 데스크톱 프로그램으로, 카드 제작(에디터)과
플레이를 한 앱에서 할 수 있다. BYOK(Bring Your Own Key) 방식으로 사용자가 자신의 LLM/이미지 생성
API 키를 직접 입력해서 쓴다 — 별도 백엔드 서버는 없다.

## 구성

- **플레이어**: 카드를 골라 재생. 이미지 슬라이드쇼 + 오버레이 선택지 + 지정된 지점에서 자유 텍스트 지시
- **카드 에디터**: 캐릭터/세계관/필수 노드/엔딩 작성, AI 초안 제안, AI 노드 생성 파이프라인, 이미지
  업로드/AI 생성 및 노드별 배치
- **설정**: LLM 제공자(Anthropic/OpenAI) 선택 및 API 키 저장 (OS 키체인 기반 암호화, 안 되는 환경에서는
  평문 저장으로 폴백)

## 프로젝트 구조

```
src/
  shared/       메인·프리로드·렌더러가 공유하는 타입, IPC 채널 정의
  main/         Electron 메인 프로세스 — 카드/저장/시크릿/에셋 파일 저장, LLM·이미지 생성 API 호출
  preload/      contextBridge로 렌더러에 노출하는 타입 있는 IPC API (window.api)
  renderer/src/
    engine/     노드 순회 엔진 (required/story/ending 노드 통합 탐색)
    player/     플레이어 화면
    editor/     카드 에디터 화면
    settings/   설정 화면
```

카드/저장 데이터/이미지는 OS의 앱 데이터 폴더(Electron `userData`, 예: Windows
`%APPDATA%/celect-joi`)에 저장된다.

## 개발

### 설치

```bash
npm install
```

### 개발 모드 실행 (핫리로드)

```bash
npm run dev
```

### 타입체크 / 린트

```bash
npm run typecheck
npm run lint
```

### 빌드 (실행 파일 패키징)

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

Windows/macOS용 빌드는 각각 그 OS(또는 Wine이 설치된 환경)에서 실행해야 한다. Linux 빌드는
`dist/linux-unpacked/celect-joi` 실행 파일과 AppImage를 만든다.
