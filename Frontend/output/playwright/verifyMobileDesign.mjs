async (page) => {
  const cspErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      cspErrors.push(msg.text());
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3007/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const hero = page.locator("section[aria-labelledby='home-hero-heading']");
  const heroBox = await hero.boundingBox();
  const headingBox = await page.locator("#home-hero-heading").boundingBox();
  const explore = hero.getByRole("link", { name: "Explore Designs" });
  const exploreBox = await explore.boundingBox();
  const howItWorksVisible = await hero
    .getByRole("link", { name: "How It Works" })
    .isVisible();
  const scrollVisible = await hero.getByRole("link", { name: "Scroll" }).isVisible();

  const header = page.locator("header").first();
  const logoVisible = await header.getByRole("link", { name: "Embroidery" }).isVisible();
  const menuVisible = await header.getByRole("button", { name: "Menu" }).isVisible();
  const searchInHeader = await header
    .getByRole("button", { name: "Search designs" })
    .isVisible();
  const cartInHeader = await header.getByRole("button", { name: "Cart" }).isVisible();
  const shopInHeader = await header
    .getByRole("link", { name: "Shop Designs" })
    .isVisible();
  const primaryNavVisible = await header
    .getByRole("navigation", { name: "Primary" })
    .isVisible();

  await page.screenshot({
    path: "output/playwright/mobile-hero.png",
    fullPage: false,
  });

  await header.getByRole("button", { name: "Menu" }).click();
  await page.waitForTimeout(500);
  const mobileNav = page.locator("#mobile-navigation");
  const menuItems = await mobileNav.locator("a, button").evaluateAll((nodes) =>
    nodes.map((node) => node.textContent?.trim()),
  );
  await page.screenshot({
    path: "output/playwright/mobile-menu.png",
    fullPage: false,
  });
  await header.getByRole("button", { name: "Close menu" }).click();
  await page.waitForTimeout(400);

  const grid = page.locator("#best-sellers ul");
  await grid.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const gridInfo = await grid.evaluate((el) => {
    const style = getComputedStyle(el);
    const items = Array.from(el.querySelectorAll(":scope > li"));
    return {
      columns: style.gridTemplateColumns,
      columnCount: style.gridTemplateColumns.split(" ").filter(Boolean).length,
      itemCount: items.length,
      names: items.map((item) => item.querySelector("h3")?.textContent?.trim()),
      prices: items.map((item) => {
        const paragraphs = Array.from(item.querySelectorAll("p"));
        return paragraphs
          .map((p) => p.textContent?.trim())
          .find((text) => text?.startsWith("$"));
      }),
    };
  });
  const ratingVisible = await page
    .locator("#best-sellers article")
    .first()
    .locator('[aria-label*="out of"]')
    .isVisible()
    .catch(() => false);
  await page.locator("#best-sellers").screenshot({
    path: "output/playwright/mobile-product-grid.png",
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3007/en", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const desktopHeader = page.locator("header").first();
  const desktop = {
    search: await desktopHeader.getByRole("button", { name: "Search designs" }).isVisible(),
    cart: await desktopHeader.getByRole("button", { name: "Cart" }).isVisible(),
    shop: await desktopHeader.getByRole("link", { name: "Shop Designs" }).isVisible(),
    menu: await desktopHeader.getByRole("button", { name: "Menu" }).isVisible(),
    howItWorks: await page
      .locator("section[aria-labelledby='home-hero-heading']")
      .getByRole("link", { name: "How It Works" })
      .isVisible(),
    gridColumns: await page.locator("#best-sellers ul").evaluate((el) =>
      getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length,
    ),
  };
  await page.screenshot({
    path: "output/playwright/desktop-hero.png",
    fullPage: false,
  });

  return {
    cspErrors,
    heroHeight: heroBox?.height,
    viewportHeight: 844,
    headingY: headingBox?.y,
    headingHeight: headingBox?.height,
    exploreWidth: exploreBox?.width,
    viewportWidth: 390,
    howItWorksVisible,
    scrollVisible,
    logoVisible,
    menuVisible,
    searchInHeader,
    cartInHeader,
    shopInHeader,
    primaryNavVisible,
    menuItems,
    gridInfo,
    ratingVisible,
    desktop,
  };
}
