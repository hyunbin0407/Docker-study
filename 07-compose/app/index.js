const express = require('express');
const redis = require('redis');

const app = express();
const PORT = 3000;

// REDIS_HOST 환경변수로 redis 서비스에 접속 (docker-compose.yml에서 지정)
const client = redis.createClient({
  socket: { host: process.env.REDIS_HOST || 'localhost' }
});
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

app.get('/', async (req, res) => {
  const count = await client.incr('visits');
  res.send(`이 페이지를 ${count}번째 방문하셨어요! 🎉`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
