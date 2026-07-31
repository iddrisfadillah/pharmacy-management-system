const CART_API = {
    GET: "/pharmacy/backend/api/customer/cart.php",
    ADD: "/pharmacy/backend/api/customer/add-to-cart.php",
    UPDATE: "/pharmacy/backend/api/customer/update-cart.php",
    REMOVE: "/pharmacy/backend/api/customer/remove-from-cart.php",
    CLEAR: "/pharmacy/backend/api/customer/clear-cart.php"
};

let CART = [];

const FBT = [
    {
        name: '7-Day Pill Organizer',
        sub: 'Large capacity, BPA-free',
        price: '$12.99',
        img: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=240&fit=crop'
    },
    {
        name: 'Infrared Thermometer',
        sub: 'Non-contact, 1s Reading',
        price: '$34.99',
        img: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=300&h=240&fit=crop'
    },
    {
        name: 'Nitrile Exam Gloves',
        sub: 'Box of 100, Latex-Free',
        price: '$18.50',
        img: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=240&fit=crop'
    },
    {
        name: 'BP Monitor Pro',
        sub: 'Bluetooth Syncing Enabled',
        price: '$59.00',
        img: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=240&fit=crop'
    }
];

const TAX_RATE = 0.083;
let promoApplied = false;

function getToken() {
    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );
}

// ===============================
// LOAD CART FROM DATABASE
// ===============================
async function loadCart() {
    try {
        const token = getToken();

        const response = await fetch(CART_API.GET, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!result.success) {
            CART = [];
            renderCart();
            return;
        }

        CART = result.data.items.map(item => ({
            id: item.cart_item_id,
            medicineId: item.medicine_id,
            name: item.medicine_name,
            sub: item.pharmacy_name,
            price: Number(item.selling_price),
            qty: Number(item.quantity),
            img: item.image
                ? `/pharmacy/uploads/medicines/${item.image}`
                : "https://via.placeholder.com/160",
            badge: "otc",
            rxNotice: false
        }));

        renderCart();

    } catch (error) {
        console.error(error);
        showToast("Unable to load cart", "warn");
    }
}

// ===============================
// RENDER CART
// ===============================
function renderCart() {
    const container = document.getElementById("cartItems");

    // Calculate total item quantity (e.g., 1 + 1 + 2 = 4)
    const totalCount = CART.reduce((sum, item) => sum + item.qty, 0);

    // Update ALL badges across the application
    document.querySelectorAll('#cartBadge, #topbarCartCount, #cartCount, .cart-badge, .sidebar a[href*="cart.html"] .badge').forEach(badge => {
        if (badge) badge.textContent = totalCount;
    });

    if (!container) return;

    if (CART.length === 0) {
        container.innerHTML = `
        <div class="empty-cart">
            <i class="fa-solid fa-cart-shopping"></i>
            <h3>Your cart is empty</h3>
            <p>Add medications and health products to get started.</p>
            <button class="btn-checkout" style="width:auto;padding:11px 28px;" onclick="window.location='marketplace.html'">
                <i class="fa-solid fa-store"></i> Browse Marketplace
            </button>
        </div>
        `;
        updateSummary();
        return;
    }

    container.innerHTML = CART.map(item => {
        return `
        <div class="cart-item" id="item-${item.id}">
            <img class="item-img" src="${item.img}" alt="${item.name}">
            <div class="item-body">
                <div class="item-name-row">
                    <span class="item-name">${item.name}</span>
                    <span class="otc-badge">OTC</span>
                </div>
                <div class="item-sub">${item.sub}</div>
                <div class="qty-row">
                    <div class="qty-ctrl">
                        <button class="qty-btn" onclick="changeQty(${item.id},-1)">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <input class="qty-val" type="number" value="${item.qty}" min="1" onchange="setQty(${item.id},this.value)">
                        <button class="qty-btn" onclick="changeQty(${item.id},1)">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-btn" onclick="removeItem(${item.id})">
                        <i class="fa-solid fa-trash"></i> Remove
                    </button>
                </div>
            </div>
            <div class="item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
        `;
    }).join("");

    updateSummary();
}

