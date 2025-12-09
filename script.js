class MoneyHub {
    constructor() {
        this.user = null;
        this.clicks = parseInt(localStorage.getItem('moneyHubClicks')) || 0;
        this.balance = parseInt(localStorage.getItem('moneyHubBalance')) || 0;
        this.clickTimes = [];
        this.facebookAccounts = parseInt(localStorage.getItem('facebookAccounts')) || 0;
        this.currentTarget = 50000;
        this.rewards = {
            50000: { claimed: false, amount: 275 },
            100000: { claimed: false, amount: 550 },
            150000: { claimed: false, amount: 825 },
            200000: { claimed: false, amount: 1100 }
        };
        this.loadRewards();
        this.init();
    }

    init() {
        this.simulateLoading();
        this.initEventListeners();
        this.init3DBackground();
        this.loadUserData();
        
        setInterval(() => this.updateClickSpeed(), 1000);
        setInterval(() => this.checkRewards(), 1000);
        
        // Show welcome notification
        setTimeout(() => this.showWelcomeNotification(), 2000);
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

        // Coin clicking
        document.getElementById('coin-click').addEventListener('click', (e) => {
            this.handleCoinClick(e);
        });

        // Withdraw button
        document.querySelector('.withdraw-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.submitWithdrawal();
        });

        // Notification options
        document.querySelector('.option-btn.continue').addEventListener('click', (e) => {
            e.preventDefault();
            this.continueClicking();
        });

        document.querySelector('.option-btn.withdraw').addEventListener('click', (e) => {
            e.preventDefault();
            this.showWithdrawForm();
        });

        document.querySelector('.close-notif').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideNotification();
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
        document.getElementById('account-quantity').addEventListener('input', (e) => {
            const quantity = parseInt(e.target.value) || 1;
            const totalPrice = quantity * 10;
            document.getElementById('total-price').textContent = totalPrice;
            
            if(quantity > 0) {
                document.getElementById('send-fb-ids').style.display = 'block';
            } else {
                document.getElementById('send-fb-ids').style.display = 'none';
            }
        });

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

    handleCoinClick(event) {
        this.clicks++;
        this.clickTimes.push(Date.now());
        
        // Save clicks
        localStorage.setItem('moneyHubClicks', this.clicks.toString());
        
        // Update display
        document.getElementById('total-clicks').textContent = this.clicks.toLocaleString();
        
        // Play sound
        this.playSound('coin-sound');
        
        // Create click effect
        this.createClickEffect(event);
        
        // Check for rewards
        this.checkForRewards();
        
        // Update display
        this.updateDisplay();
    }

    createClickEffect(event) {
        const effect = document.createElement('div');
        effect.className = 'click-effect';
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

    checkForRewards() {
        Object.keys(this.rewards).forEach(threshold => {
            const numThreshold = parseInt(threshold);
            const reward = this.rewards[threshold];
            
            if (this.clicks >= numThreshold && !reward.claimed) {
                this.showRewardNotification(numThreshold, reward.amount);
                reward.claimed = true;
                this.balance += reward.amount;
                this.saveRewards();
                localStorage.setItem('moneyHubBalance', this.balance.toString());
                this.updateDisplay();
                this.currentTarget = numThreshold;
            }
        });
    }

    showRewardNotification(threshold, amount) {
        const notification = document.getElementById('notification-display');
        const goalSpan = document.getElementById('goal-reached');
        
        goalSpan.textContent = threshold.toLocaleString();
        notification.style.display = 'block';
        
        // Update reward status
        const rewardElement = document.querySelector(`[data-target="${threshold}"] .status`);
        if (rewardElement) {
            rewardElement.textContent = 'Claimed!';
            rewardElement.className = 'status claimed';
        }
        
        this.showToast(`🎉 Congratulations! You earned ${amount} Rs for ${threshold.toLocaleString()} clicks!`, 'success');
    }

    continueClicking() {
        this.hideNotification();
        this.showToast('👍 Continue clicking for next reward!', 'info');
        
        // Reset current target to next one
        const thresholds = Object.keys(this.rewards).map(Number).sort((a,b) => a-b);
        const currentIndex = thresholds.indexOf(this.currentTarget);
        if(currentIndex < thresholds.length - 1) {
            this.currentTarget = thresholds[currentIndex + 1];
            this.showToast(`Next target: ${this.currentTarget.toLocaleString()} clicks for $${(this.rewards[this.currentTarget].amount/275).toFixed(2)}`, 'info');
        } else {
            this.showToast('🎊 All rewards claimed! Keep clicking for fun!', 'success');
        }
    }

    showWithdrawForm() {
        this.hideNotification();
        this.showSection('coin');
        
        setTimeout(() => {
            document.querySelector('.withdraw-section').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }, 100);
    }

    submitWithdrawal() {
        const method = document.getElementById('payment-method').value;
        const accountNumber = document.getElementById('account-number').value;
        const email = document.getElementById('user-email').value;
        
        if (!method || method === 'Select Payment Method') {
            this.showToast('Please select payment method', 'error');
            return;
        }
        
        if (!accountNumber) {
            this.showToast('Please enter your account number', 'error');
            return;
        }
        
        if (!email) {
            this.showToast('Please enter your email', 'error');
            return;
        }
        
        if (this.balance < 275) {
            this.showToast('Minimum withdrawal amount is Rs 275 ($1)', 'error');
            return;
        }
        
        // Send email to owner
        const subject = `Money Hub Withdrawal Request - ${this.user?.name || 'User'}`;
        const body = `
User Information:
Name: ${this.user?.name || 'N/A'}
Email: ${email}
WhatsApp: ${this.user?.whatsapp || 'N/A'}

Withdrawal Details:
Amount: Rs ${this.balance} ($${(this.balance/275).toFixed(2)})
Clicks Completed: ${this.clicks.toLocaleString()}

Payment Information:
Payment Method: ${method}
Account Number: ${accountNumber}
User Email: ${email}

Please send payment screenshot to user's email and WhatsApp.
User will receive notification in Money Hub when payment is sent.

Note: This is an automated withdrawal request from Money Hub system.
        `;
        
        // Open email client
        const mailtoLink = `mailto:xstylishriaz72@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
        
        // Show user notification
        this.showToast(`📧 Withdrawal request sent! Screenshot will be sent to ${email}`, 'success');
        
        // Send notification to user
        this.sendUserNotification(email, method, accountNumber);
        
        // Reset form
        document.getElementById('payment-method').value = 'Select Payment Method';
        document.getElementById('account-number').value = '';
        document.getElementById('user-email').value = '';
        
        // Reset balance (optional - you can decide to keep or reset)
        // this.balance = 0;
        // localStorage.setItem('moneyHubBalance', '0');
        // this.updateDisplay();
    }

    sendUserNotification(email, method, accountNumber) {
        // Store withdrawal request
        const withdrawal = {
            date: new Date().toISOString(),
            email: email,
            method: method,
            account: accountNumber,
            amount: this.balance,
            status: 'pending'
        };
        
        localStorage.setItem('withdrawalRequest', JSON.stringify(withdrawal));
        
        // Show notification in dashboard
        setTimeout(() => {
            this.showToast(`💰 Withdrawal processing... Screenshot will be sent to ${email} within 24 hours.`, 'info');
        }, 2000);
    }

    updateDisplay() {
        // Update balance
        document.getElementById('user-balance').textContent = `₹${this.balance}`;
        document.getElementById('coin-balance').textContent = `$${(this.balance / 275).toFixed(2)} (Rs ${this.balance})`;
        
        // Update click count
        document.getElementById('total-clicks').textContent = this.clicks.toLocaleString();
        
        // Update Facebook accounts count
        document.getElementById('fb-accounts-count').textContent = this.facebookAccounts;
        
        // Update reward statuses
        Object.keys(this.rewards).forEach(threshold => {
            const numThreshold = parseInt(threshold);
            const reward = this.rewards[threshold];
            const rewardElement = document.querySelector(`[data-target="${threshold}"] .status`);
            
            if (rewardElement) {
                if (this.clicks >= numThreshold) {
                    rewardElement.textContent = reward.claimed ? 'Claimed!' : 'Ready to Claim!';
                    rewardElement.className = 'status ' + (reward.claimed ? 'claimed' : 'ready');
                } else {
                    rewardElement.textContent = 'Not Reached';
                    rewardElement.className = 'status';
                }
            }
        });
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
        
        // Show selected section
        document.getElementById(sectionId).classList.add('active');
        
        // Activate corresponding nav button
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
    }

    login() {
        const username = document.querySelector('#login-form input[type="text"]').value;
        const password = document.querySelector('#login-form input[type="password"]').value;
        
        if (!username || !password) {
            this.showToast('Please enter username and password', 'error');
            return;
        }
        
        // Save user
        this.user = {
            name: username,
            email: `${username}@example.com`,
            whatsapp: '+923334912454',
            joined: new Date().toISOString()
        };
        
        localStorage.setItem('moneyHubUser', JSON.stringify(this.user));
        
        this.showToast('Login successful!', 'success');
        this.showDashboard();
    }

    register() {
        const name = document.querySelectorAll('#register-form input[type="text"]')[0].value;
        const email = document.querySelector('#register-form input[type="email"]').value;
        const whatsapp = document.querySelector('#register-form input[type="tel"]').value;
        const password = document.querySelectorAll('#register-form input[type="password"]')[0].value;
        
        if (!name || !email || !whatsapp || !password) {
            this.showToast('Please fill all fields', 'error');
            return;
        }
        
        // Save user
        this.user = {
            name,
            email,
            whatsapp,
            joined: new Date().toISOString()
        };
        
        localStorage.setItem('moneyHubUser', JSON.stringify(this.user));
        
        this.showToast('Registration successful!', 'success');
        this.showDashboard();
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
        this.facebookAccounts = parseInt(localStorage.getItem('facebookAccounts')) || 0;
        
        // Load generated accounts if any
        const savedAccounts = localStorage.getItem('generatedAccounts');
        if (savedAccounts) {
            const accounts = JSON.parse(savedAccounts);
            this.updateAccountsList(accounts);
        }
        
        this.updateDisplay();
    }

    loadRewards() {
        const savedRewards = localStorage.getItem('moneyHubRewards');
        if (savedRewards) {
            this.rewards = JSON.parse(savedRewards);
        }
    }

    saveRewards() {
        localStorage.setItem('moneyHubRewards', JSON.stringify(this.rewards));
    }

    hideNotification() {
        document.getElementById('notification-display').style.display = 'none';
    }

    checkRewards() {
        // Auto-check for reached rewards
        Object.keys(this.rewards).forEach(threshold => {
            const numThreshold = parseInt(threshold);
            const reward = this.rewards[threshold];
            
            if (this.clicks >= numThreshold && !reward.claimed) {
                reward.claimed = true;
                this.balance += reward.amount;
                this.saveRewards();
                localStorage.setItem('moneyHubBalance', this.balance.toString());
                this.updateDisplay();
                this.showRewardNotification(numThreshold, reward.amount);
            }
        });
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
                // Close on click
                this.hideToast();
            }
        }).showToast();
    }

    init3DBackground() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            canvas, 
            alpha: true,
            antialias: true 
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Add floating coins with better 3D effect
        const coins = [];
        const coinCount = 30;

        // Create coin geometry
        const coinGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 32);
        const coinMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0xFFA500,
            emissiveIntensity: 0.2
        });

        for (let i = 0; i < coinCount; i++) {
            const coin = new THREE.Mesh(coinGeometry, coinMaterial);
            
            // Random position
            coin.position.set(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 100
            );
            
            // Random rotation
            coin.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            // Add animation data
            coin.userData = {
                speed: 0.05 + Math.random() * 0.1,
                rotationSpeed: new THREE.Vector3(
                    Math.random() * 0.02,
                    Math.random() * 0.03,
                    Math.random() * 0.01
                ),
                floatHeight: Math.random() * 20,
                floatSpeed: 0.5 + Math.random() * 0.5
            };
            
            scene.add(coin);
            coins.push(coin);
        }

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xFFD700, 1, 100);
        pointLight.position.set(0, 0, 50);
        scene.add(pointLight);

        camera.position.z = 50;

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Animation loop
        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.01;
            
            coins.forEach(coin => {
                // Rotation
                coin.rotation.x += coin.userData.rotationSpeed.x;
                coin.rotation.y += coin.userData.rotationSpeed.y;
                coin.rotation.z += coin.userData.rotationSpeed.z;
                
                // Floating motion
                coin.position.y += Math.sin(time * coin.userData.floatSpeed) * 0.1;
                
                // Slow horizontal drift
                coin.position.x += Math.sin(time * 0.5 + coin.userData.speed) * 0.05;
                coin.position.z += Math.cos(time * 0.3 + coin.userData.speed) * 0.05;
            });
            
            renderer.render(scene, camera);
        }

        animate();
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
    // Add click effect animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes clickEffect {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(3); opacity: 0; }
        }
        @keyframes money-fall {
            0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .money-fall:before {
            content: "$ ₹ € £ ₿";
            position: absolute;
            top: -100px;
            font-size: 24px;
            color: rgba(255, 215, 0, 0.3);
            animation: money-fall 10s linear infinite;
        }
        .money-fall:after {
            content: "$ ₹ € £ ₿";
            position: absolute;
            top: -200px;
            left: 50%;
            font-size: 24px;
            color: rgba(255, 215, 0, 0.3);
            animation: money-fall 12s linear infinite 2s;
        }
    `;
    document.head.appendChild(style);
    
    // Create money falling elements
    const moneyFall = document.querySelector('.money-fall');
    for (let i = 0; i < 20; i++) {
        const money = document.createElement('div');
        money.style.cssText = `
            position: absolute;
            font-size: ${20 + Math.random() * 20}px;
            color: rgba(255, 215, 0, ${0.2 + Math.random() * 0.3});
            left: ${Math.random() * 100}%;
            animation: money-fall ${8 + Math.random() * 8}s linear infinite ${Math.random() * 5}s;
        `;
        money.textContent = ['$', '₹', '€', '£', '₿'][Math.floor(Math.random() * 5)];
        moneyFall.appendChild(money);
    }
    
    // Initialize app
    window.app = new MoneyHub();
});
