// payment.js - Payment Processing System

class PaymentSystem {
    constructor() {
        this.paymentMethods = [];
        this.currentMethod = null;
        this.transactionHistory = [];
        this.init();
    }

    async init() {
        await this.loadPaymentMethods();
        this.setupEventListeners();
        this.initStripe();
    }

    async loadPaymentMethods() {
        // Load available payment methods
        this.paymentMethods = [
            {
                id: 'card',
                name: 'Credit/Debit Card',
                icon: 'fa-credit-card',
                enabled: true
            },
            {
                id: 'paypal',
                name: 'PayPal',
                icon: 'fa-paypal',
                enabled: true
            },
            {
                id: 'bank',
                name: 'Bank Transfer',
                icon: 'fa-university',
                enabled: true
            },
            {
                id: 'upi',
                name: 'UPI',
                icon: 'fa-mobile-alt',
                enabled: true
            },
            {
                id: 'cod',
                name: 'Cash on Delivery',
                icon: 'fa-money-bill-wave',
                enabled: true
            }
        ];
    }

    initStripe() {
        // Initialize Stripe.js for card payments
        if (typeof Stripe !== 'undefined') {
            this.stripe = Stripe('pk_test_your_publishable_key_here');
            this.elements = this.stripe.elements();
            this.card = this.elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#32325d',
                        fontFamily: 'Arial, sans-serif',
                        '::placeholder': {
                            color: '#aab7c4'
                        }
                    }
                }
            });
        }
    }

    setupEventListeners() {
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => this.selectPaymentMethod(e));
        });

        // Payment form submission
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.processPayment(e));
        }

        // Card mount
        const cardElement = document.getElementById('card-element');
        if (cardElement && this.card) {
            this.card.mount('#card-element');
            this.card.addEventListener('change', (event) => {
                const displayError = document.getElementById('card-errors');
                if (event.error) {
                    displayError.textContent = event.error.message;
                } else {
                    displayError.textContent = '';
                }
            });
        }
    }

    selectPaymentMethod(event) {
        const methodId = event.currentTarget.dataset.method;
        const method = this.paymentMethods.find(m => m.id === methodId);
        
        if (!method || !method.enabled) {
            alert('This payment method is currently unavailable');
            return;
        }

        // Update UI
        document.querySelectorAll('.payment-method').forEach(m => {
            m.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        // Show relevant form
        this.showPaymentForm(methodId);
        
        this.currentMethod = methodId;
    }

    showPaymentForm(methodId) {
        // Hide all forms
        document.querySelectorAll('.payment-form').forEach(form => {
            form.classList.add('d-none');
        });

        // Show selected form
        const formId = `${methodId}Form`;
        const form = document.getElementById(formId);
        if (form) {
            form.classList.remove('d-none');
        }

        // Update payment method in summary
        document.getElementById('selected-method').textContent = 
            this.paymentMethods.find(m => m.id === methodId)?.name || '';
    }

    async processPayment(event) {
        event.preventDefault();
        
        const amount = parseFloat(document.getElementById('paymentAmount')?.value) || 
                      parseFloat(document.querySelector('.cart-total h5 span')?.textContent) || 0;
        
        if (amount <= 0) {
            alert('Invalid payment amount');
            return;
        }

        const orderId = 'ORD' + Date.now().toString().slice(-8);
        const orderDetails = {
            id: orderId,
            amount: amount,
            method: this.currentMethod,
            date: new Date().toISOString(),
            status: 'pending',
            items: window.shoppingCart ? window.shoppingCart.cart : []
        };

        // Show processing animation
        this.showProcessing(true);

        try {
            let result;
            
            switch (this.currentMethod) {
                case 'card':
                    result = await this.processCardPayment(orderDetails);
                    break;
                case 'paypal':
                    result = await this.processPayPalPayment(orderDetails);
                    break;
                case 'bank':
                    result = await this.processBankTransfer(orderDetails);
                    break;
                case 'upi':
                    result = await this.processUPIPayment(orderDetails);
                    break;
                case 'cod':
                    result = await this.processCOD(orderDetails);
                    break;
                default:
                    throw new Error('Invalid payment method');
            }

            if (result.success) {
                orderDetails.status = 'completed';
                orderDetails.transactionId = result.transactionId;
                this.completeOrder(orderDetails);
            } else {
                throw new Error(result.message || 'Payment failed');
            }

        } catch (error) {
            console.error('Payment error:', error);
            this.showError(error.message);
            orderDetails.status = 'failed';
            this.saveTransaction(orderDetails);
        } finally {
            this.showProcessing(false);
        }
    }

    async processCardPayment(orderDetails) {
        if (!this.stripe || !this.card) {
            throw new Error('Card processing not available');
        }

        // In a real application, you would create a PaymentIntent on your server
        const { paymentMethod, error } = await this.stripe.createPaymentMethod({
            type: 'card',
            card: this.card,
        });

        if (error) {
            throw new Error(error.message);
        }

        // Simulate server-side processing
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    transactionId: 'STRIPE_' + Date.now().toString(),
                    paymentMethodId: paymentMethod.id
                });
            }, 2000);
        });
    }

    async processPayPalPayment(orderDetails) {
        // In a real application, this would integrate with PayPal API
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    transactionId: 'PAYPAL_' + Date.now().toString()
                });
            }, 2000);
        });
    }

    async processBankTransfer(orderDetails) {
        // Generate bank details
        const bankDetails = {
            bankName: 'State Bank of India',
            accountName: 'AluTech Industries',
            accountNumber: '123456789012',
            ifscCode: 'SBIN0001234',
            branch: 'Hyderabad Main Branch'
        };

        // Show bank details to user
        this.showBankDetails(bankDetails, orderDetails);
        
        return {
            success: true,
            requiresVerification: true,
            transactionId: 'BANK_' + Date.now().toString()
        };
    }

    async processUPIPayment(orderDetails) {
        // Generate UPI QR code
        const upiId = 'alutech@upi';
        const amount = orderDetails.amount;
        
        // Show UPI details
        this.showUPIDetails(upiId, amount, orderDetails);
        
        return {
            success: true,
            requiresVerification: true,
            transactionId: 'UPI_' + Date.now().toString()
        };
    }

    async processCOD(orderDetails) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    transactionId: 'COD_' + Date.now().toString()
                });
            }, 1000);
        });
    }

    completeOrder(orderDetails) {
        // Save order
        this.saveOrder(orderDetails);
        
        // Clear cart
        if (window.shoppingCart) {
            window.shoppingCart.clear();
        }
        
        // Show success message
        this.showSuccess(orderDetails);
        
        // Save transaction
        this.saveTransaction(orderDetails);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
        if (modal) {
            modal.hide();
        }
    }

    saveOrder(order) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Update admin panel if available
        if (window.admin) {
            window.admin.orders = orders;
            window.admin.saveOrders();
            window.admin.renderDashboard();
        }
    }

    saveTransaction(transaction) {
        this.transactionHistory.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(this.transactionHistory));
    }

    showProcessing(show) {
        const processingEl = document.getElementById('paymentProcessing');
        const formEl = document.getElementById('paymentForm');
        
        if (processingEl) {
            processingEl.style.display = show ? 'block' : 'none';
        }
        if (formEl) {
            formEl.style.display = show ? 'none' : 'block';
        }
    }

    showError(message) {
        alert('Payment Error: ' + message);
    }

    showSuccess(orderDetails) {
        const modalHTML = `
            <div class="modal fade" id="successModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Payment Successful!</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div class="mb-4">
                                <i class="fas fa-check-circle fa-4x text-success"></i>
                            </div>
                            <h4>Thank You for Your Order!</h4>
                            <p>Your payment has been processed successfully.</p>
                            <div class="order-details mt-4 p-3 bg-light rounded">
                                <p><strong>Order ID:</strong> ${orderDetails.id}</p>
                                <p><strong>Amount:</strong> $${orderDetails.amount.toFixed(2)}</p>
                                <p><strong>Payment Method:</strong> ${orderDetails.method.toUpperCase()}</p>
                                <p><strong>Transaction ID:</strong> ${orderDetails.transactionId}</p>
                            </div>
                            <div class="mt-4">
                                <p>A confirmation email has been sent to your registered email address.</p>
                                <p>You can track your order status from your account.</p>
                            </div>
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                                <i class="fas fa-home"></i> Back to Home
                            </button>
                            <a href="#" class="btn btn-outline-primary">
                                <i class="fas fa-file-invoice"></i> View Invoice
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Clean up modal after hide
        document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    showBankDetails(bankDetails, orderDetails) {
        const modalHTML = `
            <div class="modal fade" id="bankModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Bank Transfer Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i> 
                                Please transfer the exact amount and include your Order ID in the reference.
                            </div>
                            <div class="bank-details p-3 border rounded">
                                <p><strong>Bank Name:</strong> ${bankDetails.bankName}</p>
                                <p><strong>Account Name:</strong> ${bankDetails.accountName}</p>
                                <p><strong>Account Number:</strong> ${bankDetails.accountNumber}</p>
                                <p><strong>IFSC Code:</strong> ${bankDetails.ifscCode}</p>
                                <p><strong>Branch:</strong> ${bankDetails.branch}</p>
                                <p><strong>Amount:</strong> $${orderDetails.amount.toFixed(2)}</p>
                                <p><strong>Reference:</strong> ${orderDetails.id}</p>
                            </div>
                            <div class="mt-3">
                                <p>After making the transfer, please:</p>
                                <ol>
                                    <li>Keep your transaction receipt</li>
                                    <li>Email the receipt to payments@alutech.com</li>
                                    <li>Include your Order ID in the email subject</li>
                                </ol>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                I'll Transfer Later
                            </button>
                            <button type="button" class="btn btn-primary" id="confirmBankTransfer">
                                I've Made the Transfer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const bankModal = new bootstrap.Modal(document.getElementById('bankModal'));
        bankModal.show();
        
        document.getElementById('confirmBankTransfer').addEventListener('click', () => {
            bankModal.hide();
            this.completeOrder(orderDetails);
        });
        
        document.getElementById('bankModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    showUPIDetails(upiId, amount, orderDetails) {
        const modalHTML = `
            <div class="modal fade" id="upiModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">UPI Payment</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div class="qr-code mb-4">
                                <!-- In real app, generate QR code -->
                                <div class="bg-light p-4 d-inline-block rounded">
                                    <i class="fas fa-qrcode fa-4x text-primary"></i>
                                </div>
                            </div>
                            <div class="upi-details p-3 border rounded mb-4">
                                <p><strong>UPI ID:</strong> ${upiId}</p>
                                <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
                                <p><strong>Note:</strong> ${orderDetails.id}</p>
                            </div>
                            <div class="alert alert-info">
                                <i class="fas fa-mobile-alt"></i>
                                Scan the QR code with any UPI app or use the UPI ID above.
                            </div>
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button type="button" class="btn btn-primary" id="confirmUPIPayment">
                                I've Completed Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const upiModal = new bootstrap.Modal(document.getElementById('upiModal'));
        upiModal.show();
        
        document.getElementById('confirmUPIPayment').addEventListener('click', () => {
            upiModal.hide();
            this.completeOrder(orderDetails);
        });
        
        document.getElementById('upiModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Generate payment form modal
    generatePaymentModal(amount) {
        const modalHTML = `
            <div class="modal fade" id="paymentModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Complete Payment</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="payment-summary mb-4">
                                        <h6>Order Summary</h6>
                                        <p><strong>Total Amount:</strong> $${amount.toFixed(2)}</p>
                                        <p><strong>Payment Method:</strong> <span id="selected-method">Select a method</span></p>
                                    </div>
                                    
                                    <h6>Select Payment Method</h6>
                                    <div class="payment-methods mb-4">
                                        ${this.paymentMethods.map(method => `
                                            <div class="payment-method card mb-2 ${method.enabled ? '' : 'disabled'}" 
                                                 data-method="${method.id}" 
                                                 style="cursor: ${method.enabled ? 'pointer' : 'not-allowed'}">
                                                <div class="card-body d-flex align-items-center">
                                                    <i class="fas ${method.icon} fa-2x me-3"></i>
                                                    <div>
                                                        <h6 class="mb-0">${method.name}</h6>
                                                        ${!method.enabled ? '<small class="text-danger">Temporarily unavailable</small>' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div id="paymentProcessing" class="text-center d-none">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Processing...</span>
                                        </div>
                                        <p class="mt-3">Processing your payment...</p>
                                        <p class="small text-muted">Please do not refresh the page.</p>
                                    </div>
                                    
                                    <form id="paymentForm">
                                        <!-- Card Payment Form -->
                                        <div id="cardForm" class="payment-form d-none">
                                            <h6>Card Details</h6>
                                            <div class="mb-3">
                                                <label class="form-label">Card Number</label>
                                                <div id="card-element" class="form-control p-2"></div>
                                                <div id="card-errors" class="text-danger small mt-1"></div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-6 mb-3">
                                                    <label class="form-label">Expiry Date</label>
                                                    <input type="text" class="form-control" placeholder="MM/YY">
                                                </div>
                                                <div class="col-md-6 mb-3">
                                                    <label class="form-label">CVC</label>
                                                    <input type="text" class="form-control" placeholder="123">
                                                </div>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Cardholder Name</label>
                                                <input type="text" class="form-control" placeholder="John Doe">
                                            </div>
                                        </div>
                                        
                                        <!-- PayPal Form -->
                                        <div id="paypalForm" class="payment-form d-none text-center">
                                            <h6>PayPal</h6>
                                            <p>You will be redirected to PayPal to complete your payment.</p>
                                            <button type="button" class="btn btn-primary" id="paypalButton">
                                                <i class="fab fa-paypal"></i> Pay with PayPal
                                            </button>
                                        </div>
                                        
                                        <!-- Other method forms will be shown as needed -->
                                    </form>
                                    
                                    <div class="mt-4">
                                        <button type="submit" form="paymentForm" class="btn btn-primary w-100" disabled>
                                            Pay $${amount.toFixed(2)}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return modalHTML;
    }
}

// Global function to show payment modal
window.showPaymentModal = function(amount) {
    const paymentSystem = new PaymentSystem();
    
    // Create and show payment modal
    const modalHTML = paymentSystem.generatePaymentModal(amount);
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();
    
    // Initialize payment system for this modal
    paymentSystem.init();
    
    // Enable pay button when method is selected
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', () => {
            document.querySelector('#paymentForm button[type="submit"]').disabled = false;
        });
    });
    
    // Clean up modal after hide
    document.getElementById('paymentModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
};

// Initialize payment system when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page that needs payment
    if (document.getElementById('checkoutBtn') || document.querySelector('.cart-total')) {
        window.paymentSystem = new PaymentSystem();
    }
});