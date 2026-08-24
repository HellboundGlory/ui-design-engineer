import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:29206/#/technical");
await page.waitForSelector(".theme-relay");
await page.waitForTimeout(300);
await page.evaluate(() => {
  window.__events = [];
  const btn = document.querySelector(".relay-iconbtn");
  for (const t of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
    btn.addEventListener(t, (e) => window.__events.push(`${t} target=${e.target.tagName} trusted=${e.isTrusted}`));
  }
});
const box = await page.locator(".relay-iconbtn").boundingBox();
console.log("bbox:", JSON.stringify(box));
const atPoint = await page.evaluate(([x, y]) => {
  const el = document.elementFromPoint(x, y);
  return el ? `${el.tagName}.${el.className?.baseVal ?? el.className}` : "none";
}, [box.x + box.width / 2, box.y + box.height / 2]);
console.log("elementFromPoint:", atPoint);
await page.locator(".relay-iconbtn").click();
await page.waitForTimeout(200);
console.log("events:", JSON.stringify(await page.evaluate(() => window.__events)));
console.log("label:", await page.locator(".relay-iconbtn").getAttribute("aria-label"));
await browser.close();
