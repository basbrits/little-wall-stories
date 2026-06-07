# Checkout paused update

This update keeps the webshop browseable, but prevents real orders for now.

Upload these files to the root of your GitHub repository and replace the existing versions:

- `index.html`
- `styles.css`
- `script.js`

Do not change the `assets` folder.

## What changed

- The cart still works for preview/testing.
- The hero button now says **Preview cart** instead of **Buy now**.
- The checkout button is disabled and says **Checkout opens soon**.
- The old email-order checkout has been removed from JavaScript.
- The FAQ now clearly says checkout is not live yet.

When you are ready to accept orders, the checkout action can be connected to Stripe, Shopify, WooCommerce, or email ordering again.
