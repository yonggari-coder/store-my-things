# Where Is My Phone

내 공간(집·사무실 등)에 어떤 물건을 어디에 두었는지 2D 격자 계층 맵으로 기록·검색하는 PWA.

## 핵심 컨셉

- **격자 + 동적 깊이**: 각 레벨이 격자 캔버스. 셀에 박스를 놓고 그 안으로 한 단계 더 들어갈 수 있음.
  - 예: `내 집 → 안방 → 옷장 → 위 서랍 → 지갑`
- **통합 노드 모델**: 박스/물건을 따로 구분하지 않음. 자식이 생기면 자동으로 컨테이너처럼 동작.
- **로컬 우선**: IndexedDB에 저장. JSON 내보내기/가져오기로 백업·이전. 클라우드는 v2.
- **모바일 우선** PWA. 추후 Capacitor로 Android Play Store 배포 예정.

## 스택

| 영역 | 선택 |
| --- | --- |
| 빌드/dev | Vite |
| UI | React 19 + TypeScript |
| 스타일 | Tailwind CSS v4 |
| 라우팅 | React Router v6 (Stage 2~) |
| 상태 | Zustand (Stage 4~) |
| DB | Dexie.js (Stage 1~) |
| 모달 | vaul (바텀시트) |
| DnD | dnd-kit |
| 아이콘 | lucide-react |
| PWA | vite-plugin-pwa (Stage 10~) |
| 모바일 | Capacitor 6 (M2) |

## 명령어

```bash
npm run dev          # 개발 서버 (http://localhost:5173)
npm run build        # 프로덕션 빌드 (타입체크 + Vite build)
npm run lint         # ESLint
npm run format       # Prettier 적용
npm run preview      # build 결과 미리보기
```

## 디렉터리

```
src/
  routes/        # 페이지(SpacesPage, ContainerPage, ...)
  components/    # 재사용 UI(Grid, NodeSheet, ...)
  db/            # Dexie 스키마 + CRUD
  store/         # Zustand 스토어
  lib/           # 헬퍼(검색, path, exportImport)
  types/         # 공용 타입
```

## 로드맵 (M1 = Web MVP)

- [x] Stage 0 — 프로젝트 셋업
- [ ] Stage 1 — 데이터 레이어 (Dexie + 시드)
- [ ] Stage 2 — 라우팅 + 빈 화면 5개
- [ ] Stage 3 — 공간 리스트(홈)
- [ ] Stage 4 — 격자 뷰 표시
- [ ] Stage 5 — 격자 뷰 추가/진입(NodeSheet)
- [ ] Stage 6 — 편집 모드(드래그/리사이즈/삭제)
- [ ] Stage 7 — 검색
- [ ] Stage 8 — 카테고리 관리 + 설정 셸
- [ ] Stage 9 — 내보내기/가져오기
- [ ] Stage 10 — PWA화

M1 완료 후 사용 검증 → M2(Capacitor + Play Store) 진행 여부 결정.
