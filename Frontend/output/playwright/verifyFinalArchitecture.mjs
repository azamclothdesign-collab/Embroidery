async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3010/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const order = await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll(
        "#home-hero-heading, [aria-label='Trust'], #featured-categories-heading, #best-sellers-heading, #from-screen-to-stitch-heading, #problem-solution-heading, #how-it-works-heading, #machine-compatibility-heading, #stitched-community-heading, #testimonials-heading, #impact-heading, #featured-collection-heading, #guides-heading, #faq-heading, #final-cta-heading, footer",
      ),
    );
    return nodes.map((node) => {
      if (node.tagName === "FOOTER") {
        return "footer";
      }
      return node.id || node.getAttribute("aria-label");
    });
  });

  const marqueePause = await page.getByRole("button", { name: "Pause" }).count();
  const header = await page.locator("header").first().isVisible();

  await page.locator("#how-it-works-heading").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const howPinned = await page.evaluate(() => {
    const heading = document.querySelector("#how-it-works-heading");
    const section = heading?.closest("section");
    return section?.parentElement?.className.includes("pin-spacer") ?? false;
  });

  const guidesEyebrow = await page
    .locator("#guides-heading")
    .locator("xpath=preceding-sibling::p[1]")
    .innerText();

  return {
    header,
    order,
    marqueePause,
    howPinned,
    guidesEyebrow,
  };
}
