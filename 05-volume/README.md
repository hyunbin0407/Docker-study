# 5회차 - 데이터 유지하기 (Volume)

## 🎯 학습 목표
- 컨테이너를 지우면 데이터도 같이 사라지는 문제를 직접 겪어보기
- Volume을 사용해서 데이터를 유지하는 방법 배우기
- Bind Mount로 내 컴퓨터 폴더를 컨테이너와 연결하는 방법 배우기

---

## 📖 개념 정리

### 1. 왜 컨테이너 데이터는 사라질까?
컨테이너 내부 파일시스템은 컨테이너와 생명주기를 같이 한다. `docker rm`으로 컨테이너를 삭제하면
그 안에서 만든 파일도 전부 같이 사라진다. (컨테이너는 "일회용"에 가까운 존재)

### 2. Volume — Docker가 관리하는 저장 공간
```bash
-v 볼륨이름:컨테이너내부경로
```
- Docker가 자체 관리하는 별도 저장 공간에 데이터를 저장
- 컨테이너를 지웠다가 같은 volume을 다시 연결하면 데이터가 그대로 남아있음
- 비유: 컨테이너는 "일회용 그릇", volume은 "냉장고" — 그릇은 매번 새로 써도 냉장고 속 재료는 그대로 있음

### 3. Bind Mount — 내 컴퓨터 폴더를 직접 연결
```bash
-v 내컴퓨터경로:컨테이너내부경로
```
- 내가 지정한 실제 로컬 폴더를 컨테이너 내부 경로에 그대로 연결
- 로컬 파일을 수정하면 컨테이너 재시작 없이 **즉시** 반영됨 (개발 중 코드 실시간 테스트에 유용)

| 구분 | Volume | Bind Mount |
|---|---|---|
| 관리 주체 | Docker가 관리 | 내가 직접 경로 지정 |
| 위치 | Docker 내부 저장 공간 | 내 컴퓨터의 실제 폴더 |
| 용도 | DB 데이터 등 영구 보관 | 개발 중 코드 실시간 반영 |

---

## 🧪 실습

### 1단계: 문제 상황 직접 겪어보기 (Volume 없이)
```bash
docker run -d -p 8080:80 --name test-no-vol nginx
docker exec test-no-vol sh -c "echo 'hello' > /usr/share/nginx/html/test.txt"
docker exec test-no-vol cat /usr/share/nginx/html/test.txt   # hello
docker rm -f test-no-vol
docker run -d -p 8080:80 --name test-no-vol nginx
docker exec test-no-vol cat /usr/share/nginx/html/test.txt
# 결과: cat: /usr/share/nginx/html/test.txt: No such file or directory
```
→ 컨테이너를 삭제하고 같은 이름으로 새로 만들어도, 컨테이너 ID가 달라지는 **완전히 다른 컨테이너**라서
   이전 데이터가 존재하지 않음을 확인.

### 2단계: Volume으로 해결하기
```bash
docker rm -f test-no-vol
docker volume create nginx-data
docker run -d -p 8080:80 --name test-with-vol -v nginx-data:/usr/share/nginx/html nginx
docker exec test-with-vol sh -c "echo 'hello persist' > /usr/share/nginx/html/test.txt"
docker rm -f test-with-vol
docker run -d -p 8080:80 --name test-with-vol -v nginx-data:/usr/share/nginx/html nginx
docker exec test-with-vol cat /usr/share/nginx/html/test.txt
# 결과: hello persist  ← 컨테이너를 지웠다 다시 만들어도 데이터 유지됨!
```

### 3단계: Bind Mount로 로컬 폴더 연결하기
```bash
docker rm -f test-with-vol
mkdir -p 05-volume/html
echo '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h1>Bind Mount Test! 로컬 파일이 그대로 보여요</h1></body></html>' > 05-volume/html/index.html
docker run -d -p 8080:80 --name test-bind -v ~/Workspace/Docker-study/05-volume/html:/usr/share/nginx/html nginx
```
- 브라우저에서 `localhost:8080` 접속 → 로컬에서 만든 HTML 내용이 그대로 표시됨 확인
- 컨테이너를 재시작하지 않고 **로컬 파일만 수정**한 뒤 새로고침 → 즉시 반영되는 것 확인

> ⚠️ 한글 깨짐 이슈: 처음에 `<meta charset="UTF-8">` 없이 HTML을 작성했더니 브라우저가 인코딩을
> 잘못 추측해서 한글이 깨져 보이는 문제(mojibake)가 있었음. `<meta charset="UTF-8">`를 head에
> 추가해서 해결.

---

## ✅ 배운 점 / 정리
- 컨테이너 삭제 시 내부 데이터가 함께 사라진다는 것을 `docker rm` 전후 파일 확인으로 직접 검증함
- Volume(`-v 이름:경로`)을 연결하면 컨테이너를 지웠다 다시 만들어도 데이터가 유지된다는 것을 확인함
- Bind Mount(`-v 로컬경로:컨테이너경로`)로 로컬 파일 수정이 컨테이너 재시작 없이 즉시 반영된다는 것을 확인함
- HTML 파일에는 `<meta charset="UTF-8">`을 꼭 넣어야 한글이 깨지지 않는다는 것을 실습 중 겪은 문제로 배움

## ❓ 궁금했던 점 / 다음에 더 찾아볼 것
- (있다면 작성)