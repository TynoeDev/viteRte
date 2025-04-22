/**
 * Crypto Handler - Handles data fetching and display for cryptocurrency widgets
 * Supports Bitcoin, Ethereum, and Solana
 */

class CryptoHandler {
    constructor() {
        this.apiBase = 'https://api.coingecko.com/api/v3';
        this.updateInterval = 60000; // 1 minute update interval (adjust based on API rate limits)
        this.activeUpdates = {}; // Tracks active interval updates

        // Mapping for coin IDs and symbols
        this.coins = {
            'bitcoin': { symbol: 'BTC', color: '#f7931a' },
            'ethereum': { symbol: 'ETH', color: '#627eea' },
            'solana': { symbol: 'SOL', color: '#00ffbd' }
        };
    }

    /**
     * Initializes a cryptocurrency widget
     * @param {string} coinId - The CoinGecko ID for the cryptocurrency (bitcoin, ethereum, solana)
     * @param {string} containerId - The container element ID where the widget should be rendered
     * @param {object} options - Additional options for the widget
     */
    initCryptoWidget(coinId, containerId, options = {}) {
        if (!this.coins[coinId]) {
            console.error(`Unsupported coin: ${coinId}`);
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container not found: ${containerId}`);
            return;
        }

        // Create DOM structure if it doesn't exist
        if (container.children.length === 0) {
            this.createWidgetDOM(coinId, container, options);
        }

        // Fetch initial data
        this.fetchCryptoData(coinId, containerId);

        // Set up interval for updates if needed
        if (options.autoUpdate !== false) {
            this.activeUpdates[containerId] = setInterval(() => {
                this.fetchCryptoData(coinId, containerId);
            }, this.updateInterval);
        }
    }

    /**
     * Creates the DOM structure for a crypto widget
     */
    createWidgetDOM(coinId, container, options) {
            const coinInfo = this.coins[coinId];
            const coinName = coinId.charAt(0).toUpperCase() + coinId.slice(1);

            // Create widget with glassmorphism styling
            container.innerHTML = `
            <div class="glass-widget crypto-widget ${options.compact ? 'compact' : ''}">
                <div class="widget-header">
                    <img src="assets/images/coin-${coinId}.png" onerror="this.src='assets/images/coin.png'" alt="${coinName}" class="crypto-icon">
                    <h3>${coinName} <span class="currency-code">${coinInfo.symbol}</span></h3>
                    <div class="widget-badges">
                        <span class="badge rank-badge" id="${coinId}-rank">#--</span>
                        <span class="badge" id="${coinId}-trend">--</span>
                    </div>
                </div>
                <div class="widget-body">
                    <div class="price-container">
                        <span class="current-price" id="${coinId}-price">Loading...</span>
                        <span class="price-change" id="${coinId}-change">--</span>
                    </div>
                    <div class="widget-mini-chart" id="${coinId}-mini-chart">
                        <div class="chart-placeholder"></div>
                    </div>
                    <div class="widget-stats">
                        <div class="stat-row">
                            <div class="stat-item">
                                <span class="stat-label">24h Vol</span>
                                <span class="stat-value" id="${coinId}-volume">--</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">ATH</span>
                                <span class="stat-value" id="${coinId}-ath">--</span>
                            </div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-item">
                                <span class="stat-label">Market Cap</span>
                                <span class="stat-value" id="${coinId}-market-cap">--</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Supply</span>
                                <span class="stat-value" id="${coinId}-supply">--</span>
                            </div>
                        </div>
                    </div>
                    ${options.showActions !== false ? `
                    <div class="widget-actions">
                        <button class="btn-buy" data-coin="${coinId}">Buy</button>
                        <button class="btn-sell" data-coin="${coinId}">Sell</button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add event listeners for buy/sell buttons
        const buyButton = container.querySelector('.btn-buy');
        const sellButton = container.querySelector('.btn-sell');
        
        if (buyButton) {
            buyButton.addEventListener('click', () => this.handleBuyAction(coinId));
        }
        
        if (sellButton) {
            sellButton.addEventListener('click', () => this.handleSellAction(coinId));
        }
    }

    /**
     * Fetches cryptocurrency data from CoinGecko API
     */
    async fetchCryptoData(coinId, containerId) {
        try {
            const response = await fetch(`${this.apiBase}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`);
            const data = await response.json();
            
            this.updateWidgetWithData(coinId, data, containerId);
        } catch (error) {
            console.error(`Error fetching ${coinId} data:`, error);
            document.getElementById(`${coinId}-price`).textContent = 'API Error';
        }
    }

    /**
     * Updates the widget with fetched cryptocurrency data
     */
    updateWidgetWithData(coinId, data, containerId) {
        const price = data.market_data.current_price.usd;
        const priceChange24h = data.market_data.price_change_percentage_24h;
        const volume = data.market_data.total_volume.usd;
        const marketCap = data.market_data.market_cap.usd;
        const ath = data.market_data.ath.usd;
        const circulatingSupply = data.market_data.circulating_supply;
        
        // Set market rank
        const rankElement = document.getElementById(`${coinId}-rank`);
        if (rankElement) rankElement.textContent = '#' + data.market_cap_rank;

        // Update price
        const priceElement = document.getElementById(`${coinId}-price`);
        if (priceElement) priceElement.textContent = this.formatCurrency(price);

        // Update price change
        const changeElement = document.getElementById(`${coinId}-change`);
        if (changeElement) {
            changeElement.textContent = priceChange24h.toFixed(2) + '%';

            if (priceChange24h > 0) {
                changeElement.className = 'price-change positive';
                changeElement.textContent = '+' + changeElement.textContent;
            } else if (priceChange24h < 0) {
                changeElement.className = 'price-change negative';
            }
        }

        // Update trend indicator
        this.setTrendBadge(coinId, priceChange24h);

        // Update standard stats
        const volumeElement = document.getElementById(`${coinId}-volume`);
        if (volumeElement) volumeElement.textContent = this.formatNumber(volume);
        
        const marketCapElement = document.getElementById(`${coinId}-market-cap`);
        if (marketCapElement) marketCapElement.textContent = this.formatNumber(marketCap);

        // Update additional stats if available
        const athElement = document.getElementById(`${coinId}-ath`);
        if (athElement) athElement.textContent = this.formatCurrency(ath);
        
        const supplyElement = document.getElementById(`${coinId}-supply`);
        if (supplyElement) supplyElement.textContent = this.formatNumber(circulatingSupply);
    }

    /**
     * Sets the trend badge color and text based on price change
     */
    setTrendBadge(coinId, priceChange) {
        const trendBadge = document.getElementById(`${coinId}-trend`);
        if (!trendBadge) return;
        
        if (priceChange > 3) {
            trendBadge.textContent = 'Bullish';
            trendBadge.style.background = 'rgba(46, 213, 115, 0.3)';
            trendBadge.style.color = '#2ed573';
        } else if (priceChange > 0) {
            trendBadge.textContent = 'Positive';
            trendBadge.style.background = 'rgba(46, 213, 115, 0.2)';
            trendBadge.style.color = '#2ed573';
        } else if (priceChange > -3) {
            trendBadge.textContent = 'Neutral';
            trendBadge.style.background = 'rgba(255, 255, 255, 0.15)';
            trendBadge.style.color = '#ffffff';
        } else {
            trendBadge.textContent = 'Bearish';
            trendBadge.style.background = 'rgba(255, 71, 87, 0.3)';
            trendBadge.style.color = '#ff4757';
        }
    }

    /**
     * Formats large numbers with commas and abbreviations
     */
    formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(2);
    }

    /**
     * Formats currency values
     */
    formatCurrency(num) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2
        }).format(num);
    }

    /**
     * Handle the buy action
     */
    handleBuyAction(coinId) {
        const coinSymbol = this.coins[coinId].symbol;
        alert(`Buy ${coinSymbol} feature coming soon! This would connect to an exchange API.`);
    }

    /**
     * Handle the sell action
     */
    handleSellAction(coinId) {
        const coinSymbol = this.coins[coinId].symbol;
        alert(`Sell ${coinSymbol} feature coming soon! This would connect to an exchange API.`);
    }

    /**
     * Stops all active updates for widgets
     */
    stopAllUpdates() {
        Object.values(this.activeUpdates).forEach(interval => {
            clearInterval(interval);
        });
        this.activeUpdates = {};
    }

    /**
     * Stops updates for a specific widget
     */
    stopUpdate(containerId) {
        if (this.activeUpdates[containerId]) {
            clearInterval(this.activeUpdates[containerId]);
            delete this.activeUpdates[containerId];
        }
    }
}

// Create a global instance of the CryptoHandler for easier access
// Using window.cryptoHandler to ensure it's accessible globally
window.cryptoHandler = new CryptoHandler();