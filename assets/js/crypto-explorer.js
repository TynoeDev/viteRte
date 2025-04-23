/**
 * Unified Crypto Explorer
 * A combined widget for cryptocurrency data and search functionality
 * with glassmorphism styling
 */

class CryptoExplorer {
    constructor() {
        this.apiBase = 'https://api.coingecko.com/api/v3';
        this.updateInterval = 60000; // 1 minute update interval
        this.activeCoins = {}; // Tracks active coins being displayed
        this.activeCoin = null; // Currently selected coin for detailed view
        this.searchResults = []; // Stores search results
        this.intervals = {}; // Tracks active interval updates

        // Top cryptocurrencies for quick access
        this.featuredCoins = [
            { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', color: '#f7931a', icon: 'assets/images/coin.png' },
            { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', color: '#627eea', icon: 'assets/images/eth-icon.png' },
            { id: 'solana', symbol: 'SOL', name: 'Solana', color: '#00ffbd', icon: 'assets/images/sol-icon.png' },
            { id: 'cardano', symbol: 'ADA', name: 'Cardano', color: '#0033ad', icon: 'assets/images/ada-icon.png' },
            { id: 'binancecoin', symbol: 'BNB', name: 'Binance Coin', color: '#f3ba2f', icon: 'assets/images/bnb-icon.png' },
            { id: 'ripple', symbol: 'XRP', name: 'XRP', color: '#23292f', icon: 'assets/images/xrp-icon.png' }
        ];

        // List of searched/viewed coins history
        this.recentCoins = [];

        // Default view mode - can be 'grid', 'list', or 'detail'
        this.viewMode = 'grid';
    }

    /**
     * Initializes the crypto explorer
     * @param {string} containerId - ID of the container element
     * @param {Object} options - Configuration options
     */
    initExplorer(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container not found: ${containerId}`);
            return;
        }

        // Store options
        this.options = Object.assign({
            defaultCoins: ['bitcoin', 'ethereum', 'solana'],
            maxRecentCoins: 5,
            initialView: 'grid',
            autoRefresh: true,
            theme: 'dark',
            showSearch: true,
            showFilters: true
        }, options);

        // Set initial view mode
        this.viewMode = this.options.initialView;

        // Create explorer DOM
        this.createExplorerDOM();

        // Set up event listeners
        this.setupEventListeners();

        // Load default coins
        this.loadDefaultCoins();
    }

    /**
     * Creates the main DOM structure for the crypto explorer
     */
    createExplorerDOM() {
            this.container.innerHTML = `
            <div class="crypto-explorer glass-effect ${this.options.theme}">
                <div class="explorer-header">
                    <div class="explorer-title">
                        <i class="explorer-icon ph-fill ph-chart-line-up"></i>
                        <h3>Crypto Explorer</h3>
                    </div>
                    
                    ${this.options.showSearch ? `
                    <div class="explorer-search">
                        <div class="search-input-wrapper">
                            <i class="search-icon ph-fill ph-magnifying-glass"></i>
                            <input type="text" id="crypto-search" placeholder="Search cryptocurrencies..." class="glass-input">
                            <button id="search-button" class="glass-button">
                                <i class="ph-fill ph-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="explorer-tabs">
                    <button class="tab-button active" data-view="grid">
                        <i class="ph-fill ph-grid-four"></i> Grid
                    </button>
                    <button class="tab-button" data-view="list">
                        <i class="ph-fill ph-list-bullets"></i> List
                    </button>
                    <button class="tab-button" data-view="favorites">
                        <i class="ph-fill ph-star"></i> Favorites
                    </button>
                </div>
                
                ${this.options.showFilters ? `
                <div class="explorer-filters">
                    <div class="filter-dropdown">
                        <select id="sort-filter" class="glass-select">
                            <option value="market_cap_desc">Market Cap (High to Low)</option>
                            <option value="market_cap_asc">Market Cap (Low to High)</option>
                            <option value="volume_desc">Volume (High to Low)</option>
                            <option value="volume_asc">Volume (Low to High)</option>
                            <option value="id_asc">Name (A to Z)</option>
                            <option value="id_desc">Name (Z to A)</option>
                        </select>
                    </div>
                    
                    <div class="filter-dropdown">
                        <select id="currency-filter" class="glass-select">
                            <option value="usd">USD</option>
                            <option value="eur">EUR</option>
                            <option value="gbp">GBP</option>
                            <option value="jpy">JPY</option>
                            <option value="btc">BTC</option>
                            <option value="eth">ETH</option>
                        </select>
                    </div>
                    
                    <div class="filter-dropdown">
                        <select id="time-filter" class="glass-select">
                            <option value="30m">30 Min</option>
                            <option value="1h">1 Hour</option>
                            <option value="3h">3 Hours</option>
                            <option value="6h">6 Hours</option>
                            <option value="12h">12 Hours</option>
                            <option value="24h">24 Hours</option>
                            <option value="7d">7 Days</option>
                            <option value="30d">30 Days</option>
                            <option value="1y">1 Year</option>
                        </select>
                    </div>
                </div>
                ` : ''}
                
                <div class="explorer-content">
                    <!-- Main content area - will be populated based on view mode -->
                    <div id="loading-indicator" class="loading-indicator">
                        <div class="spinner"></div>
                        <p>Loading cryptocurrency data...</p>
                    </div>
                    
                    <div id="grid-view" class="view-container grid-view"></div>
                    <div id="list-view" class="view-container list-view" style="display:none;"></div>
                    <div id="detail-view" class="view-container detail-view" style="display:none;"></div>
                    <div id="search-results" class="view-container search-results" style="display:none;"></div>
                    <div id="favorites-view" class="view-container favorites-view" style="display:none;"></div>
                </div>
                
                <div class="explorer-footer">
                    <div class="data-attribution">
                        Powered by <a href="https://www.coingecko.com/en/api" target="_blank">CoinGecko API</a>
                    </div>
                    <div class="refresh-info">
                        Auto-refreshes every minute 
                        <button id="manual-refresh" class="icon-button">
                            <i class="ph-fill ph-arrows-clockwise"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Set up event listeners for the explorer
     */
    setupEventListeners() {
        // Tab switching
        const tabButtons = this.container.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const view = e.target.closest('.tab-button').dataset.view;
                this.switchView(view);
            });
        });
        
        // Search functionality
        const searchInput = this.container.querySelector('#crypto-search');
        const searchButton = this.container.querySelector('#search-button');
        
        if (searchInput && searchButton) {
            searchButton.addEventListener('click', () => {
                this.searchCrypto(searchInput.value);
            });
            
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.searchCrypto(searchInput.value);
                }
            });
        }
        
        // Manual refresh
        const refreshButton = this.container.querySelector('#manual-refresh');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refreshAllData();
            });
        }
        
        // Filters
        const sortFilter = this.container.querySelector('#sort-filter');
        const currencyFilter = this.container.querySelector('#currency-filter');
        const timeFilter = this.container.querySelector('#time-filter');
        
        if (sortFilter) {
            sortFilter.addEventListener('change', () => {
                this.refreshView();
            });
        }
        
        if (currencyFilter) {
            currencyFilter.addEventListener('change', () => {
                this.refreshAllData();
            });
        }
        
        if (timeFilter) {
            timeFilter.addEventListener('change', () => {
                this.refreshAllData();
            });
        }
    }
    
    /**
     * Loads the default coins specified in options
     */
    loadDefaultCoins() {
        this.showLoading(true);
        
        // Fetch data for default coins
        const promises = this.options.defaultCoins.map(coinId => {
            return this.fetchCoinData(coinId);
        });
        
        Promise.all(promises)
            .then(results => {
                results.forEach(data => {
                    if (data) {
                        this.activeCoins[data.id] = data;
                    }
                });
                
                this.refreshView();
                this.showLoading(false);
            })
            .catch(error => {
                console.error('Error loading default coins:', error);
                this.showLoading(false);
            });
    }
    
    /**
     * Shows or hides the loading indicator
     */
    showLoading(show) {
        const loadingIndicator = this.container.querySelector('#loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'flex' : 'none';
        }
    }
    
    /**
     * Fetches data for a specific coin
     */
    async fetchCoinData(coinId) {
        try {
            const currency = this.getCurrentCurrency();
            const response = await fetch(`${this.apiBase}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data for ${coinId}:`, error);
            return null;
        }
    }
    
    /**
     * Gets the currently selected currency
     */
    getCurrentCurrency() {
        const currencyFilter = this.container.querySelector('#currency-filter');
        return currencyFilter ? currencyFilter.value : 'usd';
    }
    
    /**
     * Gets the currently selected time period
     */
    getCurrentTimePeriod() {
        const timeFilter = this.container.querySelector('#time-filter');
        return timeFilter ? timeFilter.value : '24h';
    }
    
    /**
     * Searches for cryptocurrencies matching the query
     */
    async searchCrypto(query) {
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
            this.searchResults = data.coins.slice(0, 20); // Limit to top 20 results
            
            this.showSearchResults();
            this.showLoading(false);
        } catch (error) {
            console.error('Error searching cryptocurrencies:', error);
            this.showLoading(false);
        }
    }
    
    /**
     * Displays search results
     */
    showSearchResults() {
        const resultsContainer = this.container.querySelector('#search-results');
        
        if (!resultsContainer || this.searchResults.length === 0) {
            return;
        }
        
        let resultsHTML = `
            <div class="search-results-header">
                <h4>Search Results</h4>
                <button class="close-results-button">
                    <i class="ph-fill ph-x"></i>
                </button>
            </div>
            <div class="search-results-grid">
        `;
        
        this.searchResults.forEach(coin => {
            resultsHTML += `
                <div class="search-result-item" data-id="${coin.id}">
                    <div class="result-icon">
                        <img src="${coin.thumb}" alt="${coin.name}" onerror="this.src='assets/images/coin.png'">
                    </div>
                    <div class="result-info">
                        <div class="result-name">${coin.name}</div>
                        <div class="result-symbol">${coin.symbol.toUpperCase()}</div>
                    </div>
                    <div class="result-rank">
                        <span class="rank-badge">#${coin.market_cap_rank || '-'}</span>
                    </div>
                    <div class="result-action">
                        <button class="view-coin-button glass-button-small" data-id="${coin.id}">
                            View
                        </button>
                    </div>
                </div>
            `;
        });
        
        resultsHTML += `</div>`;
        resultsContainer.innerHTML = resultsHTML;
        
        // Switch to search results view
        this.switchToView('search-results');
        
        // Add event listeners
        const closeButton = resultsContainer.querySelector('.close-results-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.switchView(this.viewMode);
            });
        }
        
        const viewButtons = resultsContainer.querySelectorAll('.view-coin-button');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const coinId = e.target.dataset.id;
                this.showCoinDetail(coinId);
            });
        });
        
        const resultItems = resultsContainer.querySelectorAll('.search-result-item');
        resultItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const coinId = item.dataset.id;
                    this.showCoinDetail(coinId);
                }
            });
        });
    }
    
    /**
     * Shows detailed information for a specific coin
     */
    async showCoinDetail(coinId) {
        this.showLoading(true);
        
        let coinData = this.activeCoins[coinId];
        
        if (!coinData) {
            coinData = await this.fetchCoinData(coinId);
            if (coinData) {
                this.activeCoins[coinId] = coinData;
            }
        }
        
        if (!coinData) {
            this.showLoading(false);
            return;
        }
        
        this.activeCoin = coinId;
        
        // Add to recent coins
        this.addToRecentCoins(coinId);
        
        const detailContainer = this.container.querySelector('#detail-view');
        const currency = this.getCurrentCurrency();
        const currencySymbol = this.getCurrencySymbol(currency);
        
        const price = coinData.market_data.current_price[currency] || 0;
        const priceChange24h = coinData.market_data.price_change_percentage_24h || 0;
        const marketCap = coinData.market_data.market_cap[currency] || 0;
        const volume = coinData.market_data.total_volume[currency] || 0;
        const low24h = coinData.market_data.low_24h[currency] || 0;
        const high24h = coinData.market_data.high_24h[currency] || 0;
        
        let detailHTML = `
            <div class="detail-back-button">
                <button class="glass-button-small back-button">
                    <i class="ph-fill ph-arrow-left"></i> Back
                </button>
            </div>
            
            <div class="coin-detail-header">
                <div class="coin-main-info">
                    <img src="${coinData.image?.large || 'assets/images/coin.png'}" alt="${coinData.name}" class="coin-large-icon">
                    <div class="coin-titles">
                        <h3>${coinData.name}</h3>
                        <span class="coin-symbol">${coinData.symbol.toUpperCase()}</span>
                    </div>
                </div>
                <div class="coin-price-info">
                    <div class="current-price">
                        ${currencySymbol}${this.formatNumber(price)}
                    </div>
                    <div class="price-change ${priceChange24h >= 0 ? 'positive' : 'negative'}">
                        ${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%
                        <i class="ph-fill ${priceChange24h >= 0 ? 'ph-trend-up' : 'ph-trend-down'}"></i>
                    </div>
                </div>
            </div>
            
            <div class="coin-detail-stats">
                <div class="stat-card">
                    <div class="stat-title">Market Cap</div>
                    <div class="stat-value">${currencySymbol}${this.formatNumberCompact(marketCap)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Volume (24h)</div>
                    <div class="stat-value">${currencySymbol}${this.formatNumberCompact(volume)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Circulating Supply</div>
                    <div class="stat-value">${this.formatNumberCompact(coinData.market_data.circulating_supply || 0)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Max Supply</div>
                    <div class="stat-value">${coinData.market_data.max_supply ? this.formatNumberCompact(coinData.market_data.max_supply) : '∞'}</div>
                </div>
            </div>
            
            <div class="coin-price-range">
                <div class="range-title">24h Range</div>
                <div class="range-bar-container">
                    <div class="range-bar">
                        <div class="range-marker" style="left: ${this.calculatePricePercentage(price, low24h, high24h)}%"></div>
                    </div>
                    <div class="range-labels">
                        <div class="range-low">${currencySymbol}${this.formatNumber(low24h)}</div>
                        <div class="range-high">${currencySymbol}${this.formatNumber(high24h)}</div>
                    </div>
                </div>
            </div>
            
            <div class="coin-action-buttons">
                <button class="action-button buy-button">
                    <i class="ph-fill ph-arrow-down"></i> Buy
                </button>
                <button class="action-button sell-button">
                    <i class="ph-fill ph-arrow-up"></i> Sell
                </button>
                <button class="action-button favorite-button" data-id="${coinId}">
                    <i class="ph-fill ph-star"></i> Add to Favorites
                </button>
            </div>
            
            <div class="coin-description">
                <h4>About ${coinData.name}</h4>
                <div class="description-content">
                    ${coinData.description?.en ? this.truncateText(this.stripHTML(coinData.description.en), 300) : 'No description available.'}
                </div>
            </div>
        `;
        
        detailContainer.innerHTML = detailHTML;
        
        // Switch to detail view
        this.switchToView('detail-view');
        
        // Add event listeners
        const backButton = detailContainer.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.switchView(this.viewMode);
            });
        }
        
        const buyButton = detailContainer.querySelector('.buy-button');
        if (buyButton) {
            buyButton.addEventListener('click', () => {
                alert(`Buy ${coinData.name} feature coming soon!`);
            });
        }
        
        const sellButton = detailContainer.querySelector('.sell-button');
        if (sellButton) {
            sellButton.addEventListener('click', () => {
                alert(`Sell ${coinData.name} feature coming soon!`);
            });
        }
        
        const favoriteButton = detailContainer.querySelector('.favorite-button');
        if (favoriteButton) {
            favoriteButton.addEventListener('click', () => {
                this.toggleFavorite(coinId);
                const isFavorite = this.isFavorite(coinId);
                favoriteButton.innerHTML = isFavorite ? 
                    '<i class="ph-fill ph-star"></i> Remove from Favorites' : 
                    '<i class="ph-fill ph-star"></i> Add to Favorites';
            });
        }
        
        this.showLoading(false);
    }
    
    /**
     * Refreshes the current view
     */
    refreshView() {
        switch (this.viewMode) {
            case 'grid':
                this.renderGridView();
                break;
            case 'list':
                this.renderListView();
                break;
            case 'favorites':
                this.renderFavoritesView();
                break;
            default:
                this.renderGridView();
        }
    }
    
    /**
     * Switches between different views
     */
    switchView(view) {
        this.viewMode = view;
        this.refreshView();
        
        // Update active tab
        const tabButtons = this.container.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.view === view);
        });
    }
    
    /**
     * Switches to a specific view container
     */
    switchToView(viewId) {
        const viewContainers = this.container.querySelectorAll('.view-container');
        viewContainers.forEach(container => {
            container.style.display = container.id === viewId ? 'block' : 'none';
        });
    }
    
    /**
     * Renders the grid view of cryptocurrencies
     */
    renderGridView() {
        const gridContainer = this.container.querySelector('#grid-view');
        
        if (!gridContainer || Object.keys(this.activeCoins).length === 0) {
            return;
        }
        
        let gridHTML = '<div class="crypto-grid">';
        
        // Get sorted coins based on filter
        const sortedCoins = this.getSortedCoins();
        const currency = this.getCurrentCurrency();
        const currencySymbol = this.getCurrencySymbol(currency);
        
        sortedCoins.forEach(coin => {
            const price = coin.market_data.current_price[currency] || 0;
            const priceChange24h = coin.market_data.price_change_percentage_24h || 0;
            
            gridHTML += `
                <div class="crypto-card" data-id="${coin.id}">
                    <div class="crypto-card-header">
                        <img src="${coin.image?.thumb || 'assets/images/coin.png'}" alt="${coin.name}" class="crypto-icon">
                        <div class="crypto-name">${coin.name}</div>
                        <div class="crypto-symbol">${coin.symbol.toUpperCase()}</div>
                    </div>
                    <div class="crypto-card-body">
                        <div class="crypto-price">${currencySymbol}${this.formatNumber(price)}</div>
                        <div class="crypto-change ${priceChange24h >= 0 ? 'positive' : 'negative'}">
                            ${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%
                        </div>
                    </div>
                    <div class="crypto-card-footer">
                        <button class="card-action-button view-button" data-id="${coin.id}">
                            View Details
                        </button>
                    </div>
                </div>
            `;
        });
        
        gridHTML += '</div>';
        gridContainer.innerHTML = gridHTML;
        
        // Switch to grid view
        this.switchToView('grid-view');
        
        // Add event listeners
        const viewButtons = gridContainer.querySelectorAll('.view-button');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const coinId = e.target.dataset.id;
                this.showCoinDetail(coinId);
            });
        });
        
        const cryptoCards = gridContainer.querySelectorAll('.crypto-card');
        cryptoCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const coinId = card.dataset.id;
                    this.showCoinDetail(coinId);
                }
            });
        });
    }
    
    /**
     * Renders the list view of cryptocurrencies
     */
    renderListView() {
        const listContainer = this.container.querySelector('#list-view');
        
        if (!listContainer || Object.keys(this.activeCoins).length === 0) {
            return;
        }
        
        let listHTML = `
            <table class="crypto-list-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Coin</th>
                        <th>Price</th>
                        <th>24h Change</th>
                        <th>Market Cap</th>
                        <th>Volume (24h)</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Get sorted coins based on filter
        const sortedCoins = this.getSortedCoins();
        const currency = this.getCurrentCurrency();
        const currencySymbol = this.getCurrencySymbol(currency);
        
        sortedCoins.forEach(coin => {
            const price = coin.market_data.current_price[currency] || 0;
            const priceChange24h = coin.market_data.price_change_percentage_24h || 0;
            const marketCap = coin.market_data.market_cap[currency] || 0;
            const volume = coin.market_data.total_volume[currency] || 0;
            
            listHTML += `
                <tr data-id="${coin.id}">
                    <td>${coin.market_data.market_cap_rank || '-'}</td>
                    <td>
                        <div class="coin-cell">
                            <img src="${coin.image?.thumb || 'assets/images/coin.png'}" alt="${coin.name}" class="list-crypto-icon">
                            <div class="coin-cell-info">
                                <div class="coin-cell-name">${coin.name}</div>
                                <div class="coin-cell-symbol">${coin.symbol.toUpperCase()}</div>
                            </div>
                        </div>
                    </td>
                    <td>${currencySymbol}${this.formatNumber(price)}</td>
                    <td class="${priceChange24h >= 0 ? 'positive' : 'negative'}">
                        ${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%
                    </td>
                    <td>${currencySymbol}${this.formatNumberCompact(marketCap)}</td>
                    <td>${currencySymbol}${this.formatNumberCompact(volume)}</td>
                    <td>
                        <button class="table-action-button" data-id="${coin.id}">
                            View
                        </button>
                    </td>
                </tr>
            `;
        });
        
        listHTML += `
                </tbody>
            </table>
        `;
        
        listContainer.innerHTML = listHTML;
        
        // Switch to list view
        this.switchToView('list-view');
        
        // Add event listeners
        const viewButtons = listContainer.querySelectorAll('.table-action-button');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const coinId = e.target.dataset.id;
                this.showCoinDetail(coinId);
            });
        });
        
        const tableRows = listContainer.querySelectorAll('tbody tr');
        tableRows.forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const coinId = row.dataset.id;
                    this.showCoinDetail(coinId);
                }
            });
        });
    }
    
    /**
     * Renders the favorites view
     */
    renderFavoritesView() {
        const favoritesContainer = this.container.querySelector('#favorites-view');
        
        if (!favoritesContainer) {
            return;
        }
        
        const favorites = this.getFavorites();
        
        if (favorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="ph-fill ph-star"></i>
                    <p>No favorites yet</p>
                    <p class="subtext">Add coins to your favorites to see them here</p>
                </div>
            `;
            
            this.switchToView('favorites-view');
            return;
        }
        
        // Filter active coins to only include favorites
        const favoriteCoins = Object.values(this.activeCoins).filter(coin => 
            favorites.includes(coin.id)
        );
        
        // If we don't have data for some favorites, fetch them
        const missingFavorites = favorites.filter(id => !this.activeCoins[id]);
        
        if (missingFavorites.length > 0) {
            this.showLoading(true);
            
            const promises = missingFavorites.map(coinId => {
                return this.fetchCoinData(coinId);
            });
            
            Promise.all(promises)
                .then(results => {
                    results.forEach(data => {
                        if (data) {
                            this.activeCoins[data.id] = data;
                            favoriteCoins.push(data);
                        }
                    });
                    
                    this.renderFavoritesList(favoriteCoins);
                    this.showLoading(false);
                })
                .catch(error => {
                    console.error('Error loading favorite coins:', error);
                    this.renderFavoritesList(favoriteCoins);
                    this.showLoading(false);
                });
        } else {
            this.renderFavoritesList(favoriteCoins);
        }
    }
    
    /**
     * Renders the favorites list with provided coin data
     */
    renderFavoritesList(favoriteCoins) {
        const favoritesContainer = this.container.querySelector('#favorites-view');
        
        if (!favoritesContainer) {
            return;
        }
        
        let favoritesHTML = `
            <div class="favorites-header">
                <h4>Your Favorite Cryptocurrencies</h4>
            </div>
            <div class="favorites-grid">
        `;
        
        const currency = this.getCurrentCurrency();
        const currencySymbol = this.getCurrencySymbol(currency);
        
        favoriteCoins.forEach(coin => {
            const price = coin.market_data.current_price[currency] || 0;
            const priceChange24h = coin.market_data.price_change_percentage_24h || 0;
            
            favoritesHTML += `
                <div class="favorite-item" data-id="${coin.id}">
                    <div class="favorite-icon">
                        <img src="${coin.image?.thumb || 'assets/images/coin.png'}" alt="${coin.name}">
                    </div>
                    <div class="favorite-info">
                        <div class="favorite-name">${coin.name}</div>
                        <div class="favorite-symbol">${coin.symbol.toUpperCase()}</div>
                    </div>
                    <div class="favorite-price">
                        <div class="price-value">${currencySymbol}${this.formatNumber(price)}</div>
                        <div class="price-change ${priceChange24h >= 0 ? 'positive' : 'negative'}">
                            ${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%
                        </div>
                    </div>
                    <div class="favorite-actions">
                        <button class="view-favorite-button glass-button-small" data-id="${coin.id}">
                            View
                        </button>
                        <button class="remove-favorite-button glass-button-small" data-id="${coin.id}">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        });
        
        favoritesHTML += `</div>`;
        favoritesContainer.innerHTML = favoritesHTML;
        
        // Switch to favorites view
        this.switchToView('favorites-view');
        
        // Add event listeners
        const viewButtons = favoritesContainer.querySelectorAll('.view-favorite-button');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const coinId = e.target.dataset.id;
                this.showCoinDetail(coinId);
            });
        });
        
        const removeButtons = favoritesContainer.querySelectorAll('.remove-favorite-button');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const coinId = e.target.dataset.id;
                this.toggleFavorite(coinId);
                this.renderFavoritesView();
            });
        });
        
        const favoriteItems = favoritesContainer.querySelectorAll('.favorite-item');
        favoriteItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const coinId = item.dataset.id;
                    this.showCoinDetail(coinId);
                }
            });
        });
    }
    
    /**
     * Gets favorites from localStorage
     */
    getFavorites() {
        const favorites = localStorage.getItem('cryptoExplorerFavorites');
        return favorites ? JSON.parse(favorites) : [];
    }
    
    /**
     * Checks if a coin is in favorites
     */
    isFavorite(coinId) {
        const favorites = this.getFavorites();
        return favorites.includes(coinId);
    }
    
    /**
     * Toggles favorite status for a coin
     */
    toggleFavorite(coinId) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(coinId);
        
        if (index !== -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(coinId);
        }
        
        localStorage.setItem('cryptoExplorerFavorites', JSON.stringify(favorites));
    }
    
    /**
     * Adds a coin to recently viewed list
     */
    addToRecentCoins(coinId) {
        const recentCoins = this.getRecentCoins();
        const index = recentCoins.indexOf(coinId);
        
        if (index !== -1) {
            recentCoins.splice(index, 1);
        }
        
        recentCoins.unshift(coinId);
        
        // Keep only the max number of recent coins
        while (recentCoins.length > this.options.maxRecentCoins) {
            recentCoins.pop();
        }
        
        localStorage.setItem('cryptoExplorerRecent', JSON.stringify(recentCoins));
    }
    
    /**
     * Gets recently viewed coins from localStorage
     */
    getRecentCoins() {
        const recent = localStorage.getItem('cryptoExplorerRecent');
        return recent ? JSON.parse(recent) : [];
    }
    
    /**
     * Refreshes data for all active coins
     */
    refreshAllData() {
        this.showLoading(true);
        
        const coinIds = Object.keys(this.activeCoins);
        const promises = coinIds.map(coinId => {
            return this.fetchCoinData(coinId);
        });
        
        Promise.all(promises)
            .then(results => {
                results.forEach(data => {
                    if (data) {
                        this.activeCoins[data.id] = data;
                    }
                });
                
                this.refreshView();
                this.showLoading(false);
            })
            .catch(error => {
                console.error('Error refreshing data:', error);
                this.showLoading(false);
            });
    }
    
    /**
     * Gets sorted coins based on current sort filter
     */
    getSortedCoins() {
        const sortFilter = this.container.querySelector('#sort-filter');
        const sortValue = sortFilter ? sortFilter.value : 'market_cap_desc';
        
        let sortedCoins = Object.values(this.activeCoins);
        const currency = this.getCurrentCurrency();
        
        switch (sortValue) {
            case 'market_cap_desc':
                sortedCoins.sort((a, b) => {
                    return (b.market_data.market_cap[currency] || 0) - (a.market_data.market_cap[currency] || 0);
                });
                break;
                
            case 'market_cap_asc':
                sortedCoins.sort((a, b) => {
                    return (a.market_data.market_cap[currency] || 0) - (b.market_data.market_cap[currency] || 0);
                });
                break;
                
            case 'volume_desc':
                sortedCoins.sort((a, b) => {
                    return (b.market_data.total_volume[currency] || 0) - (a.market_data.total_volume[currency] || 0);
                });
                break;
                
            case 'volume_asc':
                sortedCoins.sort((a, b) => {
                    return (a.market_data.total_volume[currency] || 0) - (b.market_data.total_volume[currency] || 0);
                });
                break;
                
            case 'id_asc':
                sortedCoins.sort((a, b) => a.name.localeCompare(b.name));
                break;
                
            case 'id_desc':
                sortedCoins.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }
        
        return sortedCoins;
    }
    
    /**
     * Gets currency symbol based on currency code
     */
    getCurrencySymbol(currency) {
        const symbols = {
            'usd': '$',
            'eur': '€',
            'gbp': '£',
            'jpy': '¥',
            'btc': '₿',
            'eth': 'Ξ'
        };
        
        return symbols[currency] || currency.toUpperCase() + ' ';
    }
    
    /**
     * Formats a number with commas
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
     * Formats a number with compact notation (K, M, B, T)
     */
    formatNumberCompact(num) {
        if (num === undefined || num === null) return '0';
        
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        
        return num.toFixed(2);
    }
    
    /**
     * Calculates percentage position of price in range
     */
    calculatePricePercentage(price, low, high) {
        if (low === high) return 50;
        
        let percentage = ((price - low) / (high - low)) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        return percentage;
    }
    
    /**
     * Strips HTML tags from text
     */
    stripHTML(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }
    
    /**
     * Truncates text and adds ellipsis
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        
        return text.substring(0, maxLength) + '...';
    }
    
    /**
     * Cleans up intervals and event listeners when done
     */
    destroy() {
        // Clear all intervals
        Object.values(this.intervals).forEach(interval => {
            clearInterval(interval);
        });
        
        // Remove container contents
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Create global instance
window.cryptoExplorer = new CryptoExplorer();