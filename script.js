class MoneyHub {
    constructor() {
        this.user = null;
        this.clicks = parseInt(localStorage.getItem('moneyHubClicks')) || 0;
        this.balance = parseInt(localStorage.getItem('moneyHubBalance')) || 0;
        this.clickTimes = [];
        this.facebookAccounts = parseInt(localStorage.getItem('facebookAccounts')) || 0;
        this.users = JSON.parse(localStorage.getItem('moneyHubUsers')) || {};
        
        // Enhanced Anti-auto-clicker system
        this.antiAutoClicker = {
            lastClickTime: 0,
            maxCPS: 15, // Reduced to 15 clicks per second (more human-like)
            clickTimes: [],
            blocked: false,
            warningCount: 0,
            clickPattern: [],
            autoClickerDetected: false,
            patternThreshold: 5, // Number of consistent clicks to detect pattern
            lastPatternCheck: 0
        };
        
        // 100k cycle system (changed from 50k to 100k)
        this.cycleCount = parseInt(localStorage.getItem('cycleCount')) || 0;
        this.currentCycleClicks = parseInt(localStorage.getItem('currentCycleClicks')) || 0;
        this.cycleCompleted = false;
        this.lastWithdrawalTime = localStorage.getItem('lastWithdrawalTime') || 0;
        this.withdrawalsToday = parseInt(localStorage.getItem('withdrawalsToday')) || 0;
        this.lastWithdrawalDate = localStorage.getItem('lastWithdrawalDate') || '';
        
        this.init();
    }

    init() {
        this.simulateLoading();
        this.initEventListeners();
        this.init3DBackground();
        this.loadUserData();
        this.createMoneyFall();
        
        setInterval(() => this.updateClickSpeed(), 1000);
        setInterval(() => this.checkCycleCompletion(), 500);
        setInterval(() => this.checkAutoClickerPatterns(), 2000);
        
        // Check daily reset for withdrawals
        this.checkDailyReset();
        
        // Show welcome notification
        setTimeout(() => this.showWelcomeNotification(), 2000);
        
        // Check if mobile device
        this.checkMobileDevice();
        
        // Initialize mobile-specific settings
        this.initMobileSettings();
    }

    initMobileSettings() {
        // Force mobile view for all devices (for testing)
        const forceMobile = true; // Set to false for automatic detection
        
        if (forceMobile || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            document.body.classList.add('mobile-device');
            document.documentElement.style.fontSize = '13px';
            
            // Adjust viewport for mobile
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=0.85, maximum-scale=0.85, user-scalable=no, viewport-fit=cover');
            }
            
            // Adjust coin size for mobile
            const coin = document.getElementById('coin-click');
            if (coin) {
                coin.style.width = '180px';
                coin.style.height = '180px';
            }
            
            // Adjust header for mobile
            const header = document.querySelector('header');
            if (header) {
                header.style.padding = '10px 15px';
            }
            
            // Adjust section padding
            document.querySelectorAll('.section').forEach(section => {
                section.style.padding = '15px 10px';
            });
        }
    }

    simulateLoading() {
        const progress = document.querySelector('.progress');
        let width = 0;
        
        const interval = setInterval(() => {
            width += 2;
            progress.style.width = width + '%';
            
            if (width >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    document.getElementById('loading').style.display = 'none';
                    this.checkLogin();
                }, 500);
            }
        }, 40);
    }

    showWelcomeNotification() {
        if(!localStorage.getItem('welcomeShown')) {
            this.showToast('🎉 Welcome to Money Hub! Start earning by clicking coins or creating Facebook accounts!', 'info');
            localStorage.setItem('welcomeShown', 'true');
        }
    }

    checkMobileDevice() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            document.body.classList.add('mobile-device');
            document.documentElement.style.fontSize = '13px';
            setTimeout(() => {
                this.showToast('📱 Mobile mode detected. Auto-clickers are disabled.', 'info');
            }, 3000);
        } else {
            document.body.classList.add('desktop-device');
            document.documentElement.style.fontSize = '14px';
        }
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.lastWithdrawalDate !== today) {
            this.withdrawalsToday = 0;
            this.lastWithdrawalDate = today;
            localStorage.setItem('withdrawalsToday', '0');
            localStorage.setItem('lastWithdrawalDate', today);
        }
    }

    initEventListeners() {
        // Login Form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Register Form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.currentTarget.getAttribute('href').substring(1);
                this.showSection(target);
            });
        });

        // Mobile Footer Navigation
        document.querySelectorAll('.footer-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (e.currentTarget.getAttribute('href')) {
                    const target = e.currentTarget.getAttribute('href').substring(1);
                    this.showSection(target);
                } else {
                    const section = e.currentTarget.dataset.section;
                    if (section) {
                        this.showSection(section);
                    }
                }
                
                // Update active state
                document.querySelectorAll('.footer-nav-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Sports button - Now shows sports section
        document.querySelectorAll('[data-section="sports"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('sports');
            });
        });

        // Help button - Now shows help section
        document.querySelectorAll('[data-section="help"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('help');
            });
        });

        // Help section buttons
        document.querySelectorAll('.support-btn.whatsapp-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openWhatsApp();
            });
        });

        document.querySelectorAll('.support-btn.email').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'mailto:xstylishriaz72@gmail.com';
            });
        });

        // Facebook Account Creation
        document.getElementById('create-fb-accounts').addEventListener('click', (e) => {
            e.preventDefault();
            this.createFacebookAccounts();
        });

        document.getElementById('send-fb-ids').addEventListener('click', (e) => {
            e.preventDefault();
            this.sendFacebookIds();
        });

        // WhatsApp buttons
        document.querySelectorAll('.whatsapp-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openWhatsApp();
            });
        });

        // Email buttons
        document.querySelectorAll('.email').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'mailto:xstylishriaz72@gmail.com';
            });
        });

        // Coin clicking with enhanced anti-auto-clicker
        const coinElement = document.getElementById('coin-click');
        if (coinElement) {
            coinElement.addEventListener('click', (e) => {
                this.handleCoinClick(e);
            });
            
            // Touch events for mobile
            coinElement.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (e.touches.length === 1) {
                    this.handleCoinClick(e.touches[0]);
                }
            });
            
            // Prevent multiple rapid clicks
            coinElement.addEventListener('mousedown', (e) => {
                e.preventDefault();
            });
        }

        // Withdraw button from dashboard
        document.getElementById('dashboard-withdraw-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showWithdrawalPopup();
        });

        // Withdraw now button from notification
        document.getElementById('withdraw-now-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showWithdrawalPopup();
        });

        // Notification options
        document.querySelector('.close-notif').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideNotification();
        });

        // Withdrawal popup
        document.querySelector('.close-popup').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideWithdrawalPopup();
        });

        document.getElementById('withdrawal-popup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitWithdrawalPopup();
        });

        // Logout
        document.querySelector('.logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Register/Login toggle
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegister();
        });

        document.querySelector('.back-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        // Account quantity input
        const quantityInput = document.getElementById('account-quantity');
        if (quantityInput) {
            quantityInput.addEventListener('input', (e) => {
                const quantity = parseInt(e.target.value) || 1;
                const totalPrice = quantity * 10;
                document.getElementById('total-price').textContent = totalPrice;
                
                if(quantity > 0) {
                    document.getElementById('send-fb-ids').style.display = 'block';
                } else {
                    document.getElementById('send-fb-ids').style.display = 'none';
                }
            });
        }

        // Copy buttons
        document.querySelectorAll('.copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const text = e.currentTarget.parentElement.querySelector('code')?.textContent ||
                            e.currentTarget.parentElement.querySelector('span')?.textContent;
                if (text) {
                    this.copyToClipboard(text);
                    this.showToast('Copied to clipboard!', 'success');
                }
            });
        });
    }

    adjustQuantity(change) {
        const input = document.getElementById('account-quantity');
        let value = parseInt(input.value) || 1;
        value += change;
        if (value < 1) value = 1;
        if (value > 100) value = 100;
        input.value = value;
        
        // Trigger input event to update price
        input.dispatchEvent(new Event('input'));
    }

    // Enhanced Login System - Only allows registered users
    login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        // Clear previous errors
        this.clearErrors('login');
        
        // Validation
        if (!username) {
            this.showError('login-username-error', 'Please enter username');
            return;
        }
        
        if (!password) {
            this.showError('login-password-error', 'Please enter password');
            return;
        }
        
        // Check if user exists
        if (!this.users[username]) {
            this.showError('login-error', 'Account not found. Please register first.');
            return;
        }
        
        // Check password
        if (this.users[username].password !== password) {
            this.showError('login-error', 'Incorrect password');
            return;
        }
        
        // Login successful
        this.user = this.users[username];
        localStorage.setItem('moneyHubUser', JSON.stringify(this.user));
        
        this.showToast('Login successful!', 'success');
        this.showDashboard();
    }

    // Enhanced Register System - Stores users properly
    register() {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const whatsapp = document.getElementById('register-whatsapp').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const username = email.split('@')[0] || name.replace(/\s+/g, '').toLowerCase();
        
        // Clear previous errors
        this.clearErrors('register');
        
        // Validation
        if (!name) {
            this.showError('register-name-error', 'Please enter full name');
            return;
        }
        
        if (!email || !this.validateEmail(email)) {
            this.showError('register-email-error', 'Please enter valid email');
            return;
        }
        
        if (!whatsapp || !this.validatePhone(whatsapp)) {
            this.showError('register-whatsapp-error', 'Please enter valid WhatsApp number');
            return;
        }
        
        if (!password || password.length < 6) {
            this.showError('register-password-error', 'Password must be at least 6 characters');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showError('register-confirm-error', 'Passwords do not match');
            return;
        }
        
        // Check if username already exists
        if (this.users[username]) {
            this.showError('register-error', 'Username already exists. Please choose different email.');
            return;
        }
        
        // Create user
        this.users[username] = {
            username: username,
            name: name,
            email: email,
            whatsapp: whatsapp,
            password: password,
            joined: new Date().toISOString(),
            balance: 0
        };
        
        // Save users
        localStorage.setItem('moneyHubUsers', JSON.stringify(this.users));
        
        // Auto login
        this.user = this.users[username];
        localStorage.setItem('moneyHubUser', JSON.stringify(this.user));
        
        // Show success
        this.showSuccess('register-success', 'Account created successfully!');
        this.showToast('Registration successful!', 'success');
        
        // Show dashboard after delay
        setTimeout(() => {
            this.showDashboard();
        }, 1500);
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }

    showSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }

    clearErrors(type) {
        const elements = document.querySelectorAll(`.error-message, .success-message`);
        elements.forEach(el => {
            if (el.id.includes(type)) {
                el.style.display = 'none';
                el.textContent = '';
            }
        });
    }

    createFacebookAccounts() {
        const quantity = parseInt(document.getElementById('account-quantity').value) || 1;
        if (quantity < 1) {
            this.showToast('Please enter a valid number of accounts', 'error');
            return;
        }

        this.facebookAccounts += quantity;
        
        // Generate sample accounts
        const accounts = [];
        for(let i = 0; i < quantity; i++) {
            const randomNum = Math.floor(Math.random() * 1000000);
            const uid = `fb_user_${randomNum}@facebookmail.com`;
            const pass = `Fb@Pass${randomNum}#`;
            accounts.push({uid, pass});
        }
        
        // Store accounts
        localStorage.setItem('facebookAccounts', this.facebookAccounts.toString());
        localStorage.setItem('generatedAccounts', JSON.stringify(accounts));
        
        // Update display
        document.getElementById('fb-accounts-count').textContent = this.facebookAccounts;
        
        // Show notification
        this.showToast(`✅ Created ${quantity} Facebook account(s)! Total: ${this.facebookAccounts} accounts`, 'success');
        
        // Update accounts list
        this.updateAccountsList(accounts);
        
        // Show WhatsApp button
        document.getElementById('send-fb-ids').style.display = 'block';
    }

    updateAccountsList(accounts) {
        const list = document.getElementById('fb-accounts-list');
        list.innerHTML = '';
        
        accounts.forEach((acc, index) => {
            const div = document.createElement('div');
            div.className = 'account-item';
            div.innerHTML = `
                <div class="account-detail">
                    <span>UID:</span>
                    <code>${acc.uid}</code>
                    <button class="copy">
                        <i class="far fa-copy"></i>
                    </button>
                </div>
                <div class="account-detail">
                    <span>Pass:</span>
                    <code>${acc.pass}</code>
                    <button class="copy">
                        <i class="far fa-copy"></i>
                    </button>
                </div>
            `;
            list.appendChild(div);
        });

        // Reattach copy event listeners
        list.querySelectorAll('.copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const text = e.currentTarget.parentElement.querySelector('code').textContent;
                this.copyToClipboard(text);
                this.showToast('Copied to clipboard!', 'success');
            });
        });
    }

    sendFacebookIds() {
        const quantity = parseInt(document.getElementById('account-quantity').value) || 1;
        const totalPrice = quantity * 10;
        const accounts = JSON.parse(localStorage.getItem('generatedAccounts') || '[]');
        
        if (accounts.length === 0) {
            this.showToast('No accounts to send. Please create accounts first.', 'error');
            return;
        }
        
        // Format message for WhatsApp
        let message = `📱 *Facebook Account Order - Money Hub*\n\n`;
        message += `*Quantity:* ${quantity} accounts\n`;
        message += `*Total Price:* ${totalPrice} Rs\n\n`;
        message += `*Account Details:*\n`;
        
        accounts.forEach((acc, index) => {
            message += `${index + 1}. UID: ${acc.uid}\n`;
            message += `   Pass: ${acc.pass}\n\n`;
        });
        
        message += `*User Info:*\n`;
        message += `Name: ${this.user?.name || 'Not provided'}\n`;
        message += `Email: ${this.user?.email || 'Not provided'}\n`;
        message += `WhatsApp: ${this.user?.whatsapp || 'Not provided'}\n\n`;
        message += `*Payment Method:* Easypaisa/JazzCash/Binance\n`;
        message += `*Note:* Payment screenshot will be sent after payment`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/923334912454?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
        
        this.showToast(`📤 Opening WhatsApp to send ${quantity} account details...`, 'info');
    }

    openWhatsApp() {
        window.open('https://wa.me/923334912454', '_blank');
    }

    showHelp() {
        const helpMessage = `
💰 *Money Hub Help Guide* 💰

1. *Facebook Accounts*:
   - Create accounts at 10 Rs each
   - Send UID/Pass to owner via WhatsApp
   - Receive accounts after payment

2. *Trading Signals*:
   - 15,000 Rs per month
   - 90%+ accuracy
   - Daily signals

3. *Los Coin Clicker*:
   - Click coin to earn
   - Rs 275 per 100,000 clicks
   - Unlimited withdrawals per day
   - Auto reset after withdrawal

4. *Payment Methods*:
   - Binance
   - Easypaisa
   - JazzCash
   - Bank Transfer

📞 Contact: +92 333 4912454
📧 Email: xstylishriaz72@gmail.com
        `;
        
        this.showToast('📖 Help guide loaded. Check console for details.', 'info');
        console.log(helpMessage);
    }

    handleCoinClick(event) {
        const now = Date.now();
        
        // Enhanced anti-auto-clicker detection
        if (this.detectAutoClicker(now)) {
            this.showToast('⚠️ Auto-clicker detected! Clicking too fast!', 'warning');
            return;
        }
        
        // Check if blocked
        if (this.antiAutoClicker.blocked || this.antiAutoClicker.autoClickerDetected) {
            this.showToast('🚫 Auto-clicker detected! Clicking disabled.', 'error');
            return;
        }
        
        // Don't count clicks if cycle is completed and waiting for reset
        if (this.cycleCompleted) {
            this.showToast('⚠️ Please withdraw your earnings first.', 'warning');
            return;
        }
        
        // Update clicks - ONLY ONE CLICK PER EVENT
        this.clicks++;
        this.currentCycleClicks++;
        this.clickTimes.push(now);
        
        // Track click pattern for auto-clicker detection
        const timeSinceLastClick = now - this.antiAutoClicker.lastClickTime;
        if (timeSinceLastClick > 0) {
            this.antiAutoClicker.clickPattern.push(timeSinceLastClick);
            if (this.antiAutoClicker.clickPattern.length > 20) {
                this.antiAutoClicker.clickPattern.shift();
            }
        }
        
        // Save data
        localStorage.setItem('moneyHubClicks', this.clicks.toString());
        localStorage.setItem('currentCycleClicks', this.currentCycleClicks.toString());
        
        // Update display
        this.updateDisplay();
        
        // Play sound
        this.playSound('coin-sound');
        
        // Create click effect
        this.createClickEffect(event);
        
        // Check if 100k reached (changed from 50k to 100k)
        if (this.currentCycleClicks >= 100000 && !this.cycleCompleted) {
            this.cycleCompleted = true;
            this.showCycleCompleteNotification();
        }
        
        this.antiAutoClicker.lastClickTime = now;
    }

    detectAutoClicker(now) {
        const timeSinceLastClick = now - this.antiAutoClicker.lastClickTime;
        
        // Check if click is too fast (less than 60ms = ~16 clicks per second)
        if (timeSinceLastClick < 60) {
            this.antiAutoClicker.clickTimes.push(now);
            
            // Check clicks in last second
            const oneSecondAgo = now - 1000;
            this.antiAutoClicker.clickTimes = this.antiAutoClicker.clickTimes.filter(t => t > oneSecondAgo);
            
            // If more than maxCPS in last second, block
            if (this.antiAutoClicker.clickTimes.length > this.antiAutoClicker.maxCPS) {
                this.blockAutoClicker();
                return true;
            }
            
            // Warning for suspicious speed
            if (this.antiAutoClicker.clickTimes.length > 10 && this.antiAutoClicker.warningCount < 3) {
                this.antiAutoClicker.warningCount++;
                this.showToast(`⚠️ Warning ${this.antiAutoClicker.warningCount}/3: Clicking too fast!`, 'warning');
            }
        } else {
            // Reset if reasonable time between clicks
            this.antiAutoClicker.clickTimes = [];
        }
        
        return false;
    }

    checkAutoClickerPatterns() {
        const now = Date.now();
        if (now - this.antiAutoClicker.lastPatternCheck < 2000) return;
        
        this.antiAutoClicker.lastPatternCheck = now;
        
        if (this.antiAutoClicker.clickPattern.length >= 10) {
            // Check for perfect timing patterns (auto-clicker signature)
            let consistentCount = 0;
            for (let i = 1; i < this.antiAutoClicker.clickPattern.length; i++) {
                const diff = Math.abs(this.antiAutoClicker.clickPattern[i] - this.antiAutoClicker.clickPattern[i-1]);
                if (diff < 5) { // Less than 5ms difference between clicks
                    consistentCount++;
                }
            }
            
            if (consistentCount >= 8) { // 80% consistency indicates auto-clicker
                this.antiAutoClicker.autoClickerDetected = true;
                this.blockAutoClicker();
                this.showToast('🚫 Auto-clicker app detected! Clicking disabled.', 'error');
            }
        }
    }

    blockAutoClicker() {
        this.antiAutoClicker.blocked = true;
        this.antiAutoClicker.autoClickerDetected = true;
        
        // Show blocking notification
        this.showToast('🚫 Auto-clicker detected! Clicking disabled. Please use manual clicks.', 'error');
        
        // Show blocker overlay
        const blocker = document.getElementById('auto-clicker-blocker');
        blocker.style.display = 'flex';
        
        // Disable coin clicking
        const coin = document.getElementById('coin-click');
        if (coin) {
            coin.style.pointerEvents = 'none';
            coin.style.opacity = '0.5';
            coin.style.cursor = 'not-allowed';
        }
        
        // Save blocked state
        localStorage.setItem('autoClickerBlocked', 'true');
    }

    createClickEffect(event) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            width: 50px;
            height: 50px;
            background: radial-gradient(circle, #FFD700, transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${event.clientX - 25}px;
            top: ${event.clientY - 25}px;
            animation: clickEffect 0.5s ease-out;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 500);
    }

    updateClickSpeed() {
        const now = Date.now();
        this.clickTimes = this.clickTimes.filter(time => now - time < 1000);
        const clicksPerSecond = this.clickTimes.length;
        document.getElementById('clicks-per-sec').textContent = clicksPerSecond;
    }

    checkCycleCompletion() {
        // Update cycle status
        const cycleStatus = document.getElementById('cycle-status');
        const rewardStatus = document.getElementById('reward-status');
        
        if (this.currentCycleClicks >= 100000) { // Changed from 50000 to 100000
            if (cycleStatus) {
                cycleStatus.textContent = 'Completed';
                cycleStatus.className = 'status ready';
            }
            if (rewardStatus) {
                rewardStatus.textContent = 'Ready to Claim';
                rewardStatus.className = 'status ready';
            }
        } else {
            if (cycleStatus) {
                cycleStatus.textContent = 'In Progress';
                cycleStatus.className = 'status';
            }
            if (rewardStatus) {
                rewardStatus.textContent = 'Complete 100k';
                rewardStatus.className = 'status';
            }
        }
    }

    showCycleCompleteNotification() {
        const notification = document.getElementById('notification-display');
        notification.style.display = 'block';
        
        // Add reward to balance (275 for 100k clicks)
        this.balance += 275;
        localStorage.setItem('moneyHubBalance', this.balance.toString());
        
        // Update user balance in users object
        if (this.user && this.user.username) {
            this.users[this.user.username].balance = this.balance;
            localStorage.setItem('moneyHubUsers', JSON.stringify(this.users));
        }
        
        this.showToast(`🎉 100,000 clicks completed! Rs 275 added to your balance.`, 'success');
        this.updateDisplay();
    }

    showWithdrawalPopup() {
        // Hide notification first
        this.hideNotification();
        
        // Show withdrawal popup
        const popup = document.getElementById('withdrawal-popup');
        popup.style.display = 'flex';
        
        // Set amount
        document.getElementById('popup-amount').textContent = 'Rs 275';
        
        // Auto-fill user details if available
        if (this.user) {
            document.getElementById('popup-name').value = this.user.name || '';
            document.getElementById('popup-email').value = this.user.email || '';
        }
    }

    hideWithdrawalPopup() {
        document.getElementById('withdrawal-popup').style.display = 'none';
        this.clearWithdrawalForm();
    }

    clearWithdrawalForm() {
        document.getElementById('popup-payment-method').value = '';
        document.getElementById('popup-account-number').value = '';
        document.getElementById('popup-email').value = this.user?.email || '';
        document.getElementById('popup-name').value = this.user?.name || '';
        
        // Clear errors
        document.getElementById('method-error').style.display = 'none';
        document.getElementById('account-error').style.display = 'none';
        document.getElementById('email-error').style.display = 'none';
        document.getElementById('name-error').style.display = 'none';
        document.getElementById('withdrawal-success').style.display = 'none';
    }

    submitWithdrawalPopup() {
        const method = document.getElementById('popup-payment-method').value;
        const accountNumber = document.getElementById('popup-account-number').value.trim();
        const email = document.getElementById('popup-email').value.trim();
        const name = document.getElementById('popup-name').value.trim();
        
        // Clear previous errors
        document.getElementById('method-error').style.display = 'none';
        document.getElementById('account-error').style.display = 'none';
        document.getElementById('email-error').style.display = 'none';
        document.getElementById('name-error').style.display = 'none';
        document.getElementById('withdrawal-success').style.display = 'none';
        
        // Validation
        let isValid = true;
        
        if (!method) {
            document.getElementById('method-error').textContent = 'Please select payment method';
            document.getElementById('method-error').style.display = 'block';
            isValid = false;
        }
        
        if (!accountNumber) {
            document.getElementById('account-error').textContent = 'Please enter account number';
            document.getElementById('account-error').style.display = 'block';
            isValid = false;
        }
        
        if (!email || !this.validateEmail(email)) {
            document.getElementById('email-error').textContent = 'Please enter valid email';
            document.getElementById('email-error').style.display = 'block';
            isValid = false;
        }
        
        if (!name) {
            document.getElementById('name-error').textContent = 'Please enter your name';
            document.getElementById('name-error').style.display = 'block';
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Update withdrawals count for today
        this.withdrawalsToday++;
        localStorage.setItem('withdrawalsToday', this.withdrawalsToday.toString());
        
        // Store withdrawal request
        const withdrawal = {
            date: new Date().toISOString(),
            name: name,
            email: email,
            method: method,
            account: accountNumber,
            amount: 275,
            clicks: this.currentCycleClicks,
            status: 'pending'
        };
        
        localStorage.setItem('lastWithdrawalRequest', JSON.stringify(withdrawal));
        
        // Save all withdrawals
        const withdrawals = JSON.parse(localStorage.getItem('allWithdrawals') || '[]');
        withdrawals.push(withdrawal);
        localStorage.setItem('allWithdrawals', JSON.stringify(withdrawals));
        
        // Show success
        document.getElementById('withdrawal-success').style.display = 'block';
        
        // Reset cycle and start new one
        setTimeout(() => {
            this.resetCycleAndStartNew();
            this.hideWithdrawalPopup();
            this.showToast('✅ Withdrawal submitted! Starting new cycle...', 'success');
        }, 2000);
    }

    resetCycleAndStartNew() {
        // Reset cycle
        this.cycleCount++;
        this.currentCycleClicks = 0;
        this.cycleCompleted = false;
        
        // Save data
        localStorage.setItem('cycleCount', this.cycleCount.toString());
        localStorage.setItem('currentCycleClicks', '0');
        
        // Update display
        this.updateDisplay();
        
        this.showToast(`🔄 Starting Cycle ${this.cycleCount + 1}. Click to earn Rs 275!`, 'info');
    }

    updateDisplay() {
        // Update balance
        document.getElementById('user-balance').textContent = `₹${this.balance}`;
        document.getElementById('coin-balance').textContent = `Rs ${this.balance}`;
        
        // Update click count
        document.getElementById('total-clicks').textContent = this.clicks.toLocaleString();
        
        // Update cycle information
        document.getElementById('current-cycle').textContent = this.cycleCount + 1;
        document.getElementById('cycle-number').textContent = this.cycleCount + 1;
        document.getElementById('cycle-progress').textContent = this.currentCycleClicks.toLocaleString();
        document.getElementById('cycle-clicks').textContent = this.currentCycleClicks.toLocaleString();
        document.getElementById('total-cycles').textContent = this.cycleCount;
        
        // Update Facebook accounts count
        document.getElementById('fb-accounts-count').textContent = this.facebookAccounts;
    }

    // Login/Register methods
    checkLogin() {
        const savedUser = localStorage.getItem('moneyHubUser');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('register-screen').classList.add('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showRegister() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('register-screen').classList.remove('hidden');
    }

    showDashboard() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('register-screen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        // Load saved data
        this.loadCoinData();
        this.updateDisplay();
        
        // Check if previously blocked
        if (localStorage.getItem('autoClickerBlocked') === 'true') {
            this.blockAutoClicker();
        }
        
        // Show default section
        this.showSection('facebook');
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Remove active class from footer buttons
        document.querySelectorAll('.footer-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected section
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
            
            // Activate corresponding nav button
            document.querySelector(`[href="#${sectionId}"]`)?.classList.add('active');
            
            // Activate corresponding footer button
            document.querySelector(`.footer-nav-btn[data-section="${sectionId}"]`)?.classList.add('active');
            
            // Scroll to top on mobile
            if (window.innerWidth <= 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            // Default to facebook section
            this.showSection('facebook');
        }
    }

    logout() {
        localStorage.removeItem('moneyHubUser');
        this.user = null;
        this.showLogin();
        this.showToast('Logged out successfully', 'info');
    }

    loadUserData() {
        const savedUser = localStorage.getItem('moneyHubUser');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
        }
    }

    loadCoinData() {
        this.clicks = parseInt(localStorage.getItem('moneyHubClicks')) || 0;
        this.balance = parseInt(localStorage.getItem('moneyHubBalance')) || 0;
        this.currentCycleClicks = parseInt(localStorage.getItem('currentCycleClicks')) || 0;
        this.cycleCount = parseInt(localStorage.getItem('cycleCount')) || 0;
        this.facebookAccounts = parseInt(localStorage.getItem('facebookAccounts')) || 0;
        
        // Load generated accounts if any
        const savedAccounts = localStorage.getItem('generatedAccounts');
        if (savedAccounts) {
            const accounts = JSON.parse(savedAccounts);
            this.updateAccountsList(accounts);
        }
        
        this.updateDisplay();
    }

    hideNotification() {
        document.getElementById('notification-display').style.display = 'none';
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }

    playSound(soundId) {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    showToast(message, type = 'info') {
        const colors = {
            success: 'linear-gradient(45deg, #25D366, #128C7E)',
            error: 'linear-gradient(45deg, #ff4757, #ff6b81)',
            info: 'linear-gradient(45deg, #4A6FA5, #38f9d7)',
            warning: 'linear-gradient(45deg, #FFD700, #FFA500)'
        };

        Toastify({
            text: message,
            duration: 4000,
            gravity: "top",
            position: "right",
            backgroundColor: "transparent",
            background: colors[type] || colors.info,
            stopOnFocus: true,
            style: {
                borderRadius: "10px",
                padding: "15px 25px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                backdropFilter: "blur(10px)",
                margin: "10px"
            },
            onClick: function() {
                this.hideToast();
            }
        }).showToast();
    }

    createMoneyFall() {
        const moneyFall = document.querySelector('.money-fall');
        const symbols = ['$', '₹', '€', '£', '₿'];
        
        for (let i = 0; i < 20; i++) {
            const money = document.createElement('div');
            money.style.cssText = `
                position: absolute;
                font-size: ${20 + Math.random() * 20}px;
                color: rgba(255, 215, 0, ${0.2 + Math.random() * 0.3});
                left: ${Math.random() * 100}%;
                animation: money-fall ${8 + Math.random() * 8}s linear infinite ${Math.random() * 5}s;
                transform-style: preserve-3d;
                transform: translateZ(${Math.random() * 100}px);
            `;
            money.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            moneyFall.appendChild(money);
        }
    }

    init3DBackground() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;
        
        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
                canvas, 
                alpha: true,
                antialias: true 
            });
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Add enhanced floating coins with 3D effects
            const coins = [];
            const coinCount = 25;

            const coinGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 32);
            const coinMaterial = new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                metalness: 0.95,
                roughness: 0.05,
                emissive: 0xFFA500,
                emissiveIntensity: 0.3,
                envMapIntensity: 1.0
            });

            for (let i = 0; i < coinCount; i++) {
                const coin = new THREE.Mesh(coinGeometry, coinMaterial);
                
                coin.position.set(
                    (Math.random() - 0.5) * 300,
                    (Math.random() - 0.5) * 300,
                    (Math.random() - 0.5) * 200
                );
                
                coin.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                
                coin.userData = {
                    speed: 0.05 + Math.random() * 0.1,
                    rotationSpeed: new THREE.Vector3(
                        Math.random() * 0.03,
                        Math.random() * 0.04,
                        Math.random() * 0.02
                    ),
                    floatHeight: Math.random() * 20,
                    floatSpeed: 0.5 + Math.random() * 0.5,
                    scale: 0.8 + Math.random() * 0.4,
                    bounce: 0,
                    waveOffset: Math.random() * Math.PI * 2
                };
                
                coin.scale.setScalar(coin.userData.scale);
                
                scene.add(coin);
                coins.push(coin);
            }

            // Add enhanced 3D lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(1, 1, 1);
            scene.add(directionalLight);

            const pointLight1 = new THREE.PointLight(0xFFD700, 1, 200);
            pointLight1.position.set(50, 50, 50);
            scene.add(pointLight1);

            const pointLight2 = new THREE.PointLight(0x25D366, 0.8, 200);
            pointLight2.position.set(-50, -50, 50);
            scene.add(pointLight2);

            const pointLight3 = new THREE.PointLight(0x4A6FA5, 0.6, 200);
            pointLight3.position.set(0, 0, 100);
            scene.add(pointLight3);

            camera.position.z = 80;

            // Handle window resize
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            // Enhanced Animation loop with 3D effects
            let time = 0;
            function animate() {
                requestAnimationFrame(animate);
                time += 0.01;
                
                coins.forEach(coin => {
                    // Enhanced 3D rotation
                    coin.rotation.x += coin.userData.rotationSpeed.x;
                    coin.rotation.y += coin.userData.rotationSpeed.y;
                    coin.rotation.z += coin.userData.rotationSpeed.z;
                    
                    // 3D floating motion with sine wave
                    coin.position.y += Math.sin(time * coin.userData.floatSpeed + coin.userData.waveOffset) * 0.15;
                    
                    // Circular motion in 3D space
                    coin.position.x += Math.sin(time * 0.7 + coin.userData.speed) * 0.08;
                    coin.position.z += Math.cos(time * 0.5 + coin.userData.speed) * 0.08;
                    
                    // 3D Bouncing effect
                    coin.userData.bounce = Math.sin(time * 2 + coin.userData.speed) * 0.05;
                    coin.position.y += coin.userData.bounce;
                    
                    // 3D Pulsing scale
                    const pulseScale = 0.95 + Math.sin(time * 2 + coin.userData.speed) * 0.05;
                    coin.scale.setScalar(coin.userData.scale * pulseScale);
                    
                    // 3D Wobble effect
                    coin.rotation.x += Math.sin(time * 1.5) * 0.01;
                    coin.rotation.z += Math.cos(time * 1.2) * 0.01;
                });
                
                // Camera subtle movement for 3D effect
                camera.position.x = Math.sin(time * 0.1) * 10;
                camera.position.y = Math.cos(time * 0.1) * 5;
                camera.lookAt(0, 0, 0);
                
                renderer.render(scene, camera);
            }

            animate();
        } catch (error) {
            console.log('3D background failed:', error);
        }
    }
}

