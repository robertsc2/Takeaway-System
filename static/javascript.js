document.addEventListener('DOMContentLoaded', function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Load cart from localStorage or initialize as empty
    const cartTab = document.getElementById('cartTab');
    const cartValue = document.querySelector('.cart-value');
    const listcart = document.querySelector('.listcart');
    const cartTotal = document.getElementById('cartTotal');

    // Function to save cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Function to update cart UI
    function updateCartUI() {
        cartValue.innerText = cart.length;
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        cartTotal.innerText = `$${total.toFixed(2)}`;
    }

    // Call updateCartUI on page load to reflect saved cart
    updateCartUI();
    updateCart(); // Initial update of the cart display and values

    // Add to cart 
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
        updateCart(); // update the cart display and valuS

        // Open the cart sidebar when an item is added
        cartTab.classList.add('active'); 
        cartTab.style.display = 'block'; 

        saveCart(); // Save cart to localStorage
        updateCartUI(); // Update UI
    }

    // Function to update the cart display and values
    function updateCart() {
        // Update the cart value (total quantity of items in the cart)
        cartValue.innerText = cart.reduce((sum, i) => sum + i.qty, 0);

        // Clear the current cart items in the cart display
        listcart.innerHTML = '';

        // Loop through each item in the cart and create its HTML structure
        cart.forEach((item, idx) => {
            const div = document.createElement('div'); // Create a new div for the cart item
            div.className = 'cart-item'; // Add a class to the div for styling
            div.innerHTML = `
                <span>${item.name}</span> <!-- Display the item name -->
                <span>$${item.price.toFixed(2)}</span> <!-- Display the item price -->
                <input type="number" min="1" value="${item.qty}" style="width:40px;" data-idx="${idx}" /> <!-- Input field to update quantity -->
                <button data-idx="${idx}" class="removeBtn">Remove</button> <!-- Button to remove the item -->
            `;
            listcart.appendChild(div); // Append the created div to the cart display
        });

        // Calculate the total price of items in the cart
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

        // Update the total price display if the cartTotal element exists
        if (cartTotal) {
            cartTotal.innerText = total.toFixed(2); // Set the total price with two decimal places
        }
    }

    // Quantity change
    listcart.addEventListener('input', function(e) {
        if (e.target.type === 'number') {
            const idx = e.target.getAttribute('data-idx');
            cart[idx].qty = Math.max(1, parseInt(e.target.value));
            updateCart();
            saveCart(); // Save cart to localStorage
            updateCartUI(); // Update UI
        }
    });

    // Remove item
    listcart.addEventListener('click', function(e) {
        if (e.target.classList.contains('removeBtn')) {
            const idx = e.target.getAttribute('data-idx');
            cart.splice(idx, 1);
            updateCart();
            saveCart(); // Save cart to localStorage
            updateCartUI(); // Update UI
        }
    });

    // Show/hide cart
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

    // Modal close for login
    var modal = document.getElementById('id01');
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});