import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:29206";
const out = [];
const log = (k, v) => {
  out.push(`${k}: ${v}`);
  console.log(`${k}: ${v}`);
};

const browser = await chromium.launch();

// --- Relay card: keyboard focus ring + Enter/Space operability + copy feedback ---
const page1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page1.goto(`${BASE}/#/technical`);
await page1.waitForSelector(".theme-relay");
await page1.waitForTimeout(400);

const focusables = await page1.locator(".theme-relay :is(button, a)").all();
log("relay.focusableCount", focusables.length);

await page1.locator('.relay-iconbtn[aria-label*="Copy"]').focus();
await page1.screenshot({ path: ".eval/interaction/relay-copy-focus.png", clip: { x: 480, y: 130, width: 480, height: 560 } });
const copyRing = await page1.locator('.relay-iconbtn[aria-label*="Copy"]').evaluate((el) => {
  const cs = getComputedStyle(el);
  return { outline: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor };
});
log("relay.copyBtnFocusRing", JSON.stringify(copyRing));

await page1.keyboard.press("Enter");
await page1.waitForTimeout(200);
const copyLabel = await page1.locator('.relay-iconbtn[aria-label*="opy"]').getAttribute("aria-label");
log("relay.copyAfterEnter aria-label", copyLabel);
const clip = await page1.evaluate(() => navigator.clipboard.readText().catch((e) => `unreadable: ${e.name}`));
log("relay.clipboard", clip);
await page1.close();

// --- Tend card: hover lift, active squash, Enter activation, focus ring ---
const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page2.goto(`${BASE}/#/playful`);
await page2.waitForSelector(".theme-tend");
await page2.waitForTimeout(400);

const cta = page2.locator(".tend-btn-primary");
await cta.focus();
const ctaRing = await cta.evaluate((el) => {
  const cs = getComputedStyle(el);
  return { outline: cs.outlineStyle, outlineWidth: cs.outlineWidth };
});
log("tend.ctaFocusRing", JSON.stringify(ctaRing));
await page2.screenshot({ path: ".eval/interaction/tend-cta-focus.png" });

await cta.hover();
await page2.waitForTimeout(300);
const hoverTranslate = await cta.evaluate((el) => getComputedStyle(el).translate);
log("tend.ctaHoverTranslate", hoverTranslate);
await page2.screenshot({ path: ".eval/interaction/tend-cta-hover.png" });

await page2.keyboard.press("Enter");
await page2.waitForTimeout(150);
log("tend.ctaAfterEnter", await cta.innerText());
await page2.close();

// --- prefers-reduced-motion: transitions must collapse ---
const page3 = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
await page3.goto(`${BASE}/#/playful`);
await page3.waitForSelector(".theme-tend");
await page3.waitForTimeout(300);
const reduced = await page3.evaluate(() => {
  const probe = document.createElement("div");
  probe.className = "tend-chip";
  document.querySelector(".theme-tend").appendChild(probe);
  const d = getComputedStyle(probe).transitionDuration;
  probe.remove();
  return d;
});
log("tend.reducedMotionTransitionDuration", reduced);

await page3.goto(`${BASE}/#/technical`);
await page3.waitForSelector(".theme-relay");
await page3.waitForTimeout(300);
const reducedRelay = await page3.evaluate(() => {
  const probe = document.createElement("button");
  probe.className = "relay-btn";
  document.querySelector(".theme-relay").appendChild(probe);
  const d = getComputedStyle(probe).transitionDuration;
  probe.remove();
  return d;
});
log("relay.reducedMotionTransitionDuration", reducedRelay);
await page3.close();

// --- Tab order sanity on compare view ---
const page4 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page4.goto(`${BASE}/#/compare`);
await page4.waitForSelector(".theme-relay");
const order = [];
await page4.keyboard.press("Tab");
for (let i = 0; i < 10; i++) {
  const info = await page4.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    return `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ")[0] : ""} "${(el.getAttribute("aria-label") ?? el.textContent ?? "").slice(0, 28)}"`;
  });
  if (info) order.push(info);
  await page4.keyboard.press("Tab");
}
log("compare.tabOrder", JSON.stringify(order, null, 1));
await page4.close();

await browser.close();
console.log("\nALL INTERACTION CHECKS COMPLETE");
