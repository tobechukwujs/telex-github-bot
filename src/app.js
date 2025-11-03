const express = require('express');
const telexRoutes = require('./routes/telex.routes');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/', telexRoutes);

app.get('/', (req, res) => {
  res.status(200).send('Telex GitHub Bot is alive!');
});

module.exports = app;
