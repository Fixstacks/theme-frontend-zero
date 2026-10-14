<?php
/**
 * Zero theme. No parent theme: Luma/Blank markup, CSS and the RequireJS
 * bootstrap are replaced with server-rendered HTML, HTMX and native browser
 * features, styled with Tailwind/DaisyUI. Server-side counterpart: the
 * Zero_Core module. See Zero_Framework_Headless_Engine_Spec.md.
 */

use Magento\Framework\Component\ComponentRegistrar;

ComponentRegistrar::register(
    ComponentRegistrar::THEME,
    'frontend/Zero/default',
    __DIR__
);
