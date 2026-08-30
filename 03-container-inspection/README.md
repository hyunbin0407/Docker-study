# 3회차 - 컨테이너 안 들여다보기 (exec, logs, inspect)

## 🎯 학습 목표
- 실행 중인 컨테이너 내부에 접속해서 명령어 실행해보기 (`exec`)
- 컨테이너가 찍는 로그 확인하기 (`logs`)
- 컨테이너의 상세 설정 정보 확인하기 (`inspect`)

---

## 📖 개념 정리

### 1. `docker exec` — 실행 중인 컨테이너 안에서 명령어 실행
```bash
docker exec -it my-nginx /bin/bash
```
- `-i` (interactive): 표준 입력을 계속 열어둠
- `-t` (tty): 사람이 보기 편한 터미널 화면 형태로 보여줌
- `-it`를 같이 쓰면 마치 SSH로 접속한 것처럼 컨테이너 안에서 셸을 사용할 수 있음
- `docker run`(새 컨테이너 생성)과 달리, `docker exec`는 **이미 떠 있는 컨테이너 안에 들어가는 것**

### 2. `docker logs` — 컨테이너가 출력한 로그 확인
```bash
docker logs my-nginx
```
- 컨테이너 안 프로그램이 출력한 내용(표준 출력/에러)을 확인
- 문제가 생겼을 때 가장 먼저 확인하는 명령어
- `-f` 옵션을 붙이면 실시간으로 로그를 이어서 볼 수 있음 (`Ctrl+C`로 종료)

### 3. `docker inspect` — 컨테이너의 모든 상세 정보 확인
```bash
docker inspect my-nginx
```
- JSON 형태로 컨테이너의 IP 주소, 포트 설정, 환경변수, 실행 명령어 등 모든 메타데이터를 보여줌

---

## 🧪 실습

### 1) nginx 컨테이너 실행 (2회차에서 지웠으므로 재생성)
```bash
docker run -d -p 8080:80 --name my-nginx nginx
```

### 2) 컨테이너 내부 접속
```bash
docker exec -it my-nginx /bin/bash
```
컨테이너 내부에서:
```bash
ls /usr/share/nginx/html
# 결과: 50x.html  index.html
cat /etc/os-release
# 결과: Debian GNU/Linux 13 (trixie)
exit
```
- `index.html`이 브라우저에서 봤던 "Welcome to nginx!" 페이지의 실체 파일
- 컨테이너 내부는 Debian 리눅스지만, 맥 커널이 아니라 Docker Desktop이 띄운 리눅스 가상 커널을 공유해서 동작함
- `exit`로 셸에서 빠져나와도 컨테이너 자체는 계속 백그라운드 실행 상태 유지 (exec와 컨테이너 생명주기는 별개)

### 3) 로그 확인
```bash
docker logs my-nginx
```
- 시작 시 nginx 설정 스크립트 실행 로그 확인 (`OS: Linux ...-linuxkit` → linuxkit 가상 커널 위에서 동작 중임을 로그로도 확인)
- 브라우저로 `localhost:8080` 재접속 후 다시 확인하니 접속(access) 로그가 추가됨:
  ```
  192.168.65.1 - - [.. ] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 ... Chrome/150.0.0.0 ..."
  ```
  - `192.168.65.1` : 맥(호스트) → 컨테이너로 들어올 때 보이는 Docker 게이트웨이 IP
  - `304` : Not Modified — 브라우저 캐시가 있어서 서버가 "안 바뀌었다"고 응답한 상태 코드

### 4) 상세 정보 확인
```bash
docker inspect my-nginx
```
주요 항목:
- `State.Running: true`, `State.Pid` → 실행 상태와 호스트 관점의 프로세스 번호 (컨테이너 안에서 본 PID 1과는 다름 → 격리의 예시)
- `NetworkSettings.Networks.bridge.IPAddress: 172.17.0.2` → 컨테이너 전용 내부 IP
- `NetworkSettings.Networks.bridge.Gateway: 172.17.0.1` → 컨테이너가 속한 가상 네트워크의 게이트웨이
- `HostConfig.PortBindings` → `docker run -p 8080:80`으로 지정한 매핑 설정이 그대로 저장되어 있음
- `Config.Env`, `Config.Cmd`, `Config.Entrypoint` → 컨테이너 시작 시 사용된 환경변수/실행 명령어 (4회차 Dockerfile에서 직접 정의해볼 항목들)
- `ImageManifestDescriptor.platform.architecture: arm64` → 맥북(M칩)에 맞는 arm64 이미지가 받아졌음을 확인

---

## ✅ 배운 점 / 정리
- `exec`로 실행 중인 컨테이너 내부에 들어가 직접 파일/환경을 확인할 수 있다는 것을 실습함
- `logs`로 시작 로그뿐 아니라 실시간 접속 기록(access log)까지 확인 가능하다는 것을 확인함
- `inspect`를 통해 컨테이너가 자기만의 내부 IP(`172.17.0.2`)와 PID 공간을 가진 격리된 환경이라는 것을 직접 확인함
- 컨테이너 안(PID 1)과 호스트(다른 PID 번호)에서 같은 프로세스를 다르게 본다는 것 → 컨테이너 격리 개념의 실제 사례

## ❓ 궁금했던 점 / 다음에 더 찾아볼 것
- (있다면 작성)
