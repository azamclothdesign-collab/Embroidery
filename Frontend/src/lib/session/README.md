Client-side helpers that remain required after Backend integration:

- Event buses (`notifyCartUpdated`, `notifyWishlistUpdated`, auth update events) so client hooks refresh after Server Actions.
- Display mappers (`cartDisplay`, `wishlistDisplay`, `buildLocalOrder`) for cart/checkout/order UI shaping.
- Type exports used by order-success and account pages (`LocalOrder`, etc.).

These are not a second source of truth for catalog or sessions. Auth tokens, cart, wishlist, and orders persist via httpOnly cookies + Backend APIs. Do not delete this folder while those event/display helpers are imported.
