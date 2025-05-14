const express = require('express');
const helmet = require('helmet');

const app = express();
app.use(helmet());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString(), author: 'Eugenio Gordillo Argüello desde DEV' });
});

app.get('/age', (_req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString(), age: '21 years old' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Healthcheck service running on port ${PORT}`);
});
