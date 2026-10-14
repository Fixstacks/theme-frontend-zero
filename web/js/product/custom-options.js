/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 *
 * Product custom options: the shown price includes the chosen options.
 * Data comes from <script type="application/json" id="zero-custom-options-config"> next to the
 * markup (no inline script: the storefront runs under a strict CSP).
 */
(function () {
    var data = document.getElementById('zero-custom-options-config');
    if (!data) {
        return;
    }
    var settings = JSON.parse(data.textContent);
    var config = settings.config;
    var productId = settings.productId;
    var currency = settings.currency;
    var form = document.getElementById('product_addtocart_form');
    var box = document.querySelector('.product-info-main [data-role="priceBox"][data-product-id="' + productId + '"]');
    var wrapper = box && box.querySelector('.price-wrapper[data-price-type="finalPrice"]');
    var priceEl = wrapper && wrapper.querySelector('.price');
    if (!form || !priceEl) {
        return;
    }
    var base = parseFloat(wrapper.getAttribute('data-price-amount')) || 0;
    var format = new Intl.NumberFormat(document.documentElement.lang || undefined, { style: 'currency', currency: currency });

    function amount(entry) {
        return entry && entry.prices ? parseFloat(entry.prices.finalPrice.amount) || 0 : 0;
    }

    function optionId(name) {
        var match = /^options(?:\[(\d+)\]|_(\d+)_file)/.exec(name || '');
        return match ? (match[1] || match[2]) : null;
    }

    function update() {
        var picked = {};
        form.querySelectorAll('.product-custom-option, input[type="file"][name^="options_"]').forEach(function (el) {
            var id = optionId(el.name);
            if (!id || !config[id]) {
                return;
            }
            var values = [];
            if (el.tagName === 'SELECT') {
                Array.prototype.forEach.call(el.selectedOptions, function (o) { if (o.value) { values.push(o.value); } });
            } else if (el.type === 'radio' || el.type === 'checkbox') {
                if (el.checked && el.value) { values.push(el.value); }
            } else if (el.type === 'file') {
                if (el.files && el.files.length) { values.push(''); }
            } else if (el.value.trim() !== '') {
                values.push('');
            }
            values.forEach(function (value) {
                // Value-level price (select/radio/checkbox) or option-level (text, date, file); a date counts once.
                var key = config[id][value] ? id + ':' + value : id;
                picked[key] = config[id][value] ? amount(config[id][value]) : amount(config[id]);
            });
        });
        var total = base;
        Object.keys(picked).forEach(function (key) { total += picked[key]; });
        priceEl.textContent = format.format(total);
    }

    form.addEventListener('change', update);
    form.addEventListener('input', update);
    update();
})();
