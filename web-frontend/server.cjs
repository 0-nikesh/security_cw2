const app = require('express')();
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('server.key'), 
    cert: fs.readFileSync('server.crt'), 
}

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Hello, HTTPS World!');
}).listen(443, () => {
  console.log('Server is running on port 443');
});