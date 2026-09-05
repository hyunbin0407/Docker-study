# 8회차 - 실전 프로젝트 (웹앱 + MySQL DB) + Docker Hub push

## 🎯 학습 목표
- 실전에서 자주 쓰는 관계형 DB(MySQL)를 Compose로 연결해보기
- `depends_on`이 "DB가 준비될 때까지 기다려주는 것"은 아니라는 실전 문제를 직접 겪고 해결하기
- 완성한 이미지를 Docker Hub에 push해서 다른 곳에서도 받아 쓸 수 있게 만들기

---

## 📖 개념 정리

### `depends_on`의 함정 ⭐
```yaml
depends_on:
  - db
```
- 이건 `db` 컨테이너를 **먼저 시작**시켜줄 뿐, `db`가 **완전히 초기화되어 요청을 받을 준비**가 됐는지는 보장하지 않는다.
- MySQL 같은 DB는 컨테이너가 `Started` 상태가 돼도 내부적으로 초기화하는 데 몇 초~몇십 초가 더 걸림.
- 그래서 앱이 너무 빨리 접속을 시도하면 `ECONNREFUSED` 에러가 날 수 있음.
- 실전 해결책: 앱 코드에 **연결될 때까지 재시도하는 로직**을 넣는다.

---

## 🧪 실습

### 준비한 파일 (`08-project/`)
- `docker-compose.yml` — `web`(Express, build) + `db`(mysql:8, volume 연결)
- `app/index.js` — `connectWithRetry()`로 MySQL 연결 재시도 후 `notes` 테이블 생성, 메모 추가/조회 라우트

### 1) 실행
```bash
docker compose up -d
docker compose logs -f web
```
결과:
```
⏳ MySQL 연결 대기 중... 2초 후 재시도합니다. (connect ECONNREFUSED 172.20.0.2:3306)
⏳ MySQL 연결 대기 중... 2초 후 재시도합니다. (connect ECONNREFUSED 172.20.0.2:3306)
⏳ MySQL 연결 대기 중... 2초 후 재시도합니다. (connect ECONNREFUSED 172.20.0.2:3306)
✅ MySQL 연결 성공!
Server is running on port 3000
```
→ `db` 컨테이너는 시작됐지만 MySQL 프로세스가 아직 요청을 받을 준비가 안 돼서 처음 몇 번은 연결이 거부됨.
   앱에 넣어둔 재시도 로직 덕분에 죽지 않고 기다리다가 결국 연결 성공.
   (재시도 로직이 없었다면 앱이 그대로 크래시했을 것)
→ `172.20.0.2`는 `db` 서비스의 커스텀 네트워크 내부 IP (6회차 이름 기반 통신 개념의 연장)

### 2) 브라우저 확인
`http://localhost:3000` 접속 → 메모 입력 후 "추가" 클릭 → 목록에 쌓이는 것 확인 ✅

### 3) volume 유지 확인
```bash
docker compose restart web
```
재시작 후에도 기존에 추가한 메모가 그대로 남아있는 것 확인 ✅ (MySQL 데이터가 `db-data` volume에 저장됨)

### 4) Docker Hub에 이미지 push
```bash
docker login
docker tag 08-project-web gusqls0718/docker-study-notes-app
docker push gusqls0718/docker-study-notes-app
```
- `docker tag` : 로컬 이미지에 Docker Hub 규칙(`아이디/이미지이름`)에 맞는 이름표를 추가로 붙임
- `docker push` : 그 이름표가 붙은 이미지를 Docker Hub에 업로드
- 결과: `latest: digest: sha256:...` 출력되며 업로드 성공. 업로드 중 `Layer already exists`가 다수 보였는데,
  `node:18-alpine` 베이스 레이어는 이미 Docker Hub에 공개돼 있어서 재사용되고, 실제로 새로 만든
  코드/의존성 레이어만 업로드된 것.
- 공개 페이지: https://hub.docker.com/r/gusqls0718/docker-study-notes-app
- 다른 어떤 컴퓨터에서도 아래 명령어로 받아서 실행 가능해짐:
  ```bash
  docker pull gusqls0718/docker-study-notes-app
  ```

---

## ✅ 배운 점 / 정리
- `depends_on`은 시작 순서만 보장할 뿐 준비 상태까지 보장하지 않는다는 것을 직접 에러로 확인함
- 연결 재시도 로직으로 이런 타이밍 문제를 실전에서 어떻게 방어하는지 배움
- Express + MySQL을 Compose로 연결해서 실제 데이터 저장/조회가 되는 CRUD 웹앱을 완성함
- `docker tag` → `docker push`로 내가 만든 이미지를 Docker Hub에 배포하는 전체 과정을 완주함
- push 시 이미 존재하는 베이스 이미지 레이어는 재사용된다는 것을 로그로 재확인함

## ❓ 궁금했던 점 / 다음에 더 찾아볼 것
- (있다면 작성)
