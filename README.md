# Zero theme

The storefront theme of Zero for Magento Open Source: server-rendered
templates, HTMX for the parts that refresh, Tailwind CSS v4 and daisyUI
for the styles. No RequireJS, jQuery or Knockout on the storefront, and a
strict Content Security Policy (no inline scripts or styles).

## Install

Requires Magento Open Source 2.4.7–2.4.9 and PHP 8.2–8.4 with the GD extension built with WebP (`php -r 'var_dump(function_exists("imagewebp"));'` says `true`; Magento's own PHP requirements cover the rest). Without WebP in GD, Zero skips its WebP image copies and serves the originals.

```bash
composer require zerofront/theme-frontend-zero
bin/magento setup:upgrade
bin/magento setup:di:compile           # production mode
bin/magento setup:static-content:deploy # production mode
bin/magento cache:flush
```

Composer installs `zerofront/module-zero-core`, `zerofront/module-zero-checkout` with it.

## Build

```bash
cd app/design/frontend/Zero/default
npm ci
npm run build          # web/css/app.css and web/js/htmx.min.js
npm run dev:css        # Tailwind in watch mode while editing
```

Rerun `npm run build:css` after changing a template, a style, or the set of
enabled modules: the build reads the modules from `app/etc/config.php`.
Everything about the pipeline, the files, when to rebuild and how the
deploy does it: [docs/build.md](docs/build.md).

## Docs

- [build.md](docs/build.md): the CSS and JavaScript build, step by step.
- [extensions.md](docs/extensions.md): how a module adds templates, styles
  and HTMX fragments; compat modules for third-party extensions.
- [child-themes.md](docs/child-themes.md): a store's own look on top of Zero.
- [components.md](docs/components.md): the UI components and the JS rule.
- [performance.md](docs/performance.md): what the PageSpeed score rests on, the budgets, what to keep to when adding a module, a theme or content, and how to check before a deploy.
- [cms.md](docs/cms.md), [blog.md](docs/blog.md), [analytics.md](docs/analytics.md),
  [social-login.md](docs/social-login.md): the modules with a storefront of their own.

## Layout of the folder

```
Magento_*/            templates and layout overrides per core module
src/styles/           app.css (Tailwind entry), base.css, components.css, utilities.css
src/styles/generated/ modules.css, written by the build (not in git)
web/css/app.css       the built stylesheet (not in git)
web/js/               zero.js, product/*.js, cancel-order.js, htmx.min.js (built)
scripts/              collect-module-styles.mjs, copy-htmx.mjs, minify-theme-css.mjs
docs/                 the developer docs above
```

## License

OSL-3.0 or AFL-3.0, your choice: see `NOTICE.md`.

---

<a href="https://vilmate.com"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/zerofrontdev/zero/main/docs/images/vilmate-logo-dark.svg">
  <img src="https://raw.githubusercontent.com/zerofrontdev/zero/main/docs/images/vilmate-logo.svg" alt="Vilmate" height="34" align="right">
</picture></a>

Zero is made by [Fixstacks](https://fixstacks.com) in partnership with [Vilmate](https://vilmate.com), a software development company.
Documentation: https://zerofront.dev/docs. Demo store: https://demo.zerofront.dev.