// Global function for quantity adjustment
function adjustQuantity(change) {
    const input = document.getElementById('account-quantity');
    let value = parseInt(input.value) || 1;
    value += change;
    if (value < 1) value = 1;
    if (value > 100) value = 100;
    input.value = value;
    
    // Update price
    const totalPrice = value * 10;
    document.getElementById('total-price').textContent = totalPrice;
    
    // Show/hide WhatsApp button
    if (value > 0) {
        document.getElementById('send-fb-ids').style.display = 'block';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MoneyHub();
    
    // Enhanced mobile viewport settings
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=0.85, maximum-scale=0.85, user-scalable=no, viewport-fit=cover');
        }
        
        // Prevent zoom on input focus
        document.addEventListener('focusin', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
        
        // Adjust body size for mobile
        document.body.style.transform = 'scale(0.95)';
        document.body.style.transformOrigin = 'top center';
    }
    
    // Handle image errors
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
            this.alt = 'Image not available';
        });
    });
    
    // Add 3D hover effects to all interactive elements
    document.querySelectorAll('button, .nav-btn, .footer-nav-btn, .img-box, .service-img').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) translateZ(20px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) translateZ(0)';
        });
        
        // Touch feedback for mobile
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95) translateZ(10px)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1) translateZ(0)';
        });
    });
});