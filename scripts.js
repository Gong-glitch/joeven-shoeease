// Default products shown when no admin products exist yet
const DEFAULT_PRODUCTS = [
    { id: 'default-1', name: 'Old Skool Brown', price: 24.99, imgSrc: 'pictures/images.jpg' },
    { id: 'default-2', name: 'New Balance', price: 39.99, imgSrc: 'pictures/m108014g_nb_02_i.webp' },
    { id: 'default-3', name: 'Nike Air', price: 49.99, imgSrc: 'pictures/ph-11134201-23020-eens29h0zmnvbd.webp' },
    { id: 'default-4', name: 'Nike Air Black', price: 49.99, imgSrc: 'pictures/ph-11134207-7r98o-lkq2hmpal6ipd4.webp' }
];

// Global Array to hold products
let dbProductsCache = [];

document.addEventListener('DOMContentLoaded', () => {
    
    // --- MOBILE DRAWER LOGIC ---
    const menuBtn = document.getElementById('menuBtn');
    const closeDrawer = document.getElementById('closeDrawer');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    const toggleDrawer = (e) => {
        if (e && e.type === 'touchstart') e.preventDefault(); 
        if (mobileDrawer && drawerOverlay) {
            mobileDrawer.classList.toggle('-translate-x-full');
            drawerOverlay.classList.toggle('hidden');
        }
    };

    if (menuBtn) {
        menuBtn.addEventListener('click', toggleDrawer);
        menuBtn.addEventListener('touchstart', toggleDrawer, { passive: false });
    }
    if (closeDrawer) {
        closeDrawer.addEventListener('click', toggleDrawer);
        closeDrawer.addEventListener('touchstart', toggleDrawer, { passive: false });
    }
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', toggleDrawer);
        drawerOverlay.addEventListener('touchstart', toggleDrawer, { passive: false });
    }
    drawerLinks.forEach(link => {
        link.addEventListener('click', toggleDrawer);
    });

    // --- CAROUSEL LOGIC ---
    const carousel = document.querySelector('.carousel');
    const slides = document.querySelectorAll('.carousel-slide');
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    let index = 0;
    let slideInterval;

    function moveToSlide(newIndex) {
        if (!carousel || slides.length === 0) return;
        const totalSlides = slides.length;
        if (newIndex < 0) newIndex = totalSlides - 1;
        else if (newIndex >= totalSlides) newIndex = 0;
        
        carousel.style.transform = `translateX(-${newIndex * 100}%)`; 
        index = newIndex;
    }

    const startAutoSlide = () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => moveToSlide(index + 1), 3000);
    };

    if (prev && next) {
        prev.addEventListener('click', () => { moveToSlide(index - 1); startAutoSlide(); });
        next.addEventListener('click', () => { moveToSlide(index + 1); startAutoSlide(); });
        startAutoSlide();
    }

    // --- SMART CART SYSTEM CORE ---
    let cartData = [];
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartTrigger = document.getElementById('cartTrigger');
    const closeCart = document.getElementById('closeCart');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalDisplay = document.getElementById('cartTotal');
    const cartTotalNav = document.getElementById('cartTotalNav');
    const cartCountDisplay = document.getElementById('cartCountDisplay');

    const toggleCart = () => {
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.toggle('translate-x-full');
            cartOverlay.classList.toggle('hidden');
        }
    };

    if (cartTrigger) cartTrigger.addEventListener('click', toggleCart);
    if (closeCart) closeCart.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    function updateCartUI() {
        if (!cartItemsList) return;
        cartItemsList.innerHTML = '';
        let totalSelected = 0;
        let totalItems = 0;

        if (cartData.length === 0) {
            cartItemsList.innerHTML = '<p class="text-center text-gray-500 mt-10">Your cart is empty.</p>';
        } else {
            cartData.forEach((item, idx) => {
                if (item.selected) totalSelected += item.price * item.quantity;
                totalItems += item.quantity;

                const div = document.createElement('div');
                div.className = "flex items-center gap-3 border-b pb-3 text-slate-800";
                div.innerHTML = `
                    <input type="checkbox" ${item.selected ? 'checked' : ''} data-index="${idx}" class="cart-select-checkbox w-4 h-4 accent-orange-500 cursor-pointer">
                    <img src="${item.img}" class="w-12 h-12 object-cover rounded shadow-sm">
                    <div class="flex-grow">
                        <h4 class="font-bold text-[10px] uppercase text-slate-800">${item.name}</h4>
                        <p class="text-gray-500 text-xs">$${item.price.toFixed(2)}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <button data-index="${idx}" data-delta="-1" class="qty-btn bg-gray-100 hover:bg-gray-200 px-2 rounded text-xs font-bold text-slate-700">-</button>
                            <span class="text-xs font-bold">${item.quantity}</span>
                            <button data-index="${idx}" data-delta="1" class="qty-btn bg-gray-100 hover:bg-gray-200 px-2 rounded text-xs font-bold text-slate-700">+</button>
                        </div>
                    </div>
                    <button data-index="${idx}" class="delete-cart-item text-red-400 hover:text-red-600 transition">🗑️</button>
                `;
                cartItemsList.appendChild(div);
            });
        }

        if (cartTotalDisplay) cartTotalDisplay.innerText = totalSelected.toFixed(2);
        if (cartTotalNav) cartTotalNav.innerText = totalSelected.toFixed(2);
        if (cartCountDisplay) cartCountDisplay.innerText = totalItems;

        // Securely bind events to modular layout content
        attachCartActionListeners();
    }

    function attachCartActionListeners() {
        // Toggle selection status checkboxes
        document.querySelectorAll('.cart-select-checkbox').forEach(box => {
            box.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                cartData[idx].selected = !cartData[idx].selected;
                updateCartUI();
            });
        });

        // Quantity selector step switches (+/-)
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const delta = parseInt(e.target.dataset.delta);
                cartData[idx].quantity += delta;
                
                if (cartData[idx].quantity < 1) {
                    cartData.splice(idx, 1);
                }
                updateCartUI();
            });
        });

        // Item deletion button
        document.querySelectorAll('.delete-cart-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                cartData.splice(idx, 1);
                updateCartUI();
            });
        });
    }

    const checkoutBtn = document.querySelector('#cartSidebar .bg-orange-500');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const selected = cartData.filter(i => i.selected);
            if (selected.length === 0) return alert("Select items to checkout!");
            alert(`Success! Paid: $${cartTotalDisplay.innerText}`);
            cartData = cartData.filter(i => !i.selected);
            updateCartUI();
            toggleCart();
        });
    }

    // ==========================================
    // --- DATABASE INTEGRATION (CRUD: READ) ---
    // ==========================================
    const productsContainer = document.getElementById('products');

    function loadDatabaseStorefront() {
        if (!productsContainer) return;
        const stored = JSON.parse(localStorage.getItem('shoeease_products') || '[]');
        dbProductsCache = stored.length > 0 ? stored : DEFAULT_PRODUCTS;
        renderProductGrid(dbProductsCache);
    }

    function renderProductGrid(productsArray) {
        if (!productsContainer) return;
        productsContainer.innerHTML = '';

        if(productsArray.length === 0) {
            productsContainer.innerHTML = '<p class="col-span-full text-center text-gray-400 py-6">No matching footwear found matching search input filters.</p>';
            return;
        }

        productsArray.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = "product border p-4 rounded-xl text-center shadow-sm hover:shadow-lg transition-all duration-300 bg-white flex flex-col justify-between";
            productCard.innerHTML = `
                <div>
                    <img src="${product.imgSrc}" alt="${product.name}" class="mx-auto h-48 object-cover rounded-lg bg-gray-50">
                    <h3 class="font-bold mt-2 text-slate-800 text-base">${product.name}</h3>
                    <p class="text-orange-500 font-bold">$${product.price.toFixed(2)}</p>
                </div>
                <button class="add-to-cart bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 mt-3 rounded-lg transition-all font-semibold text-sm tracking-wide shadow-sm transform active:scale-95 duration-150">
                    Add to Cart
                </button>
            `;

            // Setup programmatic context click bindings to prevent modular scope leaks
            productCard.querySelector('.add-to-cart').addEventListener('click', (e) => {
                const btn = e.target;
                const existing = cartData.find(i => i.name === product.name);
                
                if (existing) {
                    existing.quantity++;
                } else {
                    cartData.push({ name: product.name, price: product.price, img: product.imgSrc, quantity: 1, selected: true });
                }
                
                updateCartUI();
                
                // UX Confirmation state switch animation
                const originalText = btn.innerText;
                btn.innerText = "✓ Added";
                btn.classList.add('bg-orange-500', 'hover:bg-orange-600');
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.classList.remove('bg-orange-500', 'hover:bg-orange-600');
                }, 1000);
            });

            productsContainer.appendChild(productCard);
        });
    }

    // --- NAVBAR & SEARCH FILTER PROCESSING LOGIC ---
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.querySelector('.relative.group span.cursor-pointer');

    if (searchIcon && searchInput) {
        const toggleSearch = () => {
            if (window.innerWidth < 640) { 
                searchInput.classList.toggle('hidden');
                searchInput.focus();
            }
        };
        searchIcon.addEventListener('click', toggleSearch);
        searchIcon.addEventListener('touchstart', toggleSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const queryValue = e.target.value.toLowerCase().trim();
            
            // Evaluates user queries against live data structures cached from cloud storage snapshot arrays
            const filteredProducts = dbProductsCache.filter(product => 
                product.name.toLowerCase().includes(queryValue)
            );
            
            // Re-render only matching products arrays onto template fields
            renderProductGrid(filteredProducts);
        });
    }

    // Initialize application catalog load process sequence
    loadDatabaseStorefront();
});