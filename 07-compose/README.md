# 7회차 - 여러 컨테이너 관리하기 (Docker Compose)

## 🎯 학습 목표
- `docker-compose.yml` 구조 이해하기
- 웹서버(Express) + DB(Redis) 두 컨테이너를 Compose로 한 번에 실행해보기
- 지금까지 배운 개념(포트, 볼륨, 네트워크)이 Compose 안에서 어떻게 자동으로 쓰이는지 확인하기

---

## 📖 개념 정리

```yaml
services:
  web:                    # 서비스 이름
    build: ./app          # 이 폴더의 Dockerfile로 빌드
    ports:
      - "3000:3000"       # docker run의 -p 옵션과 동일
    environment:
      - REDIS_HOST=redis  # redis라는 "서비스 이름"으로 접속
    depends_on:
      - redis             # redis를 먼저 실행

  redis:
    image: redis:7-alpine # 이미 있는 이미지 그대로 사용
    volumes:
      - redis-data:/data  # docker run의 -v 옵션과 동일 (5회차 volume 개념)

volumes:
  redis-data:
```

**핵심 포인트**: `REDIS_HOST=redis`에서 `redis`는 IP도 아니고 별도 설정도 안 했는데 접속이 되는 이유는,
**Compose가 실행되는 서비스들을 자동으로 하나의 커스텀 네트워크에 묶어주기 때문**이다.
6회차에서 직접 `docker network create`로 했던 걸 Compose가 대신 해주는 것.

### 주요 명령어
```bash
docker compose up -d      # 정의된 모든 서비스를 백그라운드로 실행
docker compose ps         # 이 프로젝트의 컨테이너 상태 확인
docker compose logs -f    # 전체 서비스 로그 실시간 확인
docker compose down       # 전체 컨테이너 정지 + 삭제 (네트워크도 함께 정리, volume은 유지)
```

---

## 🧪 실습

"방문할 때마다 숫자가 올라가는" 간단한 웹앱: Express(웹서버) + Redis(카운터 저장소)

### 준비한 파일 (`07-compose/`)
- `docker-compose.yml`
- `app/Dockerfile`, `app/package.json`, `app/index.js` (`client.incr('visits')`로 방문 카운트 증가)

### 1) 실행
```bash
cd 07-compose
docker compose up -d
```
로그로 Compose가 자동 처리한 것들을 확인:
```
✔ Image redis:7-alpine         Pulled     ← image로 지정 → 그대로 받아옴
✔ Image 07-compose-web         Built      ← build로 지정 → 직접 빌드
✔ Network 07-compose_default   Created    ← 커스텀 네트워크 자동 생성 (6회차 개념)
✔ Volume 07-compose_redis-data Created    ← volume 자동 생성 (5회차 개념)
✔ Container 07-compose-redis-1 Started    ← depends_on 덕분에 redis 먼저 시작
✔ Container 07-compose-web-1   Started
```

### 2) 상태 확인
```bash
docker compose ps
```
```
NAME                 SERVICE   STATUS         PORTS
07-compose-redis-1   redis     Up 9 seconds   6379/tcp
07-compose-web-1     web       Up 9 seconds   0.0.0.0:3000->3000/tcp...
```
- `redis`는 `ports`를 안 적어서 호스트에 노출되지 않음 → `web`에서만 내부 네트워크로 접근 가능 (DB를 외부에 직접 노출하지 않는 것이 정상적인 구성)

### 3) 브라우저 확인
`http://localhost:3000` 접속 → "이 페이지를 N번째 방문하셨어요!" 메시지 확인.
**새로고침할 때마다 숫자가 올라가는 것 확인 완료 ✅**

### 4) volume 유지 확인
```bash
docker compose restart web
```
→ web만 재시작 후 새로고침해도 카운트가 초기화되지 않고 이어서 올라감 확인 ✅
(Redis 데이터가 `redis-data` volume에 저장되어 있어서 컨테이너 재시작과 무관하게 유지됨)

---

## ✅ 배운 점 / 정리
- `docker-compose.yml` 파일 하나로 여러 컨테이너(웹서버+DB)를 한 번에 정의하고 실행할 수 있다는 것을 확인함
- Compose가 서비스들을 자동으로 커스텀 네트워크에 묶어줘서, 서비스 이름(`redis`)만으로 서로 접속 가능하다는 것을 확인함 (6회차 네트워크 개념의 실전 적용)
- `volumes` 설정으로 컨테이너를 재시작해도 데이터가 유지된다는 것을 실제로 확인함 (5회차 volume 개념의 실전 적용)
- `build`(직접 빌드) vs `image`(그대로 사용)를 한 파일 안에서 함께 쓸 수 있다는 것을 확인함
- 지금까지 배운 개념(이미지 빌드, 볼륨, 네트워크)이 Compose 안에서 어떻게 조합되는지 종합적으로 이해함

## ❓ 궁금했던 점 / 다음에 더 찾아볼 것
- (있다면 작성)
