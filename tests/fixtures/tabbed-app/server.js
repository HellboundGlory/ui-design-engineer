/**
 * Fixture app for tests/run-multistate-integration.js.
 *
 * Reproduces the exact failure class Test D's evaluation surfaced (see
 * evals/results/2026-08-24-opencode-claude-v1.2.0/RESULTS.md, Test D and "Recommended
 * Skill Changes" P1): a client-rendered, tab-switched SPA where the default tab is
 * clean and a SECOND tab contains a genuine structural defect (horizontal overflow from
 * an over-wide table) that a single-render pass at the default state can never see,
 * because the offending content only lays out once its panel is actually revealed.
 *
 * Routes:
 *   /            the tabbed app — "Account" tab active by default (clean), "Billing"
 *                tab (data-tab="billing") reveals a deliberately over-wide table that
 *                overflows the viewport horizontally once shown.
 *   /settings    a second route serving the same app shell, for the multi-route (not
 *                interaction-state) half of the regression coverage.
 *
 * No framework, no dependencies — plain Node http, deliberately disposable.
 */

const http = require("http");

const PORT = Number(process.env.PORT || 4174);

const tabbedHtml = `<!doctype html>
<html lang="en">
<head><title>Tabbed settings fixture</title></head>
<body>
  <nav role="tablist">
    <button data-tab="account" class="tab" role="tab" aria-selected="true">Account</button>
    <button data-tab="billing" class="tab" role="tab" aria-selected="false">Billing</button>
  </nav>
  <section data-panel="account">
    <h1>Account settings</h1>
    <p>Clean panel — no planted defects here.</p>
  </section>
  <section data-panel="billing" hidden>
    <h1>Billing</h1>
    <!-- Deliberately wider than any reasonable viewport — invisible to a default-tab-only
         capture because the panel starts hidden, exactly reproducing the Test D gap. -->
    <table style="width:2000px;border-collapse:collapse;">
      <tr><td>Invoice</td><td>Amount</td><td>Status</td><td>Date</td><td>Method</td><td>Notes</td></tr>
      <tr><td>INV-001</td><td>$1,200</td><td>Paid</td><td>2026-01-01</td><td>Card</td><td>Overflowing on purpose</td></tr>
    </table>
  </section>
  <script>
    document.querySelectorAll('.tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab').forEach(function (b) {
          b.setAttribute('aria-selected', String(b === btn));
        });
        document.querySelectorAll('[data-panel]').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-panel') !== target;
        });
      });
    });
  </script>
</body>
</html>`;

const ROUTES = {
  "/": tabbedHtml,
  "/settings": tabbedHtml,
};

function start() {
  const server = http.createServer((req, res) => {
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
  start().then(() => console.log(`Tabbed-app fixture listening on http://localhost:${PORT}`));
}

module.exports = { start, PORT };
