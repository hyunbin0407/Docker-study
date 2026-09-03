# 6회차 - 네트워크 이해하기

## 🎯 학습 목표
- Docker의 기본 네트워크(bridge)가 뭔지 이해하기
- 컨테이너끼리 서로 어떻게 통신하는지 이해하기
- 커스텀 네트워크를 만들면 컨테이너 이름만으로 서로 찾을 수 있다는 것 확인하기

---

## 📖 개념 정리

### 1. Docker 네트워크 종류
```bash
docker network ls
```
- **bridge**: 기본 네트워크. `docker run`할 때 아무 옵션 안 주면 자동으로 여기 연결됨
- **host**: 컨테이너가 호스트(내 컴퓨터)의 네트워크를 그대로 씀 (격리 없음)
- **none**: 네트워크 연결 자체가 없음

### 2. 기본 bridge 네트워크의 한계 ⭐
아무 옵션 없이 실행한 컨테이너는 전부 **기본(default) bridge**에 연결된다.
- 컨테이너끼리 IP로는 통신 가능
- 하지만 **컨테이너 이름으로는 서로를 찾지 못함** (자동 DNS 미지원)

### 3. 커스텀 네트워크의 장점
```bash
docker network create my-net
docker run -d --network my-net --name web nginx
```
- 커스텀 네트워크에 연결된 컨테이너끼리는 Docker의 **내장 DNS**를 통해
  컨테이너 이름만으로 서로를 찾고 통신할 수 있음
- 다음 회차(Docker Compose)에서 "웹 앱이 `db`라는 이름으로 데이터베이스에 접속"하는 방식의 기반 원리

---

## 🧪 실습

### 1단계: 기본 bridge에서 이름으로 통신 시도 (실패 확인)
```bash
docker run -d --name web1 nginx
docker run -it --rm busybox wget -qO- http://web1
```
결과:
```
wget: bad address 'web1'
```
→ `web1`, `busybox` 둘 다 기본 bridge에 연결됐지만, 이름 기반 DNS를 지원하지 않아서 실패.

### 2단계: 커스텀 네트워크로 해결 (성공 확인)
```bash
docker network create my-net
docker run -d --name web2 --network my-net nginx
docker run -it --rm --network my-net busybox wget -qO- http://web2
```
결과: nginx 기본 페이지 HTML이 정상적으로 출력됨 ✅
→ 같은 커스텀 네트워크(`my-net`)에 연결된 덕분에 `web2`라는 이름으로 접속 성공.

| | 기본 bridge | 커스텀 네트워크(my-net) |
|---|---|---|
| 이름으로 통신 | ❌ 불가 | ✅ 가능 |
| IP로 통신 | ✅ 가능 | ✅ 가능 |

### 3단계: 네트워크 정보 확인
```bash
docker network ls
docker network inspect my-net
```
- `IPAM.Config.Subnet: 172.19.0.0/16` → 이 네트워크가 컨테이너에 나눠줄 수 있는 IP 대역
- `Containers.web2.IPv4Address: 172.19.0.2/16` → `web2`가 이 네트워크에서 받은 실제 내부 IP
  (busybox가 `http://web2`로 접속했을 때 Docker DNS가 이 IP로 변환해준 것)

---

## ✅ 배운 점 / 정리
- 기본 bridge 네트워크는 컨테이너 이름 기반 자동 DNS를 지원하지 않는다는 것을 실패 사례로 직접 확인함
- 커스텀 네트워크(`docker network create`)를 만들어 컨테이너를 연결하면 이름만으로 통신 가능하다는 것을 확인함
- `docker network inspect`로 네트워크에 연결된 컨테이너와 각자의 내부 IP를 확인하는 방법을 익힘
- 이 원리가 Docker Compose에서 서비스 이름으로 서로 접속하는 방식의 기반이 된다는 것을 이해함

## ❓ 궁금했던 점 / 다음에 더 찾아볼 것
- (있다면 작성)
