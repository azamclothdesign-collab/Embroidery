async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3011/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const heroFrame = page.locator(".heroFrame");
  const scaleBefore = await heroFrame.evaluate((el) => getComputedStyle(el).transform);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(400);
  const scaleAfter = await heroFrame.evaluate((el) => getComputedStyle(el).transform);

  await page.locator("#featured-categories-heading").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const categoryClip = await page.evaluate(() => {
    const frame = document.querySelector("[data-motion-frame]");
    return frame ? getComputedStyle(frame).clipPath : null;
  });

  await page.locator("#how-it-works-heading").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const howPinned = await page.evaluate(() => {
    const heading = document.querySelector("#how-it-works-heading");
    const section = heading?.closest("section");
    return section?.parentElement?.className.includes("pin-spacer") ?? false;
  });

  const marqueePause = await page.getByRole("button", { name: "Pause" }).count();
  const menu = await page.getByRole("button", { name: "Menu" }).count();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://localhost:3011/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.locator("#how-it-works-heading").scrollIntoViewIfNeeded();
  const howPinnedReduced = await page.evaluate(() => {
    const heading = document.querySelector("#how-it-works-heading");
    const section = heading?.closest("section");
    return section?.parentElement?.className.includes("pin-spacer") ?? false;
  });

  return {
    scaleBefore,
    scaleAfter,
    heroScaled: scaleAfter !== "none" && scaleAfter !== scaleBefore,
    categoryClip,
    howPinned,
    marqueePause,
    menu,
    howPinnedReduced,
  };
}
