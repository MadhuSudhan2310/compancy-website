// Shopping Cart Class
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }
    
    init() {
        this.updateCartCount();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Checkout button
        document.getElementById('checkoutBtn')?.addEventListener('click', () => this.checkout());
        
        // Cart button
        document.getElementById('cartBtn')?.addEventListener('click', () => this.showCart());
    }
    
    addItem(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        return this.cart;
    }
    
    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        return this.cart;
    }
    
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                return this.removeItem(productId);
            }
            item.quantity = quantity;
            this.saveCart();
        }
        return this.cart;
    }
    
    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }
    
    clear() {
        this.cart = [];
        this.saveCart();
        this.updateCartCount();
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    
    updateCartCount() {
        const countElements = document.querySelectorAll('.cart-count');
        const itemCount = this.getItemCount();
        
        countElements.forEach(element => {
            element.textContent = itemCount;
            element.style.display = itemCount > 0 ? 'inline-block' : 'none';
        });
    }
    
    checkout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        const total = this.getTotal();
        
        // In a real app, this would redirect to payment gateway
        alert(`Proceeding to checkout. Total: $${total.toFixed(2)}\n\nThis is a demo. In a real application, you would be redirected to payment.`);
        
        // Clear cart after checkout
        this.clear();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        if (modal) {
            modal.hide();
        }
    }
    
    showCart() {
        // This function is handled by script.js
    }
    
    // Generate cart HTML for display
    getCartHTML() {
        if (this.cart.length === 0) {
            return '<div class="text-center py-4"><i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i><p>Your cart is empty</p></div>';
        }
        
        let html = '';
        this.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            html += `
                <div class="cart-item border-bottom pb-3 mb-3">
                    <div class="row align-items-center">
                        <div class="col-3">
                            <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" 
                                 onerror="this.src='images/default-product.jpg'">
                        </div>
                        <div class="col-5">
                            <h6 class="mb-1">${item.name}</h6>
                            <small class="text-muted">$${item.price} ${item.unit}</small>
                        </div>
                        <div class="col-2">
                            <input type="number" class="form-control form-control-sm quantity-input" 
                                   value="${item.quantity}" min="1" 
                                   data-id="${item.id}">
                        </div>
                        <div class="col-2 text-end">
                            <span class="fw-bold">$${itemTotal.toFixed(2)}</span>
                            <button class="btn btn-sm btn-outline-danger ms-2 remove-item" 
                                    data-id="${item.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
            <div class="cart-total pt-3 border-top">
                <div class="row">
                    <div class="col-6">
                        <h5>Total:</h5>
                    </div>
                    <div class="col-6 text-end">
                        <h5 class="text-primary">$${this.getTotal().toFixed(2)}</h5>
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }
}

// Initialize cart
const shoppingCart = new ShoppingCart();

// Make cart available globally
window.shoppingCart = shoppingCart;

// Update cart display when modal is shown
document.getElementById('cartModal')?.addEventListener('show.bs.modal', function() {
    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        cartItems.innerHTML = shoppingCart.getCartHTML();
        setupCartEventListeners();
    }
});

function setupCartEventListeners() {
    // Quantity change
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const quantity = parseInt(this.value);
            shoppingCart.updateQuantity(productId, quantity);
            
            // Refresh cart display
            const cartItems = document.getElementById('cartItems');
            if (cartItems) {
                cartItems.innerHTML = shoppingCart.getCartHTML();
                setupCartEventListeners();
            }
        });
    });
    
    // Remove item
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            shoppingCart.removeItem(productId);
            
            // Refresh cart display
            const cartItems = document.getElementById('cartItems');
            if (cartItems) {
                cartItems.innerHTML = shoppingCart.getCartHTML();
                setupCartEventListeners();
            }
        });
    });
}