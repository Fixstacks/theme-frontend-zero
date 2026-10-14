/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 *
 * Product page swatches: disables combinations that don't exist, names the
 * chosen option, swaps the gallery image and the price for the chosen variant.
 * Data comes from <script type="application/json" id="zero-swatches-config"> next to the
 * markup (no inline script: the storefront runs under a strict CSP).
 */
(function () {
    var data = document.getElementById('zero-swatches-config');
    if (!data) {
        return;
    }
    var settings = JSON.parse(data.textContent);
    var config = settings.config;
    var root = document.querySelector('.product-info-main .swatch-opt');
    if (!root || !config.index) {
        return;
    }
    var children = Object.keys(config.index);
    var inputs = root.querySelectorAll('input[name^="super_attribute["], select[name^="super_attribute["]');
    var firstImage = document.querySelector('.gallery-main-images .gallery-full-image img');
    var firstThumb = document.querySelector('.gallery-thumbs .gallery-thumb img');
    // The main image is a <picture>: its <source> and srcset win over src, so a swap sets all three.
    var firstSource = firstImage && firstImage.parentElement.tagName === 'PICTURE'
        ? firstImage.parentElement.querySelector('source')
        : null;
    var original = firstImage ? {
        src: firstImage.getAttribute('src'),
        srcset: firstImage.getAttribute('srcset'),
        sourceSrcset: firstSource && firstSource.getAttribute('srcset'),
        thumb: firstThumb && firstThumb.getAttribute('src')
    } : null;

    function showMainImage(url) {
        firstImage.setAttribute('src', url || original.src);
        [[firstImage, original.srcset], [firstSource, original.sourceSrcset]].forEach(function (pair) {
            if (!pair[0] || pair[1] === null) {
                return;
            }
            pair[0].setAttribute('srcset', url || pair[1]);
        });
    }
    var box = document.querySelector('.product-info-main [data-role="priceBox"]');
    var wrapper = box && box.querySelector('.price-wrapper[data-price-type="finalPrice"]');
    var priceEl = wrapper && wrapper.querySelector('.price');
    var basePrice = priceEl ? priceEl.textContent : '';
    var format = new Intl.NumberFormat(document.documentElement.lang || undefined, { style: 'currency', currency: settings.currency });

    function attrOf(el) {
        return /\[(\d+)\]/.exec(el.name)[1];
    }

    function selection() {
        var chosen = {};
        inputs.forEach(function (el) {
            if (el.tagName === 'SELECT' ? el.value : el.checked) {
                chosen[attrOf(el)] = el.value;
            }
        });
        return chosen;
    }

    function fits(child, chosen, skip) {
        return Object.keys(chosen).every(function (attr) {
            return attr === skip || String(config.index[child][attr]) === String(chosen[attr]);
        });
    }

    function available(attr, value, chosen) {
        return children.some(function (child) {
            return String(config.index[child][attr]) === String(value) && fits(child, chosen, attr);
        });
    }

    function update() {
        var chosen = selection();

        inputs.forEach(function (el) {
            var attr = attrOf(el);
            if (el.tagName === 'SELECT') {
                Array.prototype.forEach.call(el.options, function (option) {
                    option.disabled = option.value !== '' && !available(attr, option.value, chosen);
                });
            } else {
                el.disabled = !available(attr, el.value, chosen);
            }
        });

        root.querySelectorAll('.swatch-attribute').forEach(function (group) {
            var label = group.querySelector('[data-selected-label]');
            var checked = group.querySelector('.swatch-radio-input:checked');
            if (label) {
                label.textContent = checked ? checked.getAttribute('data-option-label') : '';
            }
        });

        var matching = children.filter(function (child) { return fits(child, chosen); });
        var complete = Object.keys(chosen).length === Object.keys(config.attributes).length;

        if (firstImage && original) {
            var withImage = Object.keys(chosen).length && matching.filter(function (child) {
                return config.images && config.images[child] && config.images[child].length;
            })[0];
            var images = withImage ? config.images[withImage] : null;
            var main = images ? (images.filter(function (i) { return i.isMain; })[0] || images[0]) : null;
            showMainImage(main ? main.img : null);
            if (firstThumb) {
                firstThumb.setAttribute('src', main ? main.thumb : original.thumb);
            }
            if (main && /^#gallery-image-/.test(location.hash)) {
                history.replaceState(null, '', location.pathname + location.search);
            }
        }

        if (priceEl) {
            var prices = complete && matching.length === 1 && config.optionPrices && config.optionPrices[matching[0]];
            priceEl.textContent = prices ? format.format(prices.finalPrice.amount) : basePrice;
        }
    }

    root.addEventListener('change', function (event) {
        // A value that no longer exists with the other choices is unchosen.
        if (event.target.matches('.swatch-radio-input, .super-attribute-select')) {
            var chosen = selection();
            inputs.forEach(function (el) {
                if (el !== event.target && el.checked && !available(attrOf(el), el.value, chosen)) {
                    el.checked = false;
                }
            });
        }
        update();
    });
    update();
})();
