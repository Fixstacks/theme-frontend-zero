/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 *
 * Cancel-order dialog (Magento_OrderCancellationUi::cancel-order-modal.phtml):
 * opens on [data-role="cancel-order-trigger"], sends the GraphQL cancelOrder
 * mutation on confirm. Loaded from the template (no inline script: strict CSP).
 */
(function () {
    if (window.__zeroCancelOrderInit) {
        return;
    }
    window.__zeroCancelOrderInit = true;

    document.addEventListener('click', function (event) {
        var trigger = event.target.closest('[data-role="cancel-order-trigger"]');
        if (trigger) {
            event.preventDefault();
            var dialog = document.getElementById(trigger.getAttribute('data-target'));
            if (dialog) {
                var status = dialog.querySelector('.cancel-order-status');
                if (status) {
                    status.hidden = true;
                    status.textContent = '';
                }
                dialog.showModal();
            }
            return;
        }

        var closeButton = event.target.closest('[data-role="close"]');
        if (closeButton) {
            var closingDialog = closeButton.closest('dialog');
            if (closingDialog) {
                closingDialog.close();
            }
            return;
        }

        var confirmButton = event.target.closest('[data-role="confirm"]');
        if (confirmButton) {
            var dialogEl = confirmButton.closest('dialog');
            if (!dialogEl) {
                return;
            }
            var select = dialogEl.querySelector('[data-role="reason"]');
            var statusEl = dialogEl.querySelector('.cancel-order-status');
            var graphqlUrl = dialogEl.getAttribute('data-graphql-url');
            var orderId = dialogEl.getAttribute('data-order-id');
            var reason = (select && select.options[select.selectedIndex])
                ? select.options[select.selectedIndex].text
                : '';

            confirmButton.disabled = true;
            if (statusEl) {
                statusEl.hidden = true;
                statusEl.textContent = '';
            }

            fetch(graphqlUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: 'mutation cancelOrder($order_id: ID!, $reason: String!) {'
                        + ' cancelOrder(input: {order_id: $order_id, reason: $reason}) {'
                        + ' error order { status } } }',
                    variables: {
                        order_id: btoa(orderId),
                        reason: reason
                    }
                })
            }).then(function (response) {
                if (!response.ok) {
                    throw new Error('Cancel order request failed (HTTP ' + response.status + ').');
                }
                return response.json();
            }).then(function (payload) {
                var result = payload.data && payload.data.cancelOrder;
                if (!result || (payload.errors && payload.errors.length)) {
                    var message = (payload.errors && payload.errors[0] && payload.errors[0].message)
                        || 'Could not cancel this order. Please try again later.';
                    throw new Error(message);
                }
                if (result.error) {
                    if (statusEl) {
                        statusEl.hidden = false;
                        statusEl.textContent = result.error;
                    }
                    confirmButton.disabled = false;
                    return;
                }
                window.location.reload();
            }).catch(function (error) {
                if (statusEl) {
                    statusEl.hidden = false;
                    statusEl.textContent = error.message
                        || 'Could not cancel this order. Please try again later.';
                }
                confirmButton.disabled = false;
            });
            return;
        }

        if (event.target.tagName === 'DIALOG' && event.target.classList.contains('cancel-order-modal')) {
            event.target.close();
        }
    });
})();
