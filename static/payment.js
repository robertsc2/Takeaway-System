document.addEventListener('DOMContentLoaded', function() {
    // Pre-fill payment form with order details
    const details = JSON.parse(localStorage.getItem('orderDetails') || '{}');
    if (details.orderName) document.getElementById('name').value = details.orderName;
    if (details.orderAddress) document.getElementById('state').value = details.orderAddress;
    if (details.orderPhone) document.getElementById('phone').value = details.orderPhone;

    // Update the price field with cart total
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    document.getElementById('price').value = `$${total.toFixed(2)}`;

    // Show notification function
    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#2196F3'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 3000;
            font-size: 1rem;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Handle payment form submit
    document.querySelector('.payment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get all the data
        const orderDetails = JSON.parse(localStorage.getItem('orderDetails') || '{}');
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Validate I have the required data
        if (!orderDetails.isEntered || cart.length === 0) {
            showNotification('Missing order details or cart is empty', 'error');
            return;
        }
        
        const paymentInfo = {
            cardname: document.getElementById('cardname').value.trim(),
            cardnumber: document.getElementById('cardnumber').value.trim(),
            expmonth: document.getElementById('expmonth').value.trim(),
            expyear: document.getElementById('expyear').value.trim(),
            securitycode: document.getElementById('securitycode').value.trim()
        };
        
        // Basic validation
        if (!paymentInfo.cardname || !paymentInfo.cardnumber || !paymentInfo.expmonth || 
            !paymentInfo.expyear || !paymentInfo.securitycode) {
            showNotification('Please fill in all payment fields', 'error');
            return;
        }
        
        // Disable submit button to prevent double submission
        const submitBtn = document.getElementById('paymentfinbtn');
        submitBtn.disabled = true;
        submitBtn.value = 'Processing...';
        
        // THIS IS WHERE THE ORDER ACTUALLY GETS SENT TO BACKEND
        fetch('/complete-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderDetails,
                cart,
                paymentInfo
            })
        })
        .then(response => {
            return response.json().then(data => {
                if (response.ok) {
                    // Success - clear data and redirect
                    showNotification('Order completed successfully!', 'success');
                    localStorage.removeItem('cart');
                    localStorage.removeItem('orderDetails');
                    
                    setTimeout(() => {
                        window.location.href = '/'; // Redirect to homepage
                    }, 1500);
                } else {
                    // Error from backend
                    showNotification(data.error || 'Order failed', 'error');
                    // Re-enable button
                    submitBtn.disabled = false;
                    submitBtn.value = 'Finish Payment';
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Network error occurred', 'error');
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.value = 'Finish Payment';
        });
    });
});