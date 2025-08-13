document.addEventListener('DOMContentLoaded', function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartTab = document.getElementById('cartTab');
    const cartValue = document.querySelector('.cart-value');
    const listcart = document.querySelector('.listcart');
    const cartTotal = document.getElementById('cartTotal');

    // Order Details Management
    let orderDetails = JSON.parse(localStorage.getItem('orderDetails')) || {
        orderName: '',
        orderAddress: '',
        orderPhone: '',
        isEntered: false
    };

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function saveOrderDetails() {
        localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
    }

    function updateCartUI() {
        cartValue.innerText = cart.reduce((sum, i) => sum + i.qty, 0);
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        if (cartTotal) {
            cartTotal.innerText = total.toFixed(2);
        }
    }

    function updateOrderDetailsButton() {
        const orderDetailsBtn = document.querySelector('.signin.btn');
        if (!orderDetailsBtn) return;
        
        if (orderDetails.isEntered) {
            orderDetailsBtn.innerHTML = `
                Order Details &nbsp;
                <i class="fa-solid fa-check"></i>
            `;
            orderDetailsBtn.style.background = 'var(--rustic)';
        } else {
            orderDetailsBtn.innerHTML = `
                Enter Order Details &nbsp;
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
            `;
            orderDetailsBtn.style.background = 'var(--rustic2)';
        }
    }

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

    updateCartUI();
    updateCart();
    updateOrderDetailsButton();

    document.querySelectorAll('.menu-item .btn, .order-card .btn').forEach((btn, idx) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const item = btn.closest('.menu-item, .order-card');
            const name = item.querySelector('h4').innerText;
            const price = parseFloat(item.querySelector('.price').innerText.replace('$', ''));
            addToCart({
                name,
                price
            });
        });
    });

    function addToCart(product) {
        const found = cart.find(i => i.name === product.name);
        if (found) {
            found.qty += 1;
        } else {
            cart.push({
                ...product,
                qty: 1
            });
        }
        updateCart();
        cartTab.classList.add('active'); 
        cartTab.style.display = 'block'; 
        saveCart();
        updateCartUI();
    }

    function updateCart() {
        cartValue.innerText = cart.reduce((sum, i) => sum + i.qty, 0);
        listcart.innerHTML = '';

        cart.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.name}</span> 
                <span>$${item.price.toFixed(2)}</span> 
                <input type="number" min="1" value="${item.qty}" style="width:60px;" data-idx="${idx}" />
                <button data-idx="${idx}" class="removeBtn">Remove</button>
            `;
            listcart.appendChild(div);
        });

        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        if (cartTotal) {
            cartTotal.innerText = total.toFixed(2);
        }
    }

    listcart.addEventListener('change', function(e) {
        if (e.target.type === 'number') {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            const newQty = Math.max(1, parseInt(e.target.value) || 1);
            cart[idx].qty = newQty;
            updateCartUI();
            saveCart();
        }
    });

    listcart.addEventListener('click', function(e) {
        if (e.target.classList.contains('removeBtn')) {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            cart.splice(idx, 1);
            updateCart();
            saveCart();
            updateCartUI();
        }
    });

    document.querySelector('.cart-icon').addEventListener('click',
        function(e) {
            e.preventDefault();
            cartTab.classList.add('active');
            cartTab.style.display = 'block';
        });
    
    document.getElementById('closeCart').addEventListener('click',
        function() {
            cartTab.classList.remove('active');
            cartTab.style.display = 'none';
        });

    // Enhanced checkout button handler
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (cart.length === 0) {
                showNotification('Your cart is empty. Please add items before checkout.', 'error');
                return;
            }

            if (!orderDetails.isEntered) {
                showNotification('Please enter your order details first.', 'info');
                document.getElementById('id01').style.display = 'flex';
                return;
            }

            const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
            
            fetch('/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: cart,
                    total: total.toFixed(2),
                    orderDetails: orderDetails
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                } else {
                    showNotification('Error processing checkout', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error processing checkout', 'error');
            });
        });
    }

    // Enhanced order details button handler
    const orderDetailsBtn = document.querySelector('.signin.btn');
    if (orderDetailsBtn) {
        orderDetailsBtn.addEventListener('click', function() {
            const modal = document.getElementById('id01');
            
            if (orderDetails.isEntered) {
                const confirmed = confirm('You have already entered your details. Would you like to change them?');
                if (!confirmed) {
                    return;
                }
                
                document.getElementById('orderName').value = orderDetails.orderName;
                document.getElementById('orderAddress').value = orderDetails.orderAddress;
                document.getElementById('orderPhone').value = orderDetails.orderPhone;
                
                const submitBtn = document.querySelector('#orderDetailsForm .btn[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Update Details';
                }
            } else {
                document.getElementById('orderName').value = '';
                document.getElementById('orderAddress').value = '';
                document.getElementById('orderPhone').value = '';
                
                const submitBtn = document.querySelector('#orderDetailsForm .btn[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Save Details';
                }
            }
            
            modal.style.display = 'flex';
        });
    }

    // Modal close functionality removed - only close via X or Cancel button

    // Enhanced order details form handler
    const orderDetailsForm = document.getElementById('orderDetailsForm');
    if (orderDetailsForm) {
        orderDetailsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const orderName = document.getElementById('orderName').value.trim();
            const orderAddress = document.getElementById('orderAddress').value.trim();
            const orderPhone = document.getElementById('orderPhone').value.trim();
            
            if (!orderName || !orderAddress || !orderPhone) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(orderPhone)) {
                showNotification('Please enter a valid phone number', 'error');
                return;
            }
            
            orderDetails = {
                orderName,
                orderAddress,
                orderPhone,
                isEntered: true
            };
            
            saveOrderDetails();
            updateOrderDetailsButton();
            document.getElementById('id01').style.display = 'none';
            showNotification('Order details saved successfully!', 'success');
        });
    }
});
