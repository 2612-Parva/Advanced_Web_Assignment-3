const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/auth/ping', (req, res) => {
  console.log('GET /ping hit');
  res.json({ message: 'Ping GET success' });
});

app.post('/api/auth/ping', (req, res) => {
  console.log('POST /ping hit');
  res.json({ message: 'Ping POST success' });
});

app.listen(5000, () => {
  console.log('✅ Test server running at http://localhost:5000');
});
