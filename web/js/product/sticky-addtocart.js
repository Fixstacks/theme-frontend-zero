/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 *
 * The product page's sticky Add to Cart bar (product/view/sticky-addtocart.phtml):
 * shown while the form's own Add to Cart button is above the screen (scrolled
 * past), with the price the page shows now (a chosen size can change it).
 * Submitting and the options link are plain HTML.
 */
(function () {
    'use strict';

    var bar = document.querySelector('[data-sticky-addtocart]');
    var button = document.getElementById('product-addtocart-button');
    if (!bar || !button || !('IntersectionObserver' in window)) {
        return;
    }
    var price = bar.querySelector('[data-sticky-addtocart-price]');

    function copyPrice() {
        var shown = document.querySelector('.product-info-main [data-price-type="finalPrice"] .price')
            || document.querySelector('.product-info-main .price-box .price');
        if (price && shown) {
            price.textContent = shown.textContent.trim();
        }
    }

    bar.hidden = false;
    // The observed area reaches far below the screen: the button leaves it only
    // above the top edge, so one fast flick past it still counts.
    new IntersectionObserver(function (entries) {
        var past = !entries[0].isIntersecting;
        if (past) {
            copyPrice();
        }
        bar.classList.toggle('is-visible', past);
        bar.setAttribute('aria-hidden', past ? 'false' : 'true');
        bar.inert = !past;
    }, { rootMargin: '0px 0px 100000px 0px' }).observe(button);

    document.addEventListener('change', copyPrice);
})();
