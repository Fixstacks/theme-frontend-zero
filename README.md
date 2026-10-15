# Zero theme for Magento Open Source

A storefront theme built on the web platform: server-rendered HTML, HTMX for
the parts that refresh, Tailwind CSS v4 and daisyUI for styles. No RequireJS,
jQuery or Knockout on the storefront. Strict CSP, WCAG 2.2 AA, WebP images.

Demo: https://zero.fixstacks.com. Documentation: https://fixstacks.com/zero/docs (and `docs/` here).

The theme requires two modules, installed with it:

| Package | What it does |
| --- | --- |
| `fixstacks/module-zero-core` | HTMX endpoints for private content, view models for the templates |
| `fixstacks/module-zero-checkout` | One-page checkout without Knockout |

Optional: `fixstacks/module-zero-banner` for the home page slider, or all of
Zero at once with `composer require fixstacks/zero`.

## Install

Requires Magento Open Source 2.4.7–2.4.9 and PHP 8.2–8.4 with the GD extension built with WebP (`php -r 'var_dump(function_exists("imagewebp"));'` says `true`; Magento's own PHP requirements cover the rest). Without WebP in GD, Zero skips its WebP image copies and serves the originals.

```bash
composer require fixstacks/theme-frontend-zero
bin/magento setup:upgrade
bin/magento setup:di:compile           # production mode
bin/magento setup:static-content:deploy # production mode
bin/magento cache:flush
```

Composer installs `fixstacks/module-zero-core`, `fixstacks/module-zero-checkout` with it.

Then choose the theme: Content > Design > Configuration > your store view >
**Zero**. Its parent is Magento/blank, installed with Magento.

## Styles

`web/css/app.css` ships built. Rebuild it after you add, enable or disable a
module with storefront styles, or change the theme's templates:

```bash
cd vendor/fixstacks/theme-frontend-zero   # or your child theme's folder
npm ci && npm run build
```

The build reads the enabled modules from `app/etc/config.php` and the
Composer packages from `vendor/composer/installed.json`, so run it inside the
Magento project. More: `docs/extensions.md`, `docs/child-themes.md`,
`docs/components.md`.

## License

OSL-3.0 or AFL-3.0, your choice: see `NOTICE.md`.

---

<a href="https://vilmate.com"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Fixstacks/zero/main/docs/images/vilmate-logo-dark.svg">
  <img src="https://raw.githubusercontent.com/Fixstacks/zero/main/docs/images/vilmate-logo.svg" alt="Vilmate" height="34" align="right">
</picture></a>

Zero is made by [Fixstacks](https://fixstacks.com/zero) in partnership with [Vilmate](https://vilmate.com), a software development company.
Documentation: https://fixstacks.com/zero/docs. Demo store: https://zero.fixstacks.com.
