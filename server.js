const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const htmlPath = path.join(__dirname, 'preview.html');

const server = http.createServer((req, res) => {
  fs.readFile(htmlPath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading preview');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Trading OS preview server listening on port ' + PORT);
});
