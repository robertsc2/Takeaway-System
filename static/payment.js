document.addEventListener('DOMContentLoaded', function() {
    // Pre-fill payment form with order details
    const details = JSON.parse(localStorage.getItem('orderDetails') || '{}');
    if (details.orderName) document.getElementById('name').value = details.orderName;
    if (details.orderAddress) document.getElementById('state').value = details.orderAddress;
    if (details.orderPhone) document.getElementById('phone').value = details.orderPhone;

    // Handle payment form submit
    document.querySelector('.payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const orderDetails = JSON.parse(localStorage.getItem('orderDetails') || '{}');
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const paymentInfo = {
            cardname: document.getElementById('cardname').value,
            cardnumber: document.getElementById('cardnumber').value,
            expmonth: document.getElementById('expmonth').value,
            expyear: document.getElementById('expyear').value,
            securitycode: document.getElementById('securitycode').value
        };
        fetch('/complete-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderDetails,
                cart,
                paymentInfo
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('Order completed!');
                localStorage.removeItem('cart');
                localStorage.removeItem('orderDetails');
                window.location.href = '/menu';
            } else {
                alert('Error: ' + (data.message || 'Order failed'));
            }
        });
    });
});