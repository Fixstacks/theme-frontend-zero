/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 *
 * Product gallery extras (Magento_Catalog/templates/product/view/gallery.phtml).
 * The gallery itself switches images with CSS :target; this adds:
 * - full screen: a <dialog> with the large image of the shown one, prev/next
 *   (buttons, arrow keys, swipe), opened by the expand button or a click on
 *   the image; on close the page gallery shows the last image viewed;
 * - zoom: in full screen, a click (or the Zoom button) magnifies the image,
 *   and the zoomed area follows the pointer or the mouse wheel;
 * - video: Play swaps the image for the player frame (YouTube/Vimeo, the URL
 *   comes from the server); in full screen a video item plays in the dialog.
 * Static file, no inline code: the storefront runs a strict CSP.
 */
(function () {
    'use strict';

    var gallery = document.querySelector('.product-gallery');
    var dialog = gallery && gallery.querySelector('[data-gallery-dialog]');
    if (!dialog || typeof dialog.showModal !== 'function') {
        return;
    }
    var items = Array.prototype.slice.call(gallery.querySelectorAll('.gallery-full-image'));
    var stage = dialog.querySelector('[data-gallery-stage]');
    var image = dialog.querySelector('[data-gallery-image]');
    var counter = dialog.querySelector('[data-gallery-counter]');
    var zoomButton = dialog.querySelector('[data-gallery-zoom]');
    var opener = gallery.querySelector('[data-gallery-open]');
    var index = 0;
    // The zoomed image's transform-origin, in % of the stage.
    var origin = { x: 50, y: 50 };
    var frame = null;

    function shown() {
        var targeted = items.filter(function (item) { return item.matches(':target'); })[0];
        return targeted ? items.indexOf(targeted) : 0;
    }

    function player(src, title) {
        var iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.title = title;
        iframe.className = 'gallery-video';
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        return iframe;
    }

    function setZoom(on) {
        stage.classList.toggle('is-zoomed', on);
        zoomButton.setAttribute('aria-pressed', on ? 'true' : 'false');
        if (!on) {
            image.style.transformOrigin = '';
            origin.x = 50;
            origin.y = 50;
        }
    }

    function show(i) {
        index = (i + items.length) % items.length;
        var item = items[index];
        setZoom(false);
        if (frame) {
            frame.remove();
            frame = null;
        }
        var video = item.getAttribute('data-video');
        image.hidden = !!video;
        zoomButton.hidden = !!video;
        if (video) {
            frame = player(video, item.getAttribute('data-alt') || '');
            stage.appendChild(frame);
        } else {
            image.src = item.getAttribute('data-full') || (item.querySelector('img') || {}).currentSrc || '';
            image.alt = item.getAttribute('data-alt') || '';
        }
        counter.textContent = (index + 1) + ' / ' + items.length;
    }

    function open(i) {
        show(i);
        dialog.showModal();
    }

    function step(delta) {
        show(index + delta);
    }

    // The expand button only makes sense with this script running.
    if (opener) {
        opener.hidden = false;
        opener.addEventListener('click', function () { open(shown()); });
    }

    items.forEach(function (item, i) {
        var picture = item.querySelector('img');
        if (picture && !item.hasAttribute('data-video')) {
            picture.style.cursor = 'zoom-in';
            picture.addEventListener('click', function () { open(i); });
        }
        var play = item.querySelector('[data-gallery-play]');
        if (play) {
            play.addEventListener('click', function () {
                var iframe = player(item.getAttribute('data-video'), item.getAttribute('data-alt') || '');
                item.classList.add('is-playing');
                item.appendChild(iframe);
                play.remove();
                iframe.focus();
            });
        }
    });

    dialog.querySelector('[data-gallery-close]').addEventListener('click', function () { dialog.close(); });
    var prev = dialog.querySelector('[data-gallery-prev]');
    var next = dialog.querySelector('[data-gallery-next]');
    if (prev && next) {
        prev.addEventListener('click', function () { step(-1); });
        next.addEventListener('click', function () { step(1); });
    }
    zoomButton.addEventListener('click', function () { setZoom(!stage.classList.contains('is-zoomed')); });
    image.addEventListener('click', function () { setZoom(!stage.classList.contains('is-zoomed')); });

    // Zoomed: the magnified area follows the pointer (mouse, pen or a dragging finger).
    // Measured against the stage, not the image: the image's box is the
    // magnified one, mostly off screen, so the pointer could never reach its
    // lower part (or the far sides) and that part of the photo stayed hidden.
    function setOrigin(x, y) {
        origin.x = Math.min(100, Math.max(0, x));
        origin.y = Math.min(100, Math.max(0, y));
        image.style.transformOrigin = origin.x + '% ' + origin.y + '%';
    }
    stage.addEventListener('pointermove', function (event) {
        if (!stage.classList.contains('is-zoomed')) {
            return;
        }
        var box = stage.getBoundingClientRect();
        setOrigin((event.clientX - box.left) / box.width * 100, (event.clientY - box.top) / box.height * 100);
    });

    // Zoomed: the mouse wheel (or a trackpad) moves the magnified area too.
    stage.addEventListener('wheel', function (event) {
        if (!stage.classList.contains('is-zoomed')) {
            return;
        }
        event.preventDefault();
        var box = stage.getBoundingClientRect();
        setOrigin(origin.x + event.deltaX / box.width * 100, origin.y + event.deltaY / box.height * 100);
    }, { passive: false });

    // Swipe (not zoomed): left/right moves to the next/previous image.
    var startX = null;
    stage.addEventListener('pointerdown', function (event) { startX = event.clientX; });
    stage.addEventListener('pointerup', function (event) {
        if (startX === null || stage.classList.contains('is-zoomed') || items.length < 2) {
            startX = null;
            return;
        }
        var dx = event.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 50) {
            var rtl = document.documentElement.dir === 'rtl';
            step((dx < 0) !== rtl ? 1 : -1);
        }
    });

    dialog.addEventListener('keydown', function (event) {
        if (items.length < 2 || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
            return;
        }
        event.preventDefault();
        var forward = event.key === 'ArrowRight';
        step(forward !== (document.documentElement.dir === 'rtl') ? 1 : -1);
    });

    // A click on the backdrop (outside the dialog's box) closes it.
    dialog.addEventListener('click', function (event) {
        if (event.target === dialog) {
            dialog.close();
        }
    });

    dialog.addEventListener('close', function () {
        if (frame) {
            frame.remove();
            frame = null;
        }
        setZoom(false);
        // Focus back on the expand button: Safari doesn't focus a clicked
        // button, so the dialog alone would leave focus on the page body.
        if (opener && (document.activeElement === document.body || dialog.contains(document.activeElement))) {
            opener.focus();
        }
        // The page gallery follows the last image viewed (no history entry, no scroll).
        var id = items[index].id;
        if (index !== shown() && id) {
            location.replace('#' + id);
        }
    });
})();
