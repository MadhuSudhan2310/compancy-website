// Admin Panel Functionality
class AdminPanel {
    constructor() {
        this.products = [];
        this.inquiries = [];
        this.orders = [];
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.renderDashboard();
        this.setupEventListeners();
    }
    
    async loadData() {
        try {
            // Load products
            const productsResponse = await fetch('products.json');
            if (productsResponse.ok) {
                const productsData = await productsResponse.json();
                this.products = productsData.products || [];
            } else {
                console.warn('products.json not found, using default products');
                this.products = this.getDefaultProducts();
            }
            
            // Load inquiries from localStorage
            const storedInquiries = localStorage.getItem('inquiries') || '[]';
            this.inquiries = JSON.parse(storedInquiries);
            
            // Load orders from localStorage
            const storedOrders = localStorage.getItem('orders') || '[]';
            this.orders = JSON.parse(storedOrders);
            
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to default data
            this.products = this.getDefaultProducts();
            this.inquiries = [];
            this.orders = [];
        }
    }
    
    getDefaultProducts() {
        return [
            {
                id: 1,
                name: "Anodized Aluminium Strip",
                category: "strip",
                price: 25.99,
                unit: "/meter",
                image: "images/Anodized Aluminium Strip.jpeg",
                description: "High-quality anodized aluminium strips for various industrial applications",
                features: ["Corrosion resistant", "Custom lengths", "Multiple colors", "ISO certified"],
                stock: 100
            },
            {
                id: 2,
                name: "Coloured Aluminium Coil",
                category: "coil",
                price: 18.50,
                unit: "/kg",
                image: "images/aluminium-coil.jpg",
                description: "Pre-coloured aluminium coils with excellent surface finish",
                features: ["UV resistant", "Weather proof", "Easy fabrication", "Consistent quality"],
                stock: 200
            }
        ];
    }
    
    renderDashboard() {
        // Update stats
        document.getElementById('totalOrders').textContent = this.orders.length;
        document.getElementById('totalRevenue').textContent = 
            '$' + this.orders.reduce((sum, order) => sum + (order.amount || 0), 0).toFixed(2);
        document.getElementById('totalInquiries').textContent = this.inquiries.length;
        document.getElementById('totalProducts').textContent = this.products.length;
        
        // Render products table
        this.renderProductsTable();
        
        // Render inquiries table
        this.renderInquiriesTable();
    }
    