// ===============================
// SUMMARY
// ===============================
function updateSummary() {
    const subtotal = CART.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * TAX_RATE;
    const discount = promoApplied ? subtotal * 0.10 : 0;
    const total = subtotal + tax - discount;

    const subtotalEl = document.getElementById("subtotal");
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;

    const taxAmtEl = document.getElementById("taxAmt");
    if (taxAmtEl) taxAmtEl.textContent = `$${tax.toFixed(2)}`;

    const totalAmtEl = document.getElementById("totalAmt");
    if (totalAmtEl) totalAmtEl.textContent = `$${total.toFixed(2)}`;

    const discountRow = document.getElementById("discountRow");
    if (discountRow) {
        discountRow.style.display = promoApplied ? "flex" : "none";
        const discountAmtEl = document.getElementById("discountAmt");
        if (discountAmtEl) discountAmtEl.textContent = `-$${discount.toFixed(2)}`;
    }
}

// ===============================
// UPDATE QUANTITY
// ===============================
async function changeQty(id, delta) {
    const item = CART.find(i => i.id === id);
    if (!item) return;

    let qty = Math.max(1, item.qty + delta);
    await updateCartItem(id, qty);
}

async function setQty(id, value) {
    let qty = Math.max(1, parseInt(value) || 1);
    await updateCartItem(id, qty);
}

async function updateCartItem(id, quantity) {
    try {
        const response = await fetch(CART_API.UPDATE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                cart_item_id: id,
                quantity: quantity
            })
        });

        const result = await response.json();

        if (result.success) {
            loadCart();
        } else {
            showToast(result.message, "warn");
        }
    } catch (error) {
        console.error(error);
        showToast("Update failed", "warn");
    }
}

// ===============================
// REMOVE ITEM
// ===============================
async function removeItem(id) {
    if (!confirm("Remove this item from your cart?")) {
        return;
    }

    try {
        const response = await fetch(CART_API.REMOVE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                cart_item_id: id
            })
        });

        const result = await response.json();

        if (result.success) {
            showToast("Item removed from cart");
            loadCart();
        } else {
            showToast(result.message, "warn");
        }
    } catch (error) {
        console.error(error);
        showToast("Unable to remove item", "warn");
    }
}

// ===============================
// CLEAR CART
// ===============================
async function clearCart() {
    if (!confirm("Are you sure you want to remove every item from your cart?")) {
        return;
    }

    try {
        const response = await fetch(CART_API.CLEAR, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });

        const result = await response.json();

        if (result.success) {
            showToast("Cart cleared");
            loadCart();
        } else {
            showToast(result.message, "warn");
        }
    } catch (error) {
        console.error(error);
        showToast("Unable to clear cart", "warn");
    }
}

// ===============================
// PROMO
// ===============================
const VALID_CODES = {
    MEDTRUST10: "10% off your order",
    HEALTH10: "10% health discount"
};

function applyPromo() {
    const code = document.getElementById("promoInput").value.trim().toUpperCase();

    if (VALID_CODES[code]) {
        promoApplied = true;
        renderCart();
        showToast("Promo applied");
    } else {
        showToast("Invalid promo code", "warn");
    }
}

// ===============================
// FBT PRODUCTS
// ===============================
function renderFBT() {
    const grid = document.getElementById("fbtGrid");
    if (!grid) return;

    grid.innerHTML = FBT.map(p => `
        <div class="fbt-card">
            <img class="fbt-img" src="${p.img}">
            <div class="fbt-body">
                <div class="fbt-name">${p.name}</div>
                <div class="fbt-sub">${p.sub}</div>
                <div class="fbt-footer">
                    <div class="fbt-price">${p.price}</div>
                    <button class="fbt-add-btn" onclick="addFBT('${p.name}','${p.price}',this)">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function addFBT(name, price, btn) {
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    showToast(`${name} added`);

    CART.push({
        id: Date.now(),
        name: name,
        sub: "Add-on item",
        price: parseFloat(price.replace("$", "")),
        qty: 1,
        img: "",
        badge: "otc"
    });
    renderCart();
}

// ===============================
// START
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    renderFBT();
});