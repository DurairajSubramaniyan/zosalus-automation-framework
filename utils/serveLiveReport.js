const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.REPORT_PORT || '9323', 10);
const REPORT_FILE = path.resolve(__dirname, '..', 'playwright-report', 'index.html');

const server = http.createServer((_req, res) => {
  if (fs.existsSync(REPORT_FILE)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(REPORT_FILE, 'utf8'));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Report not generated yet. Run: npm run report:generate');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`📊 Live Zosalus Feature & Scenario Report Server listening at: http://localhost:${PORT}`);
});
