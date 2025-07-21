
  const cartIcon = document.querySelector('.cart-icon');
  const cartTab = document.getElementById('cartTab');
  const closeBtn = document.getElementById('closeCart');

  cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    cartTab.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    cartTab.classList.remove('active');
  });

  var modal = document.getElementById('id01');
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}