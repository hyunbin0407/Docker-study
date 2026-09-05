const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.urlencoded({ extended: true }));

let pool;

// MySQL이 아직 준비되지 않았을 수 있으므로, 연결될 때까지 재시도
async function connectWithRetry() {
  while (true) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      await pool.query('SELECT 1');
      console.log('✅ MySQL 연결 성공!');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          content VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      break;
    } catch (err) {
      console.log('⏳ MySQL 연결 대기 중... 2초 후 재시도합니다. (' + err.message + ')');
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

app.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM notes ORDER BY id DESC');
  const list = rows.map((r) => `<li>${r.content} <small>(${r.created_at})</small></li>`).join('');
  res.send(`
    <html><head><meta charset="UTF-8"><title>메모장</title></head>
    <body>
      <h1>📝 메모장 (Express + MySQL)</h1>
      <form method="POST" action="/add">
        <input name="content" placeholder="메모를 입력하세요" required />
        <button type="submit">추가</button>
      </form>
      <ul>${list}</ul>
    </body></html>
  `);
});

app.post('/add', async (req, res) => {
  await pool.query('INSERT INTO notes (content) VALUES (?)', [req.body.content]);
  res.redirect('/');
});

const PORT = 3000;
connectWithRetry().then(() => {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});
