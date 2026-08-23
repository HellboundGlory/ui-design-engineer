/**
 * Minimal fixture app for the visual-qa.js Playwright integration test
 * (tests/run-playwright-integration.js).
 *
 * Simulates a "streaming" interface — continuous polling that never goes network-idle,
 * content that arrives after initial load, plus a handful of deliberate, known
 * accessibility/structural defects — so the integration test can assert that:
 *   1. `--wait-until networkidle` fails/times out on this kind of app (the problem).
 *   2. `--wait-until load --wait-for <selector> --settle-ms <n>` succeeds (the fix).
 *   3. The deterministic structural checks in visual-qa.js actually catch the
 *      deliberately-planted defects below.
 *
 * No framework, no dependencies — plain Node http, deliberately disposable.
 */

const http = require("http");

const PORT = Number(process.env.PORT || 4173);

const html = `<!doctype html>
<html>
<head><title>Streaming fixture</title></head>
<body>
  <header style="position:sticky;top:0;background:white;height:60px;z-index:10;">
    <h1>Streaming Log Viewer (fixture)</h1>
  </header>
  <!-- Sticky header intentionally overlaps this button to exercise the focus-obscured check. -->
  <button id="obscured-btn" style="position:relative;top:-30px;">Covered by sticky header</button>
  <button id="zero-size-btn" style="width:0;height:0;overflow:hidden;border:0;padding:0;"> </button>
  <button id="tiny-btn" style="width:14px;height:14px;">x</button>
  <img id="broken-img" src="/does-not-exist.png" />
  <img id="no-alt-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7" />
  <div id="log-list" data-testid="log-list"></div>
  <script>
    // Never-idle network activity — analog for WebSocket/SSE/polling apps.
    setInterval(() => { fetch('/poll').catch(() => {}); }, 150);
    // Content arriving after initial load — analog for a streaming log/response panel.
    setTimeout(() => {
      document.getElementById('log-list').textContent = 'first log line arrived';
    }, 600);
  </script>
</body>
</html>`;

function start() {
  const server = http.createServer((req, res) => {
    if (req.url === "/poll") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });
  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server));
  });
}

if (require.main === module) {
  start().then(() => console.log(`Streaming fixture listening on http://localhost:${PORT}`));
}

module.exports = { start, PORT };
