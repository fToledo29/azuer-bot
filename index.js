const express = require('express')
const app = express()
const port = process.env.PORT || 8000;
const bot = require('./bot');

console.log('Bot starting...');

bot();
setInterval(bot, 10000);

app.get('/', (req, res) => {
  res.send('Hi, this is Azuer Bot')
});

app.listen(port, () => {
  console.log(`listening at port: ${port}`);
});