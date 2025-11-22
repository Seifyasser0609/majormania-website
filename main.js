// main.js

// Product Data
const products = [
    { id: 1, name: "Mechanical Precision Pen", price: 25, type: "mechanical", image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
    { id: 2, name: "Executive Gel Pen", price: 30, type: "gel", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
    { id: 3, name: "Artisan Fountain Pen", price: 35, type: "fountain", image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
    { id: 4, name: "Limited Edition Collector", price: 50, type: "collector", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }
];

// Typing Animation
const sentences = [
    "Where Thought Meets Paper",
    "More Than a Pen, It's a Statement",
    "The Pen You Deserve",
    "Find Your Perfect Grip",
    "Unlock Your Inner Author"
];

let currentSentenceIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let typingDelay = 100;
let deletingDelay = 50;
let sentenceDelay = 2000;
let typingTimeout;

// Cart Management
let cart = JSON.parse(localStorage.getItem('majormania_cart')) || [];

// Carousel Variables
let currentSlide = 0;
const slideWidth = 320;

// DOM Elements (grab later inside init to avoid nulls)
let productCarousel, cartBtn, cartModal, closeModal, cartItems, cartTotal, cartCount;
let prevBtn, nextBtn, codBtn, codModal, closeCodModal, codForm;
let successModal, closeSuccessModalBtn, orderIdElement, mobileMenuBtn, navLinks, navLinksArray, typingText;

// Firebase save function (uses global db from firebase-config.js)
async function saveOrderToFirebase(order) {
    try {
        const docRef = await db.collection('orders').add({
            ...order,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // مهم جداً
        await docRef.update({ firebaseId: docRef.id });

        console.log('Order saved to Firebase with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error saving order to Firebase:', error);
        throw error;
    }
}
    

async function updateOrderStatus(orderId, status) {
    try {
        await db.collection('orders').doc(orderId).update({
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Order status updated:', orderId, status);
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

// Typing Animation Functions
function typeWriter() {
    const currentSentence = sentences[currentSentenceIndex] || '';
    if (!isDeleting) {
        if (currentCharIndex < currentSentence.length) {
            typingText.textContent = currentSentence.substring(0, currentCharIndex + 1);
            currentCharIndex++;
            typingTimeout = setTimeout(typeWriter, typingDelay);
        } else {
            typingTimeout = setTimeout(() => {
                isDeleting = true;
                typeWriter();
            }, sentenceDelay);
        }
    } else {
        if (currentCharIndex > 0) {
            typingText.textContent = currentSentence.substring(0, currentCharIndex - 1);
            currentCharIndex--;
            typingTimeout = setTimeout(typeWriter, deletingDelay);
        } else {
            isDeleting = false;
            currentSentenceIndex = (currentSentenceIndex + 1) % sentences.length;
            typingTimeout = setTimeout(typeWriter, 500);
        }
    }
}

function startTypingAnimation() {
    if (typingTimeout) clearTimeout(typingTimeout);
    typingText.textContent = '';
    currentSentenceIndex = 0;
    currentCharIndex = 0;
    isDeleting = false;
    typingTimeout = setTimeout(typeWriter, 1000);
}

function stopTypingAnimation() {
    if (typingTimeout) clearTimeout(typingTimeout);
}

// Render Products
function renderProducts() {
    productCarousel.innerHTML = products.map((product, index) => `
        <div class="product-card ${index === 0 ? 'active' : ''}" data-product-id="${product.id}">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x300?text=Pen+Image'">
            </div>
            <h4 class="product-name">${product.name}</h4>
            <p class="product-price">${product.price} EGP</p>
            <div class="product-actions">
                <button class="btn btn-add" onclick="addToCart(${product.id})">Add to Cart</button>
                <button class="btn btn-buy" onclick="buyNow(${product.id})">Buy Now</button>
            </div>
        </div>
    `).join('');
}

// Carousel / UI functions
function updateCarousel() {
    const transformValue = -currentSlide * slideWidth;
    productCarousel.style.transform = `translateX(${transformValue}px)`;
    document.querySelectorAll('.product-card').forEach((card, index) => {
        card.classList.toggle('active', index === currentSlide);
    });
    updateCarouselButtons();
    updateCarouselIndicators();
}

function updateCarouselButtons() {
    const productsEls = document.querySelectorAll('.product-card');
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide >= productsEls.length - 1;
    prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
    nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
}

function createCarouselIndicators() {
    const indicatorsContainer = document.getElementById('carouselIndicators');
    indicatorsContainer.innerHTML = products.map((_, index) => `
        <button class="carousel-indicator ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></button>
    `).join('');
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
}

function updateCarouselIndicators() {
    const indicators = document.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => indicator.classList.toggle('active', index === currentSlide));
}

function scrollCarouselNext() {
    const prods = document.querySelectorAll('.product-card');
    if (currentSlide < prods.length - 1) currentSlide++;
    updateCarousel();
}
function scrollCarouselPrev() {
    if (currentSlide > 0) currentSlide--;
    updateCarousel();
}

// Cart functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(i => i.id === productId);
    if (existingItem) existingItem.quantity++;
    else cart.push({ ...product, quantity: 1 });
    saveCart();
    updateCartUI();
    showNotification(`${product.name} added to cart!`);
    cartBtn.style.animation = 'pulse 0.5s ease';
    setTimeout(() => cartBtn.style.animation = '', 500);
}

function buyNow(productId) {
    addToCart(productId);
    cartModal.style.display = 'block';
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) removeFromCart(productId);
    else { saveCart(); updateCartUI(); }
}

function saveCart() {
    localStorage.setItem('majormania_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    cartCount.textContent = totalItems;
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price} EGP x ${item.quantity}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="quantity-btn" onclick="removeFromCart(${item.id})" style="margin-left: 10px; background: #ff4757">×</button>
            </div>
        </div>
    `).join('');
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    cartTotal.textContent = total.toFixed(2);
}

// COD / Order processing
function openCodModal() {
    if (cart.length === 0) { showNotification('Your cart is empty!'); return; }
    cartModal.style.display = 'none';
    codModal.style.display = 'block';
    updateOrderSummary();
    resetConfirmButton();
}

function updateOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');
    orderSummary.innerHTML = cart.map(it => `
        <div class="order-item">
            <span class="order-item-name">${it.name} x${it.quantity}</span>
            <span class="order-item-price">${(it.price * it.quantity).toFixed(2)} EGP</span>
        </div>
    `).join('');
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    orderTotal.textContent = total.toFixed(2);
}

function resetConfirmButton() {
    const confirmBtn = document.getElementById('confirmOrderBtn');
    if (!confirmBtn) return;
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = '✅ Confirm COD Order';
    confirmBtn.style.opacity = '1';
}

async function processCODOrder(e) {
    e.preventDefault();
    const required = ['customerName','customerPhone','customerAddress','customerCity'];
    for (const f of required) {
        if (!document.getElementById(f).value.trim()) { showNotification('Please fill in all required fields!'); return; }
    }

    const confirmBtn = document.getElementById('confirmOrderBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '⏳ Processing...';
    confirmBtn.style.opacity = '0.7';

    const formData = {
        name: document.getElementById('customerName').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        email: document.getElementById('customerEmail').value.trim() || 'Not provided',
        address: document.getElementById('customerAddress').value.trim(),
        city: document.getElementById('customerCity').value.trim(),
        notes: document.getElementById('orderNotes').value.trim() || 'No notes',
        cart: [...cart],
        total: cart.reduce((s, i) => s + i.price * i.quantity, 0),
        orderDate: new Date().toISOString(),
        status: 'pending'
    };

    const orderId = 'MAJOR-' + Date.now() + '-' + Math.random().toString(36).substr(2,5).toUpperCase();

    try {
        await new Promise(r => setTimeout(r, 1200)); // simulate delay
        const firebaseOrderId = await saveOrderToFirebase({ id: orderId, ...formData });

        // clear cart
        cart = [];
        saveCart();
        updateCartUI();

        // show success modal
        showSuccessModal(orderId);
    } catch (err) {
        console.error(err);
        showNotification('Error placing order. Try again.');
    } finally {
        resetConfirmButton();
        codModal.style.display = 'none';
    }
}

// UI helpers
function showSuccessModal(orderId) {
    orderIdElement.textContent = orderId;
    successModal.style.display = 'block';
}

function showNotification(message) {
    // simple toast fallback (you can replace with more fancy)
    alert(message);
}

// Utility & init
function setupEventListeners() {
    cartBtn.addEventListener('click', () => cartModal.style.display = 'block');
    closeModal.addEventListener('click', () => cartModal.style.display = 'none');
    codBtn.addEventListener('click', openCodModal);
    closeCodModal.addEventListener('click', () => codModal.style.display = 'none');
    closeSuccessModalBtn.addEventListener('click', () => successModal.style.display = 'none');
    codForm.addEventListener('submit', processCODOrder);

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) cartModal.style.display = 'none';
        if (e.target === codModal) codModal.style.display = 'none';
        if (e.target === successModal) successModal.style.display = 'none';
    });

    prevBtn.addEventListener('click', scrollCarouselPrev);
    nextBtn.addEventListener('click', scrollCarouselNext);
    mobileMenuBtn.addEventListener('click', () => navLinks.classList.toggle('active'));

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) stopTypingAnimation();
        else startTypingAnimation();
    });
}

function initStore() {
    // DOM elements
    productCarousel = document.getElementById('productCarousel');
    cartBtn = document.getElementById('cartBtn');
    cartModal = document.getElementById('cartModal');
    closeModal = document.getElementById('closeModal');
    cartItems = document.getElementById('cartItems');
    cartTotal = document.getElementById('cartTotal');
    cartCount = document.getElementById('cartCount');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    codBtn = document.getElementById('codBtn');
    codModal = document.getElementById('codModal');
    closeCodModal = document.getElementById('closeCodModal');
    codForm = document.getElementById('codForm');
    successModal = document.getElementById('successModal');
    closeSuccessModalBtn = document.getElementById('closeSuccessModal');
    orderIdElement = document.getElementById('orderId');
    mobileMenuBtn = document.getElementById('mobileMenuBtn');
    navLinks = document.querySelector('.nav-links');
    navLinksArray = document.querySelectorAll('.nav-link');
    typingText = document.getElementById('typingText');

    // Render and start
    renderProducts();
    updateCartUI();
    createCarouselIndicators();
    updateCarousel();
    setupEventListeners();
    startTypingAnimation();
}

// Expose some functions for inline onclick's
window.addToCart = addToCart;
window.buyNow = buyNow;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.goToSlide = goToSlide;
window.openCodModal = openCodModal;
window.closeCodModal = () => { codModal.style.display = 'none'; };
window.closeCodModal = () => { codModal.style.display = 'none'; };
window.closeModal = () => { cartModal.style.display = 'none'; };

// Ensure init when DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof initStore === 'function') initStore();
});