    renderProductsTable() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>
                    <img src="${product.image}" alt="${product.name}" 
                         class="product-img-thumb" 
                         onerror="this.src='images/default-product.jpg'">
                </td>
                <td>${product.name}</td>
                <td>
                    <span class="badge ${this.getCategoryBadgeClass(product.category)}">
                        ${product.category.toUpperCase()}
                    </span>
                </td>
                <td>$${product.price}</td>
                <td>${product.stock || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-2" onclick="admin.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    getCategoryBadgeClass(category) {
        const classes = {
            'strip': 'bg-primary',
            'coil': 'bg-success',
            'sheet': 'bg-warning',
            'custom': 'bg-info'
        };
        return classes[category] || 'bg-secondary';
    }
    
    renderInquiriesTable() {
        const tbody = document.getElementById('inquiriesTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = this.inquiries.map((inquiry, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${inquiry.name || 'N/A'}</td>
                <td>${inquiry.email || 'N/A'}</td>
                <td>${inquiry.product || 'General'}</td>
                <td>${new Date(inquiry.date || Date.now()).toLocaleDateString()}</td>
                <td>
                    <span class="badge ${inquiry.status === 'new' ? 'bg-warning' : 'bg-success'}">
                        ${inquiry.status || 'new'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info me-2" onclick="admin.viewInquiry(${index})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="admin.updateInquiryStatus(${index}, 'responded')">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    setupEventListeners() {
        // Add product form
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct(new FormData(addProductForm));
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
                modal.hide();
                addProductForm.reset();
            });
        }
        
        // Sidebar navigation
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }
    
    addProduct(formData) {
        const features = formData.get('features') 
            ? formData.get('features').split(',').map(f => f.trim()).filter(f => f)
            : [];
        
        const newProduct = {
            id: this.products.length + 1,
            name: formData.get('name') || '',
            category: formData.get('category') || 'strip',
            price: parseFloat(formData.get('price')) || 0,
            unit: formData.get('unit') || '/meter',
            stock: parseInt(formData.get('stock')) || 100,
            description: formData.get('description') || '',
            features: features,
            image: formData.get('image') || 'images/default-product.jpg'
        };
        
        this.products.push(newProduct);
        this.saveProducts();
        this.renderDashboard();
        alert('Product added successfully!');
    }
    
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            // Populate modal with product data
            const form = document.getElementById('addProductForm');
            form.querySelector('[name="name"]').value = product.name;
            form.querySelector('[name="category"]').value = product.category;
            form.querySelector('[name="price"]').value = product.price;
            form.querySelector('[name="unit"]').value = product.unit;
            form.querySelector('[name="stock"]').value = product.stock;
            form.querySelector('[name="description"]').value = product.description;
            form.querySelector('[name="features"]').value = product.features.join(', ');
            form.querySelector('[name="image"]').value = product.image;
            
            // Change button text
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Product';
            submitBtn.onclick = (e) => {
                e.preventDefault();
                this.updateProduct(productId, new FormData(form));
            };
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
            modal.show();
        }
    }
    
    updateProduct(productId, formData) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            const features = formData.get('features') 
                ? formData.get('features').split(',').map(f => f.trim()).filter(f => f)
                : [];
            
            this.products[index] = {
                ...this.products[index],
                name: formData.get('name') || '',
                category: formData.get('category') || 'strip',
                price: parseFloat(formData.get('price')) || 0,
                unit: formData.get('unit') || '/meter',
                stock: parseInt(formData.get('stock')) || 100,
                description: formData.get('description') || '',
                features: features,
                image: formData.get('image') || 'images/default-product.jpg'
            };
            
            this.saveProducts();
            this.renderDashboard();
            alert('Product updated successfully!');
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
            modal.hide();
            
            // Reset form button
            const form = document.getElementById('addProductForm');
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Add Product';
            submitBtn.onclick = null;
            form.reset();
        }
    }
    
    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.renderDashboard();
            alert('Product deleted successfully!');
        }
    }
    
    viewInquiry(inquiryIndex) {
        const inquiry = this.inquiries[inquiryIndex];
        if (inquiry) {
            const details = document.getElementById('inquiryDetails');
            details.innerHTML = `
                <div class="inquiry-details">
                    <div class="mb-3">
                        <strong>Name:</strong> ${inquiry.name || 'N/A'}
                    </div>
                    <div class="mb-3">
                        <strong>Email:</strong> ${inquiry.email || 'N/A'}
                    </div>
                    <div class="mb-3">
                        <strong>Phone:</strong> ${inquiry.phone || 'N/A'}
                    </div>
                    <div class="mb-3">
                        <strong>Company:</strong> ${inquiry.company || 'N/A'}
                    </div>
                    <div class="mb-3">
                        <strong>Product Interest:</strong> ${inquiry.product || 'General'}
                    </div>
                    <div class="mb-3">
                        <strong>Date:</strong> ${new Date(inquiry.date).toLocaleString()}
                    </div>
                    <div class="mb-3">
                        <strong>Message:</strong>
                        <p class="mt-2 p-3 bg-light rounded">${inquiry.message || 'No message'}</p>
                    </div>
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('viewInquiryModal'));
            modal.show();
        }
    }
    
    updateInquiryStatus(inquiryIndex, status) {
        if (this.inquiries[inquiryIndex]) {
            this.inquiries[inquiryIndex].status = status;
            this.saveInquiries();
            this.renderDashboard();
            alert('Inquiry status updated!');
        }
    }
    
    saveProducts() {
        localStorage.setItem('adminProducts', JSON.stringify(this.products));
    }
    
    saveInquiries() {
        localStorage.setItem('inquiries', JSON.stringify(this.inquiries));
    }
    
    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }
}

// Initialize admin panel
const admin = new AdminPanel();

// Make admin globally available
window.admin = admin;