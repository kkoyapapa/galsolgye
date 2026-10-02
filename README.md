# 갤솔사계

갤럭시 컨설턴트들의 특별한 만남. 파스텔 핑크·크림·로즈 톤의 모바일 우선 정적 웹사이트입니다.

공개 사이트: https://kkoyapapa.github.io/galsolgye/

GitHub 저장소: https://github.com/kkoyapapa/galsolgye

2026-10-02 GitHub Actions 첫 배포 성공 및 공개 페이지 PC·모바일 뷰포트 검수 완료. `main` 변경 시 자동 검증·배포됩니다.

## 현재 운영 상태

**V1 체험 버전이며 실제 신청을 받지 않습니다.**

- 신청서 3단계, 필수값·이메일·출생연도 검증, 단계 이동, 작성 진행률
- 근무 지역 9개, 선호 지역 복수 선택 및 `지역무관` 상호 배타 처리
- MBTI 16개, 흡연, 장점 3가지, 이상형, 데이트·거리 선호
- 이메일 인증 연결 대기 상태의 내 프로필 조회 UI
- 신청 체험 완료, 작성 내용 다시 보기, 입력 내용 완전 초기화
- 키보드 탐색, 모달 포커스·ESC 닫기, 동작 줄이기 설정 대응
- 외부 웹폰트·분석 추적·CDN·런타임 의존성 없음
- 신청 내용을 네트워크·쿠키·localStorage·sessionStorage·GitHub에 저장하지 않음
- 인증이나 관리자 비밀번호를 프론트엔드에서 흉내 내지 않음

`connect-src 'none'` 및 `form-action 'none'` CSP로 체험 입력의 전송을 차단합니다. JavaScript가 없거나 시작하지 못하면 신청 필드가 비활성 상태입니다. 입력은 현재 문서의 메모리에서만 유지되며 새로고침·페이지 종료 시 초기화됩니다. 호스팅 사업자의 통상적인 웹 접속 로그는 별개입니다.

## 파일 구조

```text
index.html                        # 화면·폼·모달·보안 정책
style.css                         # 모바일 우선 반응형 디자인
script.js                         # 검증·진행도·모달·체험 흐름
assets/favicon.svg                # 갤솔사계 하트 아이콘
assets/images/galsolgye-main-character.jpg
.github/workflows/pages.yml       # main → 검증 → 정적 빌드 → Pages
scripts/dev.mjs                   # 의존성 없는 로컬 검수 서버
scripts/check.mjs                 # 자산·앵커·전송 차단 검사
scripts/build.mjs                 # 공개 파일만 dist에 복사
backend/001_schema.sql            # 향후 Supabase DB 권한 설계 초안
docs/BACKEND.md                   # 인증·저장·조회·운영 전환 설계
docs/QA.md                        # 실제 수행한 검수 및 미검수 범위
```

여성 캐릭터는 첨부 원본 바이트를 그대로 사용합니다. 업로드 파일명은 PNG였으나 실제 포맷은 JPEG이므로 올바른 `.jpg` 확장자로 보관했습니다. 원본 864×1536 비율을 유지하고 `object-fit: contain`을 적용했습니다. 별도의 이미지 생성·색상 변경·얼굴 수정·크롭을 하지 않았습니다. 남성 캐릭터는 메인 사용 요청 대상이 아니므로 배포 자산에 포함하지 않았습니다.

## 로컬 실행

Node.js 20 이상에서 외부 패키지 설치 없이 실행합니다.

```bash
npm run dev
npm run check
npm run build
```

개발 서버 기본 포트는 4173입니다. `dist/`에는 index.html, style.css, script.js, assets, .nojekyll만 들어갑니다. 문서·개발 서버·DB 스키마·검수용 페이지는 배포하지 않습니다. 정적 파일 자체는 Node.js 없이 GitHub Pages에서 동작합니다.

## GitHub Pages 배포

1. 본인 계정 `kkoyapapa`에 `galsolgye` 저장소를 만듭니다. 무료 계정에서 Pages를 쓰는 경우 Public 저장소로 생성합니다. 실제 개인정보는 올리지 않습니다.
2. 이 프로젝트 전체를 `main` 브랜치 루트에 올립니다. `.github/workflows/pages.yml`도 포함해야 합니다.
3. 저장소 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 선택합니다.
4. Actions → Deploy static site to GitHub Pages → Run workflow 또는 main에 새 커밋을 올려 배포합니다.
5. 성공한 Actions의 `github-pages` 환경에서 제공하는 URL로 접속해 검수합니다. 실제 배포 성공 전에는 URL을 배포 완료 주소로 안내하지 않습니다.

기존 저장소가 있다면 내용을 확인하고 합쳐야 하며 무조건 덮어쓰지 않습니다. 조직 정책·계정 요금제·GitHub App의 저장소/워크플로 권한에 따라 설정이 다를 수 있습니다.

공식 문서: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## 실제 서비스 전환

현재 프론트엔드는 실제 API와 연결되지 않았습니다. `docs/BACKEND.md`의 인증·권한·동의·보관·삭제 조건을 먼저 충족한 뒤 연동해야 합니다. 정적 호스팅에 DB 키나 관리자 비밀번호를 추가해서 활성화하는 구조가 아닙니다.

갤솔사계는 갤럭시 컨설턴트 간 교류를 위한 비공식 이벤트이며 삼성전자·삼성전자판매의 공식 서비스가 아닙니다.
