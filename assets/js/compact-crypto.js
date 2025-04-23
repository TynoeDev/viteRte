/**
 * Compact Crypto Widget with Floating Controls
 * Shows a single cryptocurrency (Bitcoin by default) with expandable panels
 * for search, settings, and favorites
 */

class CompactCryptoWidget {
    constructor() {
        this.apiBase = 'https://api.coingecko.com/api/v3';
        this.currentCoin = 'bitcoin';
        this.currentCurrency = 'usd';
        this.updateInterval = 60000; // 1 minute
        this.activeInterval = null;
        this.favorites = this.getFavoritesFromStorage();

        // Define available currencies
        this.currencies = {
            'usd': { symbol: '$', name: 'US Dollar' },
            'eur': { symbol: '€', name: 'Euro' },
            'gbp': { symbol: '£', name: 'British Pound' },
            'jpy': { symbol: '¥', name: 'Japanese Yen' },
            'btc': { symbol: '₿', name: 'Bitcoin' },
            'eth': { symbol: 'Ξ', name: 'Ethereum' }
        };
    }

    /**
     * Initialize the compact crypto widget
     * @param {string} containerId - The ID of the container element
     * @param {Object} options - Configuration options
     */
    initWidget(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container not found: ${containerId}`);
            return;
        }

        // Store options with defaults
        this.options = {
            defaultCoin: 'bitcoin',
            defaultCurrency: 'usd',
            theme: 'dark',
            showFloatingControls: true,
            ...options
        };

        // Set initial values
        this.currentCoin = this.options.defaultCoin;
        this.currentCurrency = this.options.defaultCurrency;

        // Create widget DOM
        this.createWidgetDOM();

        // Set up event listeners
        this.setupEventListeners();

        // Load initial data
        this.loadCoinData();

        // Set up auto-refresh
        this.startAutoRefresh();
    }

    /**
     * Create the main widget DOM structure
     */
    createWidgetDOM() {
            this.container.innerHTML = `
            <div class="compact-crypto-container">
                <!-- Main compact widget -->
                <div class="compact-crypto-widget">
                    <!-- Coin header -->
                    <div class="compact-coin-header">
                        <div class="compact-coin-info">
                            <img src="" alt="" class="compact-coin-icon" id="coin-icon">
                            <span class="compact-coin-name" id="coin-name"></span>
                            <span class="compact-coin-symbol" id="coin-symbol"></span>
                        </div>
                        <div class="compact-coin-rank" id="coin-rank">#--</div>
                    </div>
                    
                    <!-- Price information -->
                    <div class="compact-price-container">
                        <div class="compact-current-price" id="current-price">Loading...</div>
                        <div class="compact-price-change" id="price-change">
                            <span id="change-value">--</span>
                            <i class="ph-fill ph-trend-up" id="change-icon"></i>
                        </div>
                    </div>
                    
                    <!-- Stats section -->
                    <div class="compact-stats">
                        <div class="compact-stat-item">
                            <div class="compact-stat-label">24h Volume</div>
                            <div class="compact-stat-value" id="volume">--</div>
                        </div>
                        <div class="compact-stat-item">
                            <div class="compact-stat-label">Market Cap</div>
                            <div class="compact-stat-value" id="market-cap">--</div>
                        </div>
                        <div class="compact-stat-item">
                            <div class="compact-stat-label">24h High</div>
                            <div class="compact-stat-value" id="high-24h">--</div>
                        </div>
                        <div class="compact-stat-item">
                            <div class="compact-stat-label">24h Low</div>
                            <div class="compact-stat-value" id="low-24h">--</div>
                        </div>
                    </div>
                    
                    <!-- Action buttons -->
                    <div class="compact-actions">
                        <button class="compact-action-button compact-buy-button" id="buy-button">
                            <i class="ph-fill ph-arrow-down"></i> Buy
                        </button>
                        <button class="compact-action-button compact-sell-button" id="sell-button">
                            <i class="ph-fill ph-arrow-up"></i> Sell
                        </button>
                    </div>
                    
                    <!-- Loading overlay -->
                    <div class="compact-loading" id="loading-overlay">
                        <div class="compact-spinner"></div>
                    </div>
                </div>
                
                ${this.options.showFloatingControls ? `
                <!-- Floating controls -->
                <div class="floating-controls">
                    <div class="floating-button" id="search-button" data-panel="search-panel">
                        <i class="ph-fill ph-magnifying-glass"></i>
                        <span class="tooltip">Search Cryptocurrencies</span>
                    </div>
                    <div class="floating-button" id="favorites-button" data-panel="favorites-panel">
                        <i class="ph-fill ph-star"></i>
                        <span class="tooltip">Favorites</span>
                    </div>
                    <div class="floating-button" id="settings-button" data-panel="settings-panel">
                        <i class="ph-fill ph-gear"></i>
                        <span class="tooltip">Settings</span>
                    </div>
                    <div class="floating-button" id="wallet-button" data-panel="wallet-panel">
                        <i class="ph-fill ph-wallet"></i>
                        <span class="tooltip">Wallet</span>
                    </div>
                </div>
                ` : ''}
                
                <!-- Expandable panels -->
                <!-- Search panel -->
                <div class="crypto-expand-panel" id="search-panel">
                    <div class="panel-header">
                        <div class="panel-title">
                            <i class="ph-fill ph-magnifying-glass"></i> Search Cryptocurrencies
                        </div>
                        <button class="panel-close" data-panel="search-panel">
                            <i class="ph-fill ph-x"></i>
                        </button>
                    </div>
                    <div class="search-panel-content">
                        <div class="search-input-container">
                            <input type="text" class="search-input" id="crypto-search-input" placeholder="Search by name or symbol...">
                            <button class="search-button" id="crypto-search-button">
                                <i class="ph-fill ph-magnifying-glass"></i>
                            </button>
                        </div>
                        <div class="search-results" id="search-results">
                            <!-- Search results will be populated here -->
                        </div>
                    </div>
                </div>
                
                <!-- Favorites panel -->
                <div class="crypto-expand-panel" id="favorites-panel">
                    <div class="panel-header">
                        <div class="panel-title">
                            <i class="ph-fill ph-star"></i> Your Favorites
                        </div>
                        <button class="panel-close" data-panel="favorites-panel">
                            <i class="ph-fill ph-x"></i>
                        </button>
                    </div>
                    <div class="favorites-panel-content">
                        <div class="favorites-list" id="favorites-list">
                            <!-- Favorites will be populated here -->
                        </div>
                    </div>
                </div>
                
                <!-- Settings panel -->
                <div class="crypto-expand-panel" id="settings-panel">
                    <div class="panel-header">
                        <div class="panel-title">
                            <i class="ph-fill ph-gear"></i> Settings
                        </div>
                        <button class="panel-close" data-panel="settings-panel">
                            <i class="ph-fill ph-x"></i>
                        </button>
                    </div>
                    <div class="settings-panel-content">
                        <div class="settings-group">
                            <label class="settings-group-title">Currency</label>
                            <div class="settings-options" id="currency-options">
                                <div class="settings-option active" data-value="usd">USD ($)</div>
                                <div class="settings-option" data-value="eur">EUR (€)</div>
                                <div class="settings-option" data-value="gbp">GBP (£)</div>
                                <div class="settings-option" data-value="jpy">JPY (¥)</div>
                            </div>
                        </div>
                        <div class="settings-group">
                            <label class="settings-group-title">Update Interval</label>
                            <div class="settings-options" id="interval-options">
                                <div class="settings-option" data-value="1000">1 second</div>
                                <div class="settings-option" data-value="5000">5 seconds</div>
                                <div class="settings-option" data-value="10000">10 seconds</div>
                                <div class="settings-option" data-value="30000">30 seconds</div>
                                <div class="settings-option active" data-value="60000">1 minute</div>
                                <div class="settings-option" data-value="300000">5 minutes</div>
                                <div class="settings-option" data-value="600000">10 minutes</div>
                                <div class="settings-option" data-value="manual">Manual</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Wallet panel -->
                <div class="crypto-expand-panel" id="wallet-panel">
                    <div class="panel-header">
                        <div class="panel-title">
                            <i class="ph-fill ph-wallet"></i> Wallet
                        </div>
                        <button class="panel-close" data-panel="wallet-panel">
                            <i class="ph-fill ph-x"></i>
                        </button>
                    </div>
                    <div class="wallet-panel-content">
                        <div class="settings-group"> <!-- Re-using settings-group style for consistency -->
                            <label class="settings-group-title">Your Static Wallet Address</label>
                            <div class="wallet-address-container">
                                <span class="wallet-address" id="static-wallet-address">YOUR_STATIC_WALLET_ADDRESS_HERE</span>
                                <button class="copy-wallet-button" id="copy-wallet-button" title="Copy Address">
                                    <i class="ph ph-copy"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Set up event listeners for all interactive elements
     */
    setupEventListeners() {
        // Buy button
        const buyButton = this.container.querySelector('#buy-button');
        if (buyButton) {
            buyButton.addEventListener('click', () => {
                alert(`Buy ${this.currentCoin.toUpperCase()} feature coming soon!`);
            });
        }
        
        // Sell button
        const sellButton = this.container.querySelector('#sell-button');
        if (sellButton) {
            sellButton.addEventListener('click', () => {
                alert(`Sell ${this.currentCoin.toUpperCase()} feature coming soon!`);
            });
        }
        
        // Floating control buttons
        const floatingButtons = this.container.querySelectorAll('.floating-button');
        floatingButtons.forEach(button => {
            button.addEventListener('click', () => {
                const panelId = button.dataset.panel;
                this.togglePanel(panelId);
                
                // Toggle active state on button
                floatingButtons.forEach(btn => {
                    if (btn !== button) { // Deactivate other buttons
                       btn.classList.remove('active');
                    }
                });
                button.classList.toggle('active'); // Toggle the clicked button
            });
        });
        
        // Panel close buttons
        const closeButtons = this.container.querySelectorAll('.panel-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const panelId = button.dataset.panel;
                this.hidePanel(panelId);
                
                // Remove active state from corresponding floating button
                const floatingButton = this.container.querySelector(`.floating-button[data-panel="${panelId}"]`);
                if (floatingButton) {
                    floatingButton.classList.remove('active');
                }
            });
        });
        
        // Search functionality
        const searchButton = this.container.querySelector('#crypto-search-button');
        const searchInput = this.container.querySelector('#crypto-search-input');
        
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', () => {
                this.searchCryptocurrencies(searchInput.value);
            });
            
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.searchCryptocurrencies(searchInput.value);
                }
            });
        }
        
        // Currency options
        const currencyOptions = this.container.querySelectorAll('#currency-options .settings-option');
        currencyOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Update active state
                currencyOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Update currency
                this.currentCurrency = option.dataset.value;
                this.loadCoinData();
            });
        });
        
        // Interval options
        const intervalOptions = this.container.querySelectorAll('#interval-options .settings-option');
        intervalOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Update active state
                intervalOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Update interval
                const interval = option.dataset.value;
                this.updateRefreshInterval(interval);
            });
        });

        // Copy Wallet Address button
        const copyWalletButton = this.container.querySelector('#copy-wallet-button');
        const walletAddressSpan = this.container.querySelector('#static-wallet-address');
        if (copyWalletButton && walletAddressSpan) {
            copyWalletButton.addEventListener('click', () => {
                const address = walletAddressSpan.textContent;
                navigator.clipboard.writeText(address).then(() => {
                    // Optional: Show a temporary confirmation message
                    const originalIcon = copyWalletButton.innerHTML;
                    copyWalletButton.innerHTML = '<i class="ph ph-check"></i>';
                    setTimeout(() => {
                        copyWalletButton.innerHTML = originalIcon;
                    }, 1500);
                }).catch(err => {
                    console.error('Failed to copy wallet address: ', err);
                    alert('Failed to copy address.'); // Fallback message
                });
            });
        }
    }
    
    /**
     * Toggle visibility of an expandable panel
     */
    togglePanel(panelId) {
        const panel = this.container.querySelector(`#${panelId}`);
        if (!panel) return;
        
        const isActive = panel.classList.contains('active');

        // Hide all panels first
        const allPanels = this.container.querySelectorAll('.crypto-expand-panel');
        allPanels.forEach(p => {
            p.classList.remove('active');
        });
        
        // If the clicked panel wasn't active, show it
        if (!isActive) {
            panel.classList.add('active');
        }
        // If it was active, it's now hidden by the loop above
        
        // If opening the favorites panel, update favorites list
        if (panelId === 'favorites-panel' && panel.classList.contains('active')) {
            this.updateFavoritesList();
        }
    }
    
    /**
     * Hide a specific panel
     */
    hidePanel(panelId) {
        const panel = this.container.querySelector(`#${panelId}`);
        if (panel) {
            panel.classList.remove('active');
        }
    }
      /**
     * Update the auto-refresh interval
     */
    updateRefreshInterval(interval) {
        // Clear existing interval
        if (this.activeInterval) {
            clearInterval(this.activeInterval);
            this.activeInterval = null;
        }
        
        // Set new interval if not manual
        if (interval !== 'manual') {
            const intervalMs = parseInt(interval, 10);
            this.updateInterval = intervalMs;
            
            // Update the service worker interval if available
            if (window.cryptoServiceWorker) {
                window.cryptoServiceWorker.updateInterval(intervalMs);
            }
            
            this.startAutoRefresh();
        }
    }
    
    /**
     * Start auto-refresh interval
     */
    startAutoRefresh() {
        if (this.activeInterval) {
            clearInterval(this.activeInterval);
        }
        
        this.activeInterval = setInterval(() => {
            this.loadCoinData();
        }, this.updateInterval);
        
        // Start background updates via service worker if available
        if (window.cryptoServiceWorker) {
            window.cryptoServiceWorker.startBackgroundUpdates([this.currentCoin], this.updateInterval);
        }
    }
    
    /**
     * Load data for current coin
     */
    async loadCoinData() {
        this.showLoading(true);
        
        try {
            const response = await fetch(
                `${this.apiBase}/coins/${this.currentCoin}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
            );
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.updateWidgetWithData(data);
            this.showLoading(false);
        } catch (error) {
            console.error(`Error fetching coin data:`, error);
            this.showLoading(false);
        }
    }
    
    /**
     * Update widget with fetched data
     */
    updateWidgetWithData(data) {
        const currency = this.currentCurrency;
        const currencySymbol = this.getCurrencySymbol(currency);
        
        // Update coin info
        const coinIcon = this.container.querySelector('#coin-icon');
        const coinName = this.container.querySelector('#coin-name');
        const coinSymbol = this.container.querySelector('#coin-symbol');
        const coinRank = this.container.querySelector('#coin-rank');
        
        if (coinIcon) coinIcon.src = data.image?.thumb || '';
        if (coinIcon) coinIcon.alt = data.name;
        if (coinName) coinName.textContent = data.name;
        if (coinSymbol) coinSymbol.textContent = data.symbol.toUpperCase();
        if (coinRank) coinRank.textContent = `#${data.market_cap_rank || '-'}`;
        
        // Update price info
        const currentPrice = this.container.querySelector('#current-price');
        const priceChange = this.container.querySelector('#price-change');
        const changeValue = this.container.querySelector('#change-value');
        const changeIcon = this.container.querySelector('#change-icon');
        
        const price = data.market_data.current_price[currency] || 0;
        const priceChange24h = data.market_data.price_change_percentage_24h || 0;
        
        if (currentPrice) currentPrice.textContent = `${currencySymbol}${this.formatNumber(price)}`;
        
        if (priceChange && changeValue && changeIcon) {
            // Update price change class
            priceChange.className = `compact-price-change ${priceChange24h >= 0 ? 'positive' : 'negative'}`;
            
            // Update change value
            changeValue.textContent = `${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`;
            
            // Update icon
            changeIcon.className = `ph-fill ${priceChange24h >= 0 ? 'ph-trend-up' : 'ph-trend-down'}`;
        }
        
        // Update stats
        const volume = this.container.querySelector('#volume');
        const marketCap = this.container.querySelector('#market-cap');
        const high24h = this.container.querySelector('#high-24h');
        const low24h = this.container.querySelector('#low-24h');
        
        if (volume) volume.textContent = `${currencySymbol}${this.formatCompactNumber(data.market_data.total_volume[currency] || 0)}`;
        if (marketCap) marketCap.textContent = `${currencySymbol}${this.formatCompactNumber(data.market_data.market_cap[currency] || 0)}`;
        if (high24h) high24h.textContent = `${currencySymbol}${this.formatNumber(data.market_data.high_24h[currency] || 0)}`;
        if (low24h) low24h.textContent = `${currencySymbol}${this.formatNumber(data.market_data.low_24h[currency] || 0)}`;
    }
    
    /**
     * Show or hide loading overlay
     */
    showLoading(show) {
        const loadingOverlay = this.container.querySelector('#loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.toggle('active', show);
        }
    }
    
    /**
     * Search for cryptocurrencies
     */
    async searchCryptocurrencies(query) {
        if (!query || query.trim() === '') {
            return;
        }
        
        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.apiBase}/search?query=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.displaySearchResults(data.coins.slice(0, 15)); // Limit to top 15 results
            this.showLoading(false);
        } catch (error) {
            console.error('Error searching cryptocurrencies:', error);
            this.showLoading(false);
        }
    }
    
    /**
     * Display search results
     */
    displaySearchResults(results) {
        const resultsContainer = this.container.querySelector('#search-results');
        if (!resultsContainer) return;
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-favorites">
                    <i class="ph-fill ph-magnifying-glass"></i>
                    <p>No results found</p>
                </div>
            `;
            return;
        }
        
        let resultsHTML = '';
        
        results.forEach(coin => {
            resultsHTML += `
                <div class="search-result-item" data-id="${coin.id}">
                    <img src="${coin.thumb}" alt="${coin.name}" class="search-result-icon">
                    <div class="search-result-info">
                        <div class="search-result-name">${coin.name}</div>
                        <div class="search-result-symbol">${coin.symbol.toUpperCase()}</div>
                    </div>
                    <div class="search-result-rank">${coin.market_cap_rank ? '#' + coin.market_cap_rank : ''}</div>
                </div>
            `;
        });
        
        resultsContainer.innerHTML = resultsHTML;
        
        // Add click event to results
        const resultItems = resultsContainer.querySelectorAll('.search-result-item');
        resultItems.forEach(item => {
            item.addEventListener('click', () => {
                const coinId = item.dataset.id;
                this.selectCoin(coinId);
                this.hidePanel('search-panel');
                
                // Remove active state from search button
                const searchButton = this.container.querySelector('#search-button');
                if (searchButton) {
                    searchButton.classList.remove('active');
                }
            });
        });
    }
    
    /**
     * Select a coin to display
     */
    selectCoin(coinId) {
        this.currentCoin = coinId;
        this.loadCoinData();
    }
    
    /**
     * Update favorites list in the panel
     */
    updateFavoritesList() {
        const favoritesContainer = this.container.querySelector('#favorites-list');
        if (!favoritesContainer) return;
        
        if (this.favorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="no-favorites">
                    <i class="ph-fill ph-star"></i>
                    <p>No favorites yet</p>
                    <p>Search for coins and add them to favorites</p>
                </div>
            `;
            return;
        }
        
        // Show loading
        this.showLoading(true);
        
        // Fetch data for all favorites
        Promise.all(
            this.favorites.map(coinId => 
                fetch(`${this.apiBase}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`)
                .then(response => response.json())
                .catch(() => null)
            )
        ).then(results => {
            const validResults = results.filter(result => result !== null);
            
            if (validResults.length === 0) {
                favoritesContainer.innerHTML = `
                    <div class="no-favorites">
                        <i class="ph-fill ph-star"></i>
                        <p>Could not load favorites</p>
                        <p>Please try again later</p>
                    </div>
                `;
                this.showLoading(false);
                return;
            }
            
            let favoritesHTML = '';
            const currency = this.currentCurrency;
            const currencySymbol = this.getCurrencySymbol(currency);
            
            validResults.forEach(coin => {
                const price = coin.market_data.current_price[currency] || 0;
                const priceChange24h = coin.market_data.price_change_percentage_24h || 0;
                
                favoritesHTML += `
                    <div class="favorite-item" data-id="${coin.id}">
                        <img src="${coin.image.thumb}" alt="${coin.name}" class="favorite-icon">
                        <div class="favorite-info">
                            <div class="favorite-name">${coin.name}</div>
                            <div class="favorite-symbol">${coin.symbol.toUpperCase()}</div>
                        </div>
                        <div class="favorite-price">
                            <div class="favorite-current-price">${currencySymbol}${this.formatNumber(price)}</div>
                            <div class="favorite-price-change ${priceChange24h >= 0 ? 'positive' : 'negative'}">
                                ${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                `;
            });
            
            favoritesContainer.innerHTML = favoritesHTML;
            
            // Add click event to favorites
            const favoriteItems = favoritesContainer.querySelectorAll('.favorite-item');
            favoriteItems.forEach(item => {
                item.addEventListener('click', () => {
                    const coinId = item.dataset.id;
                    this.selectCoin(coinId);
                    this.hidePanel('favorites-panel');
                    
                    // Remove active state from favorites button
                    const favoritesButton = this.container.querySelector('#favorites-button');
                    if (favoritesButton) {
                        favoritesButton.classList.remove('active');
                    }
                });
            });
            
            this.showLoading(false);
        }).catch(error => {
            console.error('Error loading favorites:', error);
            this.showLoading(false);
        });
    }
    
    /**
     * Toggle favorite status for a coin
     */
    toggleFavorite(coinId) {
        const index = this.favorites.indexOf(coinId);
        
        if (index !== -1) {
            // Remove from favorites
            this.favorites.splice(index, 1);
        } else {
            // Add to favorites
            this.favorites.push(coinId);
        }
        
        // Save to localStorage
        this.saveFavoritesToStorage();
    }
    
    /**
     * Get favorites from localStorage
     */
    getFavoritesFromStorage() {
        const favorites = localStorage.getItem('compactCryptoFavorites');
        return favorites ? JSON.parse(favorites) : [];
    }
    
    /**
     * Save favorites to localStorage
     */
    saveFavoritesToStorage() {
        localStorage.setItem('compactCryptoFavorites', JSON.stringify(this.favorites));
    }
    
    /**
     * Format number with appropriate precision
     */
    formatNumber(num) {
        if (num === undefined || num === null) return '0';
        
        // For small numbers, show more decimals
        if (num < 1) {
            return num.toFixed(6);
        }
        
        // For medium numbers
        if (num < 1000) {
            return num.toFixed(2);
        }
        
        // For large numbers use Number format
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2
        }).format(num);
    }
    
    /**
     * Format number with K, M, B, T suffixes
     */
    formatCompactNumber(num) {
        if (num === undefined || num === null) return '0';
        
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        
        return num.toFixed(2);
    }
    
    /**
     * Get currency symbol based on currency code
     */
    getCurrencySymbol(currency) {
        return this.currencies[currency]?.symbol || currency.toUpperCase() + ' ';
    }
    
    /**
     * Clean up resources when destroying the widget
     */
    destroy() {
        if (this.activeInterval) {
            clearInterval(this.activeInterval);
        }
    }
}

// Create global instance
window.compactCryptoWidget = new CompactCryptoWidget();