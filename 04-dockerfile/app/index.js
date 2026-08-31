const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello Docker! 이 페이지는 내가 만든 Dockerfile로 빌드된 컨테이너에서 응답한 거예요 🐳');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
