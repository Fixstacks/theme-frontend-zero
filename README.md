# Zero theme for Magento Open Source

A storefront theme built on the web platform: server-rendered HTML, HTMX for
the parts that refresh, Tailwind CSS v4 and daisyUI for styles. No RequireJS,
jQuery or Knockout on the storefront. Strict CSP, WCAG 2.2 AA, WebP images.

Demo: https://zero.fixstacks.com

The theme requires two modules, installed with it:

| Package | What it does |
| --- | --- |
| `vilmate/module-zero-core` | HTMX endpoints for private content, view models for the templates |
| `vilmate/module-zero-checkout` | One-page checkout without Knockout |

Optional: `vilmate/module-zero-banner` for the home page slider.

## Install

Requires Magento Open Source 2.4.7–2.4.9 and PHP 8.2–8.4.

```bash
composer require vilmate/theme-frontend-zero
bin/magento setup:upgrade
bin/magento setup:di:compile           # production mode
bin/magento setup:static-content:deploy # production mode
bin/magento cache:flush
```

Composer installs `vilmate/module-zero-core`, `vilmate/module-zero-checkout` with it.

Then choose the theme: Content > Design > Configuration > your store view >
**Zero**. Its parent is Magento/blank, installed with Magento.

## Styles

`web/css/app.css` ships built. Rebuild it after you add, enable or disable a
module with storefront styles, or change the theme's templates:

```bash
cd vendor/vilmate/theme-frontend-zero   # or your child theme's folder
npm ci && npm run build
```

The build reads the enabled modules from `app/etc/config.php` and the
Composer packages from `vendor/composer/installed.json`, so run it inside the
Magento project. More: `docs/extensions.md`, `docs/child-themes.md`,
`docs/components.md`.

## License

OSL-3.0 or AFL-3.0, see `NOTICE.md`.
