async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3009/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const order = await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll(
        "#home-hero-heading, #featured-categories-heading, #best-sellers-heading, #from-screen-to-stitch-heading, #problem-solution-heading, [aria-label='Trust'], #impact-heading, #guides-heading, #machine-compatibility-heading, #stitched-community-heading, #testimonials-heading, #featured-collection-heading, #how-it-works-heading, #faq-heading, #final-cta-heading",
      ),
    );
    return nodes.map((node) => node.id || node.getAttribute("aria-label"));
  });

  const marqueePause = await page.getByRole("button", { name: "Pause" }).count();

  const hero = page.locator("section[aria-labelledby='home-hero-heading']");
  const heroFrame = hero.locator(".heroFrame");
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(300);
  const heroScale = await heroFrame.evaluate((el) => getComputedStyle(el).transform);

  await page.locator("#how-it-works-heading").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const howPinned = await page.evaluate(() => {
    const heading = document.querySelector("#how-it-works-heading");
    const section = heading?.closest("section");
    return section?.parentElement?.className.includes("pin-spacer") ?? false;
  });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://localhost:3009/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.locator("#how-it-works-heading").scrollIntoViewIfNeeded();
  const howPinnedReduced = await page.evaluate(() => {
    const heading = document.querySelector("#how-it-works-heading");
    const section = heading?.closest("section");
    return section?.parentElement?.className.includes("pin-spacer") ?? false;
  });

  return {
    order,
    marqueePause,
    heroScale,
    howPinned,
    howPinnedReduced,
  };
}
