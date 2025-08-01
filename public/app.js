// BTMM Trading App Frontend JavaScript

class TradingApp {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        this.currentTab = 'trades';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeGoogleAuth();
        if (this.token) {
            this.loadUser();
        } else {
            this.showAuthSection();
        }
    }

    setupEventListeners() {
        // Auth buttons
        document.getElementById('login-btn').addEventListener('click', () => this.showLoginForm());
        document.getElementById('register-btn').addEventListener('click', () => this.showRegisterForm());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Auth forms
        document.getElementById('login-form-element').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form-element').addEventListener('submit', (e) => this.handleRegister(e));

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // New trade form
        document.getElementById('new-trade-form').addEventListener('submit', (e) => this.handleNewTrade(e));

        // Screenshot upload
        document.getElementById('upload-screenshot-btn').addEventListener('click', () => this.showUploadModal());
        document.getElementById('upload-form').addEventListener('submit', (e) => this.handleScreenshotUpload(e));
        document.getElementById('cancel-upload').addEventListener('click', () => this.hideUploadModal());
    }

    // Initialize Google OAuth
    initializeGoogleAuth() {
        window.onload = () => {
            if (typeof google !== 'undefined') {
                google.accounts.id.initialize({
                    client_id: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // You'll need to replace this with your actual Google Client ID
                    callback: this.handleGoogleSignIn.bind(this)
                });

                // Render Google Sign-In buttons
                google.accounts.id.renderButton(
                    document.getElementById('google-signin-button'),
                    {
                        theme: 'filled_blue',
                        size: 'large',
                        width: '100%',
                        text: 'signin_with'
                    }
                );

                google.accounts.id.renderButton(
                    document.getElementById('google-signin-button-register'),
                    {
                        theme: 'filled_blue',
                        size: 'large',
                        width: '100%',
                        text: 'signup_with'
                    }
                );
            }
        };
    }

    // Handle Google Sign-In response
    async handleGoogleSignIn(response) {
        this.showLoading();

        try {
            const apiResponse = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: response.credential })
            });

            const data = await apiResponse.json();

            if (apiResponse.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                this.showDashboard();
                this.showNotification(data.message || 'Google sign-in successful!', 'success');
            } else {
                this.showNotification(data.error || 'Google sign-in failed', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Authentication methods
    async handleLogin(e) {
        e.preventDefault();
        this.showLoading();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                this.showDashboard();
                this.showNotification('Login successful!', 'success');
            } else {
                this.showNotification(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        this.showLoading();

        const firstName = document.getElementById('register-firstname').value;
        const lastName = document.getElementById('register-lastname').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ firstName, lastName, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                this.showDashboard();
                this.showNotification('Registration successful!', 'success');
            } else {
                this.showNotification(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadUser() {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                this.showDashboard();
            } else {
                this.logout();
            }
        } catch (error) {
            this.logout();
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        this.showAuthSection();
    }

    // UI methods
    showAuthSection() {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('user-info').classList.add('hidden');
        document.getElementById('auth-buttons').classList.remove('hidden');
    }

    showDashboard() {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('user-info').classList.remove('hidden');
        document.getElementById('auth-buttons').classList.add('hidden');
        
        if (this.user) {
            document.getElementById('user-name').textContent = `${this.user.first_name} ${this.user.last_name}`;
        }

        this.loadDashboardData();
    }

    showLoginForm() {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
    }

    showRegisterForm() {
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('login-form').classList.add('hidden');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.classList.add('hidden');
        });
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        switch (tabName) {
            case 'trades':
                this.loadTrades();
                break;
            case 'screenshots':
                this.loadScreenshots();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    // Dashboard data loading
    async loadDashboardData() {
        await Promise.all([
            this.loadStats(),
            this.loadTrades()
        ]);
    }

    async loadStats() {
        try {
            const response = await fetch('/api/analytics/stats', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateStatsCards(data.stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatsCards(stats) {
        document.getElementById('total-trades').textContent = stats.totalTrades;
        document.getElementById('win-rate').textContent = `${stats.winRate}%`;
        document.getElementById('total-pnl').textContent = `$${stats.totalPnL}`;
        document.getElementById('profit-factor').textContent = stats.profitFactor;
    }

    async loadTrades() {
        try {
            const response = await fetch('/api/trades', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderTrades(data.trades);
                this.populateTradeSelect(data.trades);
            }
        } catch (error) {
            console.error('Error loading trades:', error);
        }
    }

    renderTrades(trades) {
        const tbody = document.getElementById('trades-table-body');
        tbody.innerHTML = '';

        trades.forEach(trade => {
            const row = document.createElement('tr');
            row.className = 'table-row';
            
            const statusClass = `status-${trade.status}`;
            const directionClass = `direction-${trade.direction}`;
            const pnlClass = trade.pnl > 0 ? 'pnl-positive' : trade.pnl < 0 ? 'pnl-negative' : 'pnl-neutral';

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${trade.symbol}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="${directionClass}">${trade.direction.toUpperCase()}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${trade.entry_price}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${trade.exit_price || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${pnlClass}">
                    ${trade.pnl ? `$${trade.pnl.toFixed(2)}` : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="${statusClass}">${trade.status.toUpperCase()}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button onclick="app.viewTrade('${trade.id}')" class="text-blue-400 hover:text-blue-300 mr-2">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${trade.status === 'open' ? `
                        <button onclick="app.closeTrade('${trade.id}')" class="text-green-400 hover:text-green-300 mr-2">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button onclick="app.deleteTrade('${trade.id}')" class="text-red-400 hover:text-red-300">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    populateTradeSelect(trades) {
        const select = document.getElementById('screenshot-trade-id');
        select.innerHTML = '<option value="">Select Trade</option>';
        
        trades.filter(trade => trade.status === 'open').forEach(trade => {
            const option = document.createElement('option');
            option.value = trade.id;
            option.textContent = `${trade.symbol} - ${trade.direction.toUpperCase()}`;
            select.appendChild(option);
        });
    }

    async handleNewTrade(e) {
        e.preventDefault();
        this.showLoading();

        const formData = {
            symbol: document.getElementById('trade-symbol').value.toUpperCase(),
            direction: document.getElementById('trade-direction').value,
            entry_price: document.getElementById('trade-entry-price').value,
            stop_loss: document.getElementById('trade-stop-loss').value,
            take_profit: document.getElementById('trade-take-profit').value,
            position_size: document.getElementById('trade-position-size').value,
            risk_amount: document.getElementById('trade-risk-amount').value,
            strategy: document.getElementById('trade-strategy').value,
            market_structure: document.getElementById('trade-market-structure').value,
            session: document.getElementById('trade-session').value,
            entry_reason: document.getElementById('trade-entry-reason').value,
            notes: document.getElementById('trade-notes').value
        };

        try {
            const response = await fetch('/api/trades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showNotification('Trade added successfully!', 'success');
                document.getElementById('new-trade-form').reset();
                this.switchTab('trades');
                this.loadDashboardData();
            } else {
                this.showNotification(data.error || 'Failed to add trade', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async closeTrade(tradeId) {
        const exitPrice = prompt('Enter exit price:');
        if (!exitPrice) return;

        const exitReason = prompt('Enter exit reason (optional):') || '';

        this.showLoading();

        try {
            const response = await fetch(`/api/trades/${tradeId}/close`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    exit_price: parseFloat(exitPrice),
                    exit_reason: exitReason
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showNotification('Trade closed successfully!', 'success');
                this.loadDashboardData();
            } else {
                this.showNotification(data.error || 'Failed to close trade', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async deleteTrade(tradeId) {
        if (!confirm('Are you sure you want to delete this trade?')) return;

        this.showLoading();

        try {
            const response = await fetch(`/api/trades/${tradeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.showNotification('Trade deleted successfully!', 'success');
                this.loadDashboardData();
            } else {
                const data = await response.json();
                this.showNotification(data.error || 'Failed to delete trade', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Screenshot methods
    showUploadModal() {
        document.getElementById('upload-modal').classList.remove('hidden');
    }

    hideUploadModal() {
        document.getElementById('upload-modal').classList.add('hidden');
        document.getElementById('upload-form').reset();
    }

    async handleScreenshotUpload(e) {
        e.preventDefault();
        this.showLoading();

        const formData = new FormData();
        const fileInput = document.getElementById('screenshot-file');
        const file = fileInput.files[0];

        if (!file) {
            this.showNotification('Please select a file', 'error');
            this.hideLoading();
            return;
        }

        formData.append('file', file);
        formData.append('trade_id', document.getElementById('screenshot-trade-id').value);
        formData.append('screenshot_type', document.getElementById('screenshot-type').value);
        formData.append('description', document.getElementById('screenshot-description').value);

        try {
            const response = await fetch('/api/screenshots/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                this.showNotification('Screenshot uploaded successfully!', 'success');
                this.hideUploadModal();
                if (this.currentTab === 'screenshots') {
                    this.loadScreenshots();
                }
            } else {
                this.showNotification(data.error || 'Failed to upload screenshot', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadScreenshots() {
        try {
            const response = await fetch('/api/screenshots', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderScreenshots(data.screenshots);
            }
        } catch (error) {
            console.error('Error loading screenshots:', error);
        }
    }

    renderScreenshots(screenshots) {
        const grid = document.getElementById('screenshots-grid');
        grid.innerHTML = '';

        if (screenshots.length === 0) {
            grid.innerHTML = '<p class="text-gray-400 col-span-full text-center py-8">No screenshots uploaded yet.</p>';
            return;
        }

        screenshots.forEach(screenshot => {
            const item = document.createElement('div');
            item.className = 'screenshot-item';
            
            item.innerHTML = `
                <img src="${screenshot.file_url}" alt="${screenshot.description}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-sm font-semibold">${screenshot.screenshot_type.replace('_', ' ').toUpperCase()}</span>
                        <button onclick="app.deleteScreenshot('${screenshot.id}')" class="text-red-400 hover:text-red-300">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                    <p class="text-gray-300 text-sm mb-2">${screenshot.description || 'No description'}</p>
                    <p class="text-gray-500 text-xs">${new Date(screenshot.created_at).toLocaleDateString()}</p>
                </div>
            `;
            
            grid.appendChild(item);
        });
    }

    async deleteScreenshot(screenshotId) {
        if (!confirm('Are you sure you want to delete this screenshot?')) return;

        this.showLoading();

        try {
            const response = await fetch(`/api/screenshots/${screenshotId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.showNotification('Screenshot deleted successfully!', 'success');
                this.loadScreenshots();
            } else {
                const data = await response.json();
                this.showNotification(data.error || 'Failed to delete screenshot', 'error');
            }
        } catch (error) {
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Analytics methods
    async loadAnalytics() {
        try {
            const [statsResponse, btmmResponse] = await Promise.all([
                fetch('/api/analytics/stats', {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                }),
                fetch('/api/analytics/btmm', {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                })
            ]);

            if (statsResponse.ok && btmmResponse.ok) {
                const statsData = await statsResponse.json();
                const btmmData = await btmmResponse.json();
                
                this.renderAnalytics(statsData.stats, btmmData.btmmAnalytics);
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    renderAnalytics(stats, btmmAnalytics) {
        // Strategy stats
        const strategyContainer = document.getElementById('strategy-stats');
        strategyContainer.innerHTML = '';
        
        Object.entries(stats.strategyStats).forEach(([strategy, data]) => {
            const winRate = data.trades > 0 ? ((data.wins / data.trades) * 100).toFixed(1) : 0;
            const item = document.createElement('div');
            item.className = 'mb-4 p-3 bg-gray-700 rounded-lg';
            item.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="font-semibold">${strategy.replace(/_/g, ' ').toUpperCase()}</span>
                    <span class="text-sm text-gray-400">${data.trades} trades</span>
                </div>
                <div class="mt-2 text-sm">
                    <div class="flex justify-between">
                        <span>Win Rate:</span>
                        <span class="${winRate >= 50 ? 'text-green-400' : 'text-red-400'}">${winRate}%</span>
                    </div>
                    <div class="flex justify-between">
                        <span>P&L:</span>
                        <span class="${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}">$${data.pnl.toFixed(2)}</span>
                    </div>
                </div>
            `;
            strategyContainer.appendChild(item);
        });

        // Session stats
        const sessionContainer = document.getElementById('session-stats');
        sessionContainer.innerHTML = '';
        
        Object.entries(stats.sessionStats).forEach(([session, data]) => {
            const winRate = data.trades > 0 ? ((data.wins / data.trades) * 100).toFixed(1) : 0;
            const item = document.createElement('div');
            item.className = 'mb-4 p-3 bg-gray-700 rounded-lg';
            item.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="font-semibold">${session.replace(/_/g, ' ').toUpperCase()}</span>
                    <span class="text-sm text-gray-400">${data.trades} trades</span>
                </div>
                <div class="mt-2 text-sm">
                    <div class="flex justify-between">
                        <span>Win Rate:</span>
                        <span class="${winRate >= 50 ? 'text-green-400' : 'text-red-400'}">${winRate}%</span>
                    </div>
                    <div class="flex justify-between">
                        <span>P&L:</span>
                        <span class="${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}">$${data.pnl.toFixed(2)}</span>
                    </div>
                </div>
            `;
            sessionContainer.appendChild(item);
        });

        // BTMM Analysis
        const btmmContainer = document.getElementById('btmm-analysis');
        btmmContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-semibold mb-4">Market Structure Performance</h4>
                    ${Object.entries(btmmAnalytics.marketStructureStats).map(([structure, data]) => {
                        const winRate = data.trades > 0 ? ((data.wins / data.trades) * 100).toFixed(1) : 0;
                        return `
                            <div class="mb-3 p-3 bg-gray-700 rounded">
                                <div class="flex justify-between">
                                    <span>${structure.toUpperCase()}</span>
                                    <span class="text-sm">${data.trades} trades</span>
                                </div>
                                <div class="text-sm mt-1">
                                    <span class="${winRate >= 50 ? 'text-green-400' : 'text-red-400'}">${winRate}% Win Rate</span>
                                    <span class="ml-4 ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}">$${data.pnl.toFixed(2)}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Risk-Reward Analysis</h4>
                    ${Object.entries(btmmAnalytics.riskRewardAnalysis).map(([range, data]) => {
                        const winRate = data.count > 0 ? ((data.wins / data.count) * 100).toFixed(1) : 0;
                        return `
                            <div class="mb-3 p-3 bg-gray-700 rounded">
                                <div class="flex justify-between">
                                    <span>${range}</span>
                                    <span class="text-sm">${data.count} trades</span>
                                </div>
                                <div class="text-sm mt-1">
                                    <span class="${winRate >= 50 ? 'text-green-400' : 'text-red-400'}">${winRate}% Win Rate</span>
                                    <span class="ml-4 ${data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}">$${data.pnl.toFixed(2)}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Utility methods
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize the app
const app = new TradingApp();
