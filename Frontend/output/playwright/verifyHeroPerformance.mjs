async (page) => {
  const videoRequests = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.endsWith(".mp4") || url.endsWith(".webm")) {
      videoRequests.push(url);
    }
  });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3008/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const reduced = await page.evaluate(() => {
    const hero = document.querySelector(
      "section[aria-labelledby='home-hero-heading']",
    );
    const how = document.querySelector(
      "section[aria-labelledby='how-it-works-heading']",
    );
    return {
      heroVideos: hero?.querySelectorAll("video").length ?? 0,
      pageVideos: document.querySelectorAll("video").length,
      headingVisible:
        (hero?.querySelector("#home-hero-heading")?.getBoundingClientRect()
          .height ?? 0) > 0,
      howPinned: how?.parentElement?.className.includes("pin-spacer") ?? false,
    };
  });
  await page.screenshot({
    path: "output/playwright/reduced-motion-hero.png",
    fullPage: false,
  });

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3008/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const mobile = await page.evaluate(() => {
    const hero = document.querySelector(
      "section[aria-labelledby='home-hero-heading']",
    );
    return {
      heroVideos: hero?.querySelectorAll("video").length ?? 0,
      poster: hero?.querySelector("img") !== null,
    };
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3008/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const desktop = await page.evaluate(() => {
    const hero = document.querySelector(
      "section[aria-labelledby='home-hero-heading']",
    );
    return {
      heroVideos: hero?.querySelectorAll("video").length ?? 0,
    };
  });

  return {
    videoRequests,
    reduced,
    mobile,
    desktop,
  };
}
