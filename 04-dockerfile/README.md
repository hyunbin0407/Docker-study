# 4회차 - 나만의 이미지 만들기 (Dockerfile)

## 🎯 학습 목표
- Dockerfile 문법 이해하기 (`FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `CMD`)
- 직접 만든 앱을 이미지로 빌드해보기 (`docker build`)
- 빌드한 이미지로 컨테이너 실행해보기

---

## 📖 개념 정리

Dockerfile은 **"이미지를 어떻게 만들지 적어놓은 레시피"**다.

```dockerfile
FROM node:18-alpine       # 어떤 베이스 이미지 위에서 시작할지
WORKDIR /app              # 컨테이너 안 작업 폴더 지정 (이후 명령어의 기준 경로)
COPY package.json .       # package.json 먼저 복사
RUN npm install           # 컨테이너 안에서 의존성 설치
COPY . .                  # 나머지 소스 코드 전체 복사
EXPOSE 3000               # 이 컨테이너가 사용할 포트 명시 (문서화 목적)
CMD ["node", "index.js"]  # 컨테이너 실행 시 기본으로 실행할 명령어
```

- `package.json`을 먼저 복사해서 `npm install`부터 하고 그 다음 `COPY . .`로 소스 전체를 복사하는 이유:
  소스 코드만 바뀌고 의존성은 안 바뀌었을 때 `npm install` 레이어를 캐시로 재사용하기 위한 관례.
- Dockerfile의 각 줄은 빌드 시 **하나의 레이어(단계)**가 되고, `docker build` 로그에 그대로 순서대로 찍힌다.

---

## 🧪 실습

### 준비한 파일 (`04-dockerfile/app/`)
- `Dockerfile`
- `package.json` (express 의존성)
- `index.js` (간단한 express 서버, `/` 요청에 인사 메시지 응답)

### 1) 이미지 빌드
```bash
cd 04-dockerfile/app
docker build -t my-app .
```
빌드 로그(11단계)가 Dockerfile 각 줄과 1:1로 대응하는 걸 확인:
```
[1/5] FROM node:18-alpine...   ← FROM
[2/5] WORKDIR /app             ← WORKDIR
[3/5] COPY package.json .      ← COPY package.json .
[4/5] RUN npm install          ← RUN npm install
[5/5] COPY . .                 ← COPY . .
naming to docker.io/library/my-app:latest
```

### 2) 빌드된 이미지 확인
```bash
docker images
```
```
my-app:latest    af5db66a7f0d    195MB    47.3MB
```
→ 직접 빌드한 이미지가 목록에 새로 생성됨 (node:18-alpine 베이스 + express 포함 195MB)

### 3) 컨테이너 실행
```bash
docker run -d -p 3000:3000 --name my-app-container my-app
```

### 4) 브라우저 확인
`http://localhost:3000` 접속 → "Hello Docker! ..." 메시지 확인 완료 ✅

---

## ✅ 배운 점 / 정리
- Dockerfile의 각 줄(`FROM`, `WORKDIR`, `COPY`, `RUN`, `CMD`)이 빌드 로그의 각 단계와 정확히 대응한다는 것을 직접 확인함
- `docker build -t 이름 .`으로 내 코드 + 의존성을 하나의 이미지로 패키징할 수 있다는 것을 확인함
- 직접 빌드한 이미지도 지금까지 배운 `docker run`, `docker ps`, `docker logs` 등을 nginx 같은 기존 이미지와 동일하게 다룰 수 있다는 것 (이미지 출처만 다를 뿐 다루는 방식은 동일)
- `package.json`을 먼저 복사하고 나중에 `COPY . .`하는 관례가 레이어 캐시를 위한 것이라는 개념을 배움

## ❓ 궁금했던 점 / 다음에 더 찾아볼 것
- 이미지 용량(195MB)을 줄이는 방법 → 9회차 멀티스테이지 빌드에서 다룰 예정
