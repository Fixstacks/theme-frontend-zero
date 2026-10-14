/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 *
 * Bundle product summary: lists the chosen items and the running total.
 * Loaded from Magento_Bundle::catalog/product/view/summary.phtml (no inline
 * script: the storefront runs under a strict CSP).
 */
(function () {
    var form = document.getElementById('product_addtocart_form');
    var list = document.querySelector('#bundle-summary .bundle.items');
    var totalEl = document.getElementById('bundle-summary-total');
    var infoPrice = document.querySelector('#bundleSummary .bundle-info .price-box .price');
    if (!form || !list || !totalEl) {
        return;
    }

    var sampleAmount = document.querySelector('.price-wrapper[data-price-amount] .price');
    var currencySymbol = '$';
    if (sampleAmount) {
        var match = sampleAmount.textContent.match(/^[^\d]*/);
        if (match && match[0].trim()) {
            currencySymbol = match[0].trim();
        }
    }

    function formatPrice(amount) {
        return currencySymbol + amount.toFixed(2);
    }

    function scopeFor(input) {
        return input.closest('.field.choice') || input.closest('.nested.options-list');
    }

    function priceFor(input) {
        var scope = scopeFor(input);
        if (!scope) {
            return 0;
        }
        var wrapper = scope.querySelector('.price-wrapper[data-price-amount]');
        return wrapper ? parseFloat(wrapper.getAttribute('data-price-amount')) || 0 : 0;
    }

    function nameFor(input) {
        var scope = scopeFor(input);
        var nameEl = scope ? scope.querySelector('.product-name') : null;
        return nameEl ? nameEl.textContent.trim() : '';
    }

    function qtyFor(optionGroup) {
        var qtyInput = optionGroup.querySelector('input[name^="bundle_option_qty["]');
        if (!qtyInput) {
            return 1;
        }
        var qty = parseInt(qtyInput.value, 10);
        return qty > 0 ? qty : 0;
    }

    function update() {
        var total = 0;
        var rows = [];

        form.querySelectorAll('#bundle-options-fieldset .field.option').forEach(function (optionGroup) {
            var qty = qtyFor(optionGroup);
            if (qty <= 0) {
                return;
            }

            var selected = optionGroup.querySelectorAll(
                'input[type="radio"][name^="bundle_option["]:checked,' +
                'input[type="checkbox"][name^="bundle_option["]:checked,' +
                'input[type="hidden"][name^="bundle_option["]'
            );
            selected.forEach(function (input) {
                var lineTotal = priceFor(input) * qty;
                total += lineTotal;
                rows.push({ name: nameFor(input), qty: qty, price: lineTotal });
            });
        });

        list.textContent = '';
        rows.forEach(function (row) {
            var li = document.createElement('li');
            li.className = 'bundle item flex items-center justify-between gap-2';

            var label = document.createElement('span');
            label.textContent = row.qty + ' × ' + row.name;
            var price = document.createElement('span');
            price.textContent = formatPrice(row.price);

            li.appendChild(label);
            li.appendChild(price);
            list.appendChild(li);
        });

        totalEl.textContent = formatPrice(total);
        // The server-rendered price next to Add to Cart is the configured price
        // at page load; keep it equal to the total so the box shows one price.
        if (infoPrice) {
            infoPrice.textContent = formatPrice(total);
        }
    }

    form.addEventListener('change', function (event) {
        if (event.target.closest('#bundle-options-fieldset')) {
            update();
        }
    });
    form.addEventListener('input', function (event) {
        if (event.target.matches('input[name^="bundle_option_qty["]')) {
            update();
        }
    });

    update();
})();
