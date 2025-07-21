document.addEventListener('DOMContentLoaded', function() {
    let cart = [];
    const cartTab = document.getElementById('cartTab');
    const cartValue = document.querySelector('.cart-value');
    const listcart = document.querySelector('.listcart');

    // Add to cart 
    document.querySelectorAll('.menu-item .btn').forEach((btn, idx) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const item = btn.closest('.menu-item');
            const name = item.querySelector('h4').innerText;
            const price = parseFloat(item.querySelector('.price').innerText.replace('$',''));
            addToCart({ name, price });
        });
    });

    function addToCart(product) {
        const found = cart.find(i => i.name === product.name);
        if (found) {
            found.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        updateCart();
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
                <input type="number" min="1" value="${item.qty}" style="width:40px;" data-idx="${idx}" />
                <button data-idx="${idx}" class="removeBtn">Remove</button>
            `;
            listcart.appendChild(div);
        });
    }

    // Quantity change
    listcart.addEventListener('input', function(e) {
        if (e.target.type === 'number') {
            const idx = e.target.getAttribute('data-idx');
            cart[idx].qty = Math.max(1, parseInt(e.target.value));
            updateCart();
        }
    });

    // Remove item
    listcart.addEventListener('click', function(e) {
        if (e.target.classList.contains('removeBtn')) {
            const idx = e.target.getAttribute('data-idx');
            cart.splice(idx, 1);
            updateCart();
        }
    });

    // Show/hide cart
    document.querySelector('.cart-icon').addEventListener('click', function(e) {
        e.preventDefault();
        cartTab.classList.add('active');
        cartTab.style.display = 'block';
    });
    document.getElementById('closeCart').addEventListener('click', function() {
        cartTab.classList.remove('active');
        cartTab.style.display = 'none';
    });

    // Modal close for login
    var modal = document.getElementById('id01');
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

