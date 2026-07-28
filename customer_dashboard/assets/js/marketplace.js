// assets/js/marketplace.js - Marketplace specific logic


// ─── API ENDPOINTS ──────────────────────────────────────
// TODO: Replace with your actual API endpoints
// ─── API ENDPOINTS ──────────────────────────────────────
const MARKETPLACE_API = {
    PRODUCTS: '/pharmacy/backend/api/products/list.php',
    CATEGORIES: '/pharmacy/backend/api/categories/list.php',
    SEARCH: '/pharmacy/backend/api/products/search.php', // we'll create this later if needed
    CART: '/pharmacy/backend/api/customer/add-to-cart.php',
    WISHLIST: '/pharmacy/backend/api/customer/wishlist.php',
    UPLOAD_PRESCRIPTION: '/pharmacy/backend/api/customer/upload-prescription.php'
};
// ─── STATE ──────────────────────────────────────────────
let cartCount = 0;
let activeCategory = 'all';
let currentPage = 1;
const PER_PAGE = 8;
let wishlisted = new Set();
let allProducts = [];
let filteredProducts = [];

// ─── INIT ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth('customer')) {
        return;
    }
    
    // Load user info
    loadUserInfo();
    
    // Load products
    loadProducts();
});

// ─── LOAD PRODUCTS ──────────────────────────────────────
async function loadProducts() {
    try {
        const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");

        const response = await fetch(
            MARKETPLACE_API.PRODUCTS,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            showToast(result.message || "Failed to load products", "warn");
            return;
        }

        allProducts = result.data.products.map(product => ({
            id: product.id,
            name: product.medicine_name,
            vendor: product.pharmacy_name,
            price: `GH₵ ${parseFloat(product.selling_price).toFixed(2)}`,
            rating: 5,
            reviews: 0,
            rxRequired: Boolean(product.rx_required),
            category: product.category_name,
            image: product.image
                ? `/pharmacy/uploads/medicines/${product.image}`
                : "https://via.placeholder.com/300x200?text=Medicine"
        }));

        filteredProducts = [...allProducts];

        // Render products into the DOM grid
        renderProducts(filteredProducts.slice(0, PER_PAGE));

        // Update product count heading text
        updateProductCount(filteredProducts.length);

    } catch (error) {
        console.error("Error loading products:", error);
        showToast("Error loading medications. Please try again.", "warn");
    }
}

// ─── RENDER PRODUCTS ────────────────────────────────────
function renderProducts(products, append = false) {
    const grid = document.getElementById('productGrid');
    
    if (!grid) return;
    
    const html = products.map(p => `
        <div class="product-card" onclick="addToCart(${p.id}, '${p.name}')">
            <div class="product-img-wrap">
                ${p.rxRequired ? '<span class="rx-required-badge">Rx Required</span>' : ''}
                <img
                    src="${p.image}"
                    alt="${p.name}"
                    onerror="this.style.display='none';this.parentElement.querySelector('.img-placeholder').style.display='flex';"
                />
                <div class="img-placeholder" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;background:#f3f4f6;">
                    <i class="fa-solid fa-image" style="font-size:2rem;color:#d1d5db;"></i>
                </div>
                <button class="wishlist-btn ${wishlisted.has(p.id) ? 'active' : ''}"
                    id="wish-${p.id}"
                    onclick="event.stopPropagation();toggleWishlist(${p.id}, '${p.name}')">
                    <i class="fa-${wishlisted.has(p.id) ? 'solid' : 'regular'} fa-heart"></i>
                </button>
            </div>
            <div class="product-body">
                <div class="product-vendor">${p.vendor}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-stars">
                    ${renderStars(p.rating)}
                    <span>(${p.reviews})</span>
                </div>
                <div class="product-footer">
                    <div class="product-price">${p.price}</div>
                    <button class="product-add-btn" onclick="event.stopPropagation();addToCart(${p.id}, '${p.name}')">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    if (append) {
        grid.innerHTML += html;
    } else {
        grid.innerHTML = html;
    }
    
    // Update load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        const hasMore = currentPage * PER_PAGE < filteredProducts.length;
        loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';
    }
}

// ─── RENDER STARS ──────────────────────────────────────
function renderStars(rating) {
    return Array.from({length: 5}, (_, i) => 
        `<i class="fa-${i < rating ? 'solid' : 'regular'} fa-star"></i>`
    ).join('');
}

// ─── FILTER PRODUCTS ────────────────────────────────────
function filterTab(btn, category) {
    if (btn) {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
    }
    
    activeCategory = category;
    currentPage = 1;
    
    // Filter products
    filteredProducts = activeCategory === 'all' 
        ? allProducts 
        : allProducts.filter(p => p.category === activeCategory);
    
    // Update title
    const titles = {
        'all': 'Essentials & Common Prescriptions',
        'prescriptions': 'Prescription Medications',
        'wellness': 'Wellness & Supplements',
        'first-aid': 'First Aid & Emergency',
        'chronic-care': 'Chronic Care Medications',
        'devices': 'Medical Devices & Equipment'
    };
    
    const titleEl = document.getElementById('productSectionTitle');
    if (titleEl) {
        titleEl.textContent = titles[category] || 'Products';
    }
    
    // Render filtered products
    renderProducts(filteredProducts.slice(0, PER_PAGE));
    updateProductCount(filteredProducts.length);
}

// ─── SORT PRODUCTS ──────────────────────────────────────
function sortProducts(value) {
    const sorted = [...filteredProducts];
    
    switch(value) {
        case 'price-asc':
            sorted.sort((a, b) => parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, '')));
            break;
        case 'price-desc':
            sorted.sort((a, b) => parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, '')));
            break;
        case 'rating':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            sorted.sort((a, b) => b.id - a.id);
            break;
        default:
            break;
    }
    
    filteredProducts = sorted;
    renderProducts(filteredProducts.slice(0, PER_PAGE));
}

// ─── LOAD MORE PRODUCTS ─────────────────────────────────
function loadMoreProducts() {
    currentPage++;
    const start = (currentPage - 1) * PER_PAGE;
    const end = currentPage * PER_PAGE;
    const moreProducts = filteredProducts.slice(start, end);
    
    renderProducts(moreProducts, true);
}

// ─── SEARCH ─────────────────────────────────────────────
function handleSearch(query) {
    if (!query || query.trim() === '') {
        filteredProducts = activeCategory === 'all' ? allProducts : allProducts.filter(p => p.category === activeCategory);
        renderProducts(filteredProducts.slice(0, PER_PAGE));
        updateProductCount(filteredProducts.length);
        return;
    }
    
    // Search in products
    const results = allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.vendor.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );
    
    filteredProducts = results;
    renderProducts(results.slice(0, PER_PAGE));
    updateProductCount(results.length);
}

function doSearch() {
    const query = document.getElementById('searchInput')?.value.trim();
    if (!query) {
        showToast('Please enter a search term', 'warn');
        return;
    }
    handleSearch(query);
}

// ─── ADD TO CART ────────────────────────────────────────
async function addToCart(productId, productName) {

    try {

        const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");

        const response = await fetch(
            MARKETPLACE_API.CART,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    medicine_id: productId,
                    quantity: 1
                })
            }
        );

        const result = await response.json();

        if (!result.success) {
            showToast(result.message, "warn");
            return;
        }

        cartCount++;

        document.getElementById("cartCount").textContent = cartCount;

        showToast(`"${productName}" added to cart`);

    } catch (error) {

        console.error(error);

        showToast("Unable to add to cart", "warn");
    }

}
// ─── WISHLIST ──────────────────────────────────────────
function toggleWishlist(productId, productName) {
    const isWishlisted = wishlisted.has(productId);
    
    if (isWishlisted) {
        wishlisted.delete(productId);
        showToast(`Removed "${productName}" from wishlist`, 'remove');
    } else {
        wishlisted.add(productId);
        showToast(`"${productName}" saved to wishlist`);
    }
    
    // Update button
    const btn = document.getElementById(`wish-${productId}`);
    if (btn) {
        const icon = btn.querySelector('i');
        btn.classList.toggle('active', wishlisted.has(productId));
        if (icon) {
            icon.className = `fa-${wishlisted.has(productId) ? 'solid' : 'regular'} fa-heart`;
        }
    }
}

// ─── UPLOAD PRESCRIPTION ──────────────────────────────
function uploadPrescription() {
    showToast('Opening prescription upload...');
}

// ─── HELPER FUNCTIONS ──────────────────────────────────
function updateProductCount(count) {
    const subTitle = document.getElementById('productSubTitle');
    if (subTitle) {
        subTitle.textContent = `Browsing ${count} products available for express delivery`;
    }
}

function showLoading() {
    console.log('Loading products...');
}

function hideLoading() {
    console.log('Products loaded');
}

// ─── MOCK DATA  ─────────────
function getMockProducts() {
    return [
        { id: 1, name: 'Atorvastatin 20mg', vendor: 'Elida Pharmaceuticals', price: 'GH₵ 48.00', rating: 4, reviews: 128, rxRequired: true, category: 'prescriptions', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop' },
        { id: 2, name: 'Lisinopril 10mg', vendor: 'City Health Pharma', price: 'GH₵ 36.00', rating: 5, reviews: 214, rxRequired: true, category: 'prescriptions', image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300&h=200&fit=crop' },
        { id: 3, name: 'Metformin HCL 500mg', vendor: 'North Star Meds', price: 'GH₵ 22.00', rating: 4, reviews: 89, rxRequired: true, category: 'chronic-care', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=200&fit=crop' },
        { id: 4, name: 'Vitamin D3 5000IU', vendor: 'GoldCoast Health', price: 'GH₵ 65.00', rating: 5, reviews: 302, rxRequired: false, category: 'wellness', image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300&h=200&fit=crop' },
        { id: 5, name: 'Blood Pressure Monitor', vendor: 'MedDevice Ghana', price: 'GH₵ 380.00', rating: 4, reviews: 56, rxRequired: false, category: 'devices', image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=200&fit=crop' },
        { id: 6, name: 'First Aid Kit Deluxe', vendor: 'SafeMeds Africa', price: 'GH₵ 120.00', rating: 5, reviews: 178, rxRequired: false, category: 'first-aid', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&h=200&fit=crop' },
        { id: 7, name: 'Amoxicillin 500mg', vendor: 'PharmaLink Ghana', price: 'GH₵ 18.00', rating: 4, reviews: 67, rxRequired: true, category: 'prescriptions', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&h=200&fit=crop' },
        { id: 8, name: 'Omega-3 Fish Oil', vendor: 'GoldCoast Health', price: 'GH₵ 95.00', rating: 4, reviews: 143, rxRequired: false, category: 'wellness', image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&h=200&fit=crop' },
        { id: 9, name: 'Digital Thermometer', vendor: 'MedDevice Ghana', price: 'GH₵ 45.00', rating: 5, reviews: 92, rxRequired: false, category: 'devices', image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=300&h=200&fit=crop' },
        { id: 10, name: 'Omeprazole 20mg', vendor: 'Elite Pharma', price: 'GH₵ 28.00', rating: 3, reviews: 44, rxRequired: true, category: 'prescriptions', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=200&fit=crop' },
        { id: 11, name: 'Antiseptic Wound Spray', vendor: 'SafeMeds Africa', price: 'GH₵ 35.00', rating: 4, reviews: 77, rxRequired: false, category: 'first-aid', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=200&fit=crop' },
        { id: 12, name: 'Multivitamin Complex', vendor: 'City Health Pharma', price: 'GH₵ 110.00', rating: 5, reviews: 256, rxRequired: false, category: 'wellness', image: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=300&h=200&fit=crop' },
    ];
}