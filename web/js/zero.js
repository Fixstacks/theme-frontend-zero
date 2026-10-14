/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 *
 * Zero's small sitewide behaviours, wired by data attributes instead of
 * inline scripts and on*="" handlers, so the storefront runs under a strict
 * Content Security Policy (no 'unsafe-inline', no 'unsafe-eval'). Listeners
 * are delegated from document: markup HTMX swaps in later works as is.
 *
 * - [data-qty-step="up|down"]       steps the number input next to it
 * - [data-enter-clicks]             Enter in this field clicks the next
 *                                   element (or the selector given)
 * - select[data-navigate]           goes to the chosen option's URL
 * - [data-scroller-prev|next="#track"] scrolls #track by about one page
 * - details[data-collapsible-nav]   open on desktop, closed below; its
 *                                   [data-current-label] names the current item
 * - [data-print-on-load]            opens the print dialog once loaded
 * - [data-print-page]               opens the print dialog on click
 * - [data-dialog-open="#id"]        opens <dialog id> as a modal (close it
 *                                   with a <form method="dialog"> button)
 * - [data-role="select-all"]        ticks every related-product checkbox
 *                                   in its .block.related
 */
(function () {
    'use strict';

    document.addEventListener('click', function (event) {
        var target = event.target instanceof Element ? event.target : null;
        if (!target) {
            return;
        }

        var step = target.closest('[data-qty-step]');
        if (step) {
            var input = step.getAttribute('data-qty-step') === 'up'
                ? step.previousElementSibling
                : step.nextElementSibling;
            if (input && typeof input.stepUp === 'function') {
                if (step.getAttribute('data-qty-step') === 'up') {
                    input.stepUp();
                } else {
                    input.stepDown();
                }
            }
            return;
        }

        var opener = target.closest('[data-dialog-open]');
        var dialog = opener && document.querySelector(opener.getAttribute('data-dialog-open'));
        if (dialog && typeof dialog.showModal === 'function') {
            dialog.showModal();
            return;
        }

        if (target.closest('[data-print-page]')) {
            event.preventDefault();
            window.print();
            return;
        }

        var selectAll = target.closest('[data-role="select-all"]');
        var related = selectAll && selectAll.closest('.block.related');
        if (related) {
            related.querySelectorAll('input.checkbox.related').forEach(function (checkbox) {
                checkbox.checked = true;
            });
            return;
        }

        var scrollButton = target.closest('[data-scroller-prev], [data-scroller-next]');
        var track = scrollButton && document.querySelector(
            scrollButton.getAttribute('data-scroller-prev') || scrollButton.getAttribute('data-scroller-next')
        );
        if (track) {
            // Right-to-left pages scroll toward negative scrollLeft, so "next" is leftward there.
            var dir = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
            var direction = scrollButton.hasAttribute('data-scroller-next') ? 1 : -1;
            track.scrollBy({ left: dir * direction * track.clientWidth * 0.9, behavior: 'smooth' });
        }
    });

    document.addEventListener('keydown', function (event) {
        var field = event.target instanceof Element ? event.target.closest('[data-enter-clicks]') : null;
        if (!field || event.key !== 'Enter') {
            return;
        }
        var selector = field.getAttribute('data-enter-clicks');
        var button = selector ? document.querySelector(selector) : field.nextElementSibling;
        if (button) {
            event.preventDefault();
            button.click();
        }
    });

    document.addEventListener('change', function (event) {
        var select = event.target instanceof Element ? event.target.closest('select[data-navigate]') : null;
        if (select && select.value) {
            window.location.href = select.value;
        }
    });


    function initCollapsibleNav(nav) {
        if (nav.hasAttribute('data-collapsible-ready')) {
            return;
        }
        nav.setAttribute('data-collapsible-ready', '');
        var current = nav.querySelector('.nav.item.current');
        var label = nav.querySelector('[data-current-label]');
        if (current && label) {
            label.textContent = current.textContent.trim();
        }
        var desktop = window.matchMedia('(min-width: 64rem)');
        var sync = function () {
            nav.open = desktop.matches;
        };
        sync();
        desktop.addEventListener('change', sync);
    }

    /*
     * Mobile-only toggles (header menu, its submenus, layered filters) are
     * <details> that stay closed and are shown on the desktop by CSS through
     * ::details-content. Browsers without it (Safari before 18.4, older
     * Firefox) never render a closed <details>' content: open them at
     * desktop width, close them again below it.
     */
    var DESKTOP_OPEN = 'details.nav-sections-item, details.menu-toggle, details.filter-mobile-toggle';
    var desktopQuery = window.matchMedia('(min-width: 64rem)');

    function syncDesktopOpen(root) {
        root.querySelectorAll(DESKTOP_OPEN).forEach(function (details) {
            if (desktopQuery.matches) {
                if (!details.open) {
                    details.open = true;
                    details.setAttribute('data-desktop-opened', '');
                }
            } else if (details.hasAttribute('data-desktop-opened')) {
                details.open = false;
                details.removeAttribute('data-desktop-opened');
            }
        });
    }
    desktopQuery.addEventListener('change', function () {
        syncDesktopOpen(document);
    });

    function init(root) {
        if (!root.querySelectorAll) {
            return;
        }
        root.querySelectorAll('details[data-collapsible-nav]').forEach(initCollapsibleNav);
        syncDesktopOpen(root);
    }

    function ready() {
        init(document);
        if (document.querySelector('[data-print-on-load]')) {
            if (document.readyState === 'complete') {
                window.print();
            } else {
                window.addEventListener('load', function () {
                    window.print();
                });
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ready);
    } else {
        ready();
    }
    document.addEventListener('htmx:load', function (event) {
        if (event.target instanceof Element) {
            init(event.target);
        }
    });
})();
