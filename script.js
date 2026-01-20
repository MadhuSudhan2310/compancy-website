// Product Data with Image References
const products = [
    {
        id: 1,
        name: "Anodized Aluminium Strip",
        category: "strip",
        price: 25.99,
        unit: "/meter",
        image: "Anodized Aluminium Strip.jpeg",
        description: "High-quality anodized aluminium strips for various industrial applications",
        features: ["Corrosion resistant", "Custom lengths", "Multiple colors", "ISO certified"]
    },
    {
        id: 2,
        name: "Coloured Aluminium Coil",
        category: "coil",
        price: 18.50,
        unit: "/kg",
        image: "aluminium-coil.jpg",
        description: "Pre-coloured aluminium coils with excellent surface finish",
        features: ["UV resistant", "Weather proof", "Easy fabrication", "Consistent quality"]
    },
    {
        id: 3,
        name: "Mirror Finish Strip",
        category: "strip",
        price: 42.99,
        unit: "/meter",
        image: "Mirror Finish Strip.jpeg",
        description: "Premium mirror finish aluminium strips for decorative applications",
        features: ["High reflectivity", "Luxury finish", "Easy to clean", "Scratch resistant"]
    },
    {
        id: 4,
        name: "Industrial Grade Coil",
        category: "coil",
        price: 15.25,
        unit: "/kg",
        image: "Industrial Grade Coil.jpeg",
        description: "Heavy-duty aluminium coils for industrial applications",
        features: ["High strength", "Cost effective", "Durable", "Industrial grade"]
    },
    {
        id: 5,
        name: "Custom Fabricated Sheet",
        category: "sheet",
        price: 55.00,
        unit: "/piece",
        image: "Custom Fabricated Sheet.jpeg",
        description: "Custom fabricated aluminium sheets to your specifications",
        features: ["Custom sizes", "Precision cut", "Various thickness", "Tailored solutions"]
    },
    {
        id: 6,
        name: "Embossed Aluminium Sheet",
        category: "sheet",
        price: 35.75,
        unit: "/sheet",
        image: "hero-bg.jpg",
        description: "Decorative embossed aluminium sheets for architectural applications",
        features: ["Patterned surface", "Scratch resistant", "Easy cleaning", "Aesthetic finish"]
    }
];

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    updateCartCount();
    initFilters();
    setupEventListeners();
    initStatsCounter();
});

// Load Products
function loadProducts() {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    grid.innerHTML = "";
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const col = document.createElement("div");
    col.className = "col-lg-4 col-md-6 mb-4";
    
    col.innerHTML = `
        <div class="product-card" data-category="${product.category}">
            <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='default-product.jpg'">
            <h5>${product.name}</h5>
            <p>${product.description}</p>
            <div class="price">$${product.price} ${product.unit}</div>
            <div class="features mb-3">
                ${product.features.slice(0, 2).map(feature => 
                    `<span class="badge bg-light text-dark me-1">${feature}</span>`
                ).join('')}
            </div>
            <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `;
    
    return col;
}

// Initialize Filters
function initFilters() {
    const filterButtons = document.querySelectorAll(".product-filters .btn");
    
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove("active"));
            // Add active class to clicked button
            button.classList.add("active");
            
            const filter = button.getAttribute("data-filter");
            filterProducts(filter);
        });
    });
}

function filterProducts(filter) {
    const productCards = document.querySelectorAll(".product-card");
    
    productCards.forEach(card => {
        if (filter === "all" || card.getAttribute("data-category") === filter) {
            card.parentElement.style.display = "block";
        } else {
            card.parentElement.style.display = "none";
        }
    });
}

// Cart Functions
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCount() {
    const countElements = document.querySelectorAll(".cart-count");
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    countElements.forEach(element => {
        element.textContent = itemCount;
        element.style.display = itemCount > 0 ? "inline-block" : "none";
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Add to Cart buttons
    document.addEventListener("click", (e) => {
        if (e.target.closest(".add-to-cart")) {
            const button = e.target.closest(".add-to-cart");
            const productId = parseInt(button.getAttribute("data-id"));
            addToCart(productId);
        }
    });

    // Cart button
    const cartBtn = document.getElementById("cartBtn");
    if (cartBtn) {
        cartBtn.addEventListener("click", showCartModal);
    }

    // Checkout button
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", checkout);
    }

    // Quote form
    const quoteForm = document.getElementById("quoteForm");
    if (quoteForm) {
        quoteForm.addEventListener("submit", submitQuote);
    }

    // Sample form
    const sampleForm = document.getElementById("sampleForm");
    if (sampleForm) {
        sampleForm.addEventListener("submit", requestSample);
    }

    // Inquiry form
    const inquiryForm = document.getElementById("inquiryForm");
    if (inquiryForm) {
        inquiryForm.addEventListener("submit", submitInquiry);
    }
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    
    // Show notification
    showNotification(`Added ${product.name} to cart!`);
}

// Show Cart Modal
function showCartModal() {
    const modal = new bootstrap.Modal(document.getElementById('cartModal'));
    
    // Update cart items display
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <p>Your cart is empty</p>
            </div>
        `;
    } else {
        let itemsHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            itemsHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='default-product.jpg'">
                    <div class="flex-grow-1">
                        <h6>${item.name}</h6>
                        <p class="text-muted">$${item.price} ${item.unit}</p>
                        <div class="d-flex align-items-center">
                            <input type="number" class="form-control form-control-sm quantity-input" 
                                   value="${item.quantity}" min="1" style="width: 80px;"
                                   data-id="${item.id}">
                            <button class="btn btn-sm btn-outline-danger ms-2 remove-item" 
                                    data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="text-end">
                        <h6>$${itemTotal.toFixed(2)}</h6>
                    </div>
                </div>
            `;
        });
        
        cartItems.innerHTML = itemsHTML;
        cartTotal.textContent = total.toFixed(2);
        
        // Add event listeners for quantity changes and removals
        document.querySelectorAll(".quantity-input").forEach(input => {
            input.addEventListener("change", (e) => {
                const productId = parseInt(e.target.getAttribute("data-id"));
                const quantity = parseInt(e.target.value);
                updateCartQuantity(productId, quantity);
                showCartModal(); // Refresh modal
            });
        });
        
        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", (e) => {
                const productId = parseInt(e.target.closest("button").getAttribute("data-id"));
                removeFromCart(productId);
                showCartModal(); // Refresh modal
            });
        });
    }
    
    modal.show();
}

// Update Cart Quantity
function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    if (quantity <= 0) {
        removeFromCart(productId);
    } else {
        item.quantity = quantity;
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showNotification("Item removed from cart");
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // In a real application, this would redirect to a payment gateway
    alert(`Proceeding to checkout. Total: $${total.toFixed(2)}\n\nThis is a demo. In a real application, you would be redirected to payment.`);
    
    // Clear cart after checkout
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    
    // Close cart modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    if (modal) {
        modal.hide();
    }
}

// Quote Submission
function submitQuote(e) {
    e.preventDefault();
    alert("Thank you for your quote request! We will contact you within 24 hours.");
    
    // Reset form
    e.target.reset();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('quoteModal'));
    if (modal) {
        modal.hide();
    }
}

// Sample Request
function requestSample(e) {
    e.preventDefault();
    alert("Sample request submitted! We will ship your sample within 3-5 business days.");
    
    // Reset form
    e.target.reset();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('sampleModal'));
    if (modal) {
        modal.hide();
    }
}

// Inquiry Submission
function submitInquiry(e) {
    e.preventDefault();
    
    // Save inquiry to localStorage for admin panel
    const formData = new FormData(e.target);
    const inquiry = {
        name: formData.get("name") || "Not provided",
        email: formData.get("email") || "Not provided",
        phone: formData.get("phone") || "Not provided",
        company: formData.get("company") || "Not provided",
        product: formData.get("product") || "General",
        message: formData.get("message") || "No message",
        date: new Date().toISOString(),
        status: "new"
    };
    
    const inquiries = JSON.parse(localStorage.getItem("inquiries")) || [];
    inquiries.push(inquiry);
    localStorage.setItem("inquiries", JSON.stringify(inquiries));
    
    alert("Thank you for your inquiry! We will respond within 24 hours.");
    
    // Reset form
    e.target.reset();
}

// Stats Counter Animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll(".stat-number");
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.getAttribute("data-count"));
                animateCounter(element, target);
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 20);
}

// Notification System
function showNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement("div");
    notification.className = "notification alert alert-success alert-dismissible fade show";
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Style notification
    notification.style.position = "fixed";
    notification.style.top = "20px";
    notification.style.right = "20px";
    notification.style.zIndex = "9999";
    notification.style.minWidth = "300px";
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Make functions available globally
window.addToCart = addToCart;
window.showCartModal = showCartModal;
