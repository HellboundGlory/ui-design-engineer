/**
 * Fixture app for the visual-qa.js Playwright integration test
 * (tests/run-playwright-integration.js). Several routes, each isolating one scenario
 * so hard-failure defects on one route never mask what a DIFFERENT route is testing:
 *
 *   /                        streaming behavior + a mix of HARD structural defects
 *                            (broken image, missing alt, zero-size button, focus-
 *                            obscured button) — proves `--wait-until networkidle`
 *                            fails on a never-idle app and `load` + `--wait-for` +
 *                            `--settle-ms` succeeds and catches real defects.
 *   /small-target-only       ONE undersized (but non-zero) button and nothing else
 *                            wrong — proves an undersized target ALONE is advisory
 *                            (REVIEW) and does not by itself cause a hard QA failure.
 *   /page-error              throws an uncaught runtime exception shortly after load —
 *                            proves page runtime errors are surfaced and fail QA.
 *   /broken-structural-checks overrides document.querySelectorAll so the structural-
 *                            check evaluate() call itself throws, deterministically
 *                            (no navigation race) — proves a failed structural-check
 *                            run is reported as INCOMPLETE, never as "no defects found".
 *
 * No framework, no dependencies — plain Node http, deliberately disposable.
 */

const http = require("http");

const PORT = Number(process.env.PORT || 4173);

const streamingHtml = `<!doctype html>
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

const smallTargetOnlyHtml = `<!doctype html>
<html lang="en">
<head><title>Small target fixture</title></head>
<body>
  <button id="small-btn" style="width:18px;height:18px;padding:0;border:1px solid #000;">OK</button>
</body>
</html>`;

const pageErrorHtml = `<!doctype html>
<html lang="en">
<head><title>Page error fixture</title></head>
<body>
  <p>Fixture for an uncaught runtime error.</p>
  <script>
    setTimeout(() => { nonExistentFixtureFunction(); }, 50);
  </script>
</body>
</html>`;

const brokenStructuralChecksHtml = `<!doctype html>
<html lang="en">
<head><title>Broken structural-check fixture</title></head>
<body>
  <p>Fixture that deliberately breaks a DOM API the structural-check script depends on.</p>
  <script>
    // Deterministic (no navigation-timing race): forces visual-qa.js's
    // page.evaluate(STRUCTURAL_CHECKS_SRC) to throw on its first DOM query, so the
    // integration test can assert the failure is reported as an incomplete QA pass
    // rather than "no defects found". Only the FIRST call throws, then original
    // behavior is restored — axe-core also calls document.querySelectorAll internally
    // for its own scan, and a permanent break would take down the unrelated axe pass
    // too instead of isolating the structural-check failure this route exists to test.
    (function () {
      var original = document.querySelectorAll.bind(document);
      var calls = 0;
      document.querySelectorAll = function () {
        calls++;
        if (calls === 1) throw new Error("fixture: forced structural-check failure");
        return original.apply(document, arguments);
      };
    })();
  </script>
</body>
</html>`;

const ROUTES = {
  "/": streamingHtml,
  "/small-target-only": smallTargetOnlyHtml,
  "/page-error": pageErrorHtml,
  "/broken-structural-checks": brokenStructuralChecksHtml,
};

function start() {
  const server = http.createServer((req, res) => {
    if (req.url === "/poll") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }
    const html = ROUTES[req.url];
    if (!html) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("not found");
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
