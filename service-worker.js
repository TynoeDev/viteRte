/**
 * Crypto Widget Service Worker
 * Handles background updates for cryptocurrency data
 */

// Service worker version for cache management
const CACHE_VERSION = 'crypto-widget-v1';
const CACHE_NAME = `${CACHE_VERSION}`;

// Assets to cache on install
const ASSETS_TO_CACHE = [
    '/assets/js/compact-crypto.js',
    '/assets/css/compact-crypto.css',
    '/assets/images/coin.png'
];

// API endpoints to exclude from caching
const API_ENDPOINTS = [
    'api.coingecko.com'
];

// Install event - cache critical assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Service worker: Caching assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
        .then(() => {
            // Skip waiting to ensure the service worker activates immediately
            return self.skipWaiting();
        })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                .filter(cacheName => cacheName !== CACHE_NAME)
                .map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            // Claim clients to ensure the service worker controls all pages
            return self.clients.claim();
        })
    );
});

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
    // Check if the request is for an API endpoint
    const isApiRequest = API_ENDPOINTS.some(endpoint =>
        event.request.url.includes(endpoint)
    );

    // For API requests, use network-first strategy with timed fallback
    if (isApiRequest) {
        event.respondWith(
            fetchWithTimeout(event.request, 5000)
            .catch(() => {
                console.log('Service worker: API fetch failed, falling back to cache');
                return caches.match(event.request);
            })
        );
        return;
    }

    // For other assets, use cache-first strategy
    event.respondWith(
        caches.match(event.request)
        .then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .then(response => {
                    // Don't cache non-successful responses or non-http(s) requests
                    if (!response || response.status !== 200 || response.type !== 'basic' ||
                        !event.request.url.startsWith('http')) { // <-- Added check here
                        return response;
                    }

                    // Cache the new resource
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
        })
    );
});

// Helper function: Fetch with timeout
function fetchWithTimeout(request, timeout) {
    return new Promise((resolve, reject) => {
        // Set timeout
        const timeoutId = setTimeout(() => {
            reject(new Error('Request timeout'));
        }, timeout);

        fetch(request).then(
            response => {
                // Clear timeout
                clearTimeout(timeoutId);
                resolve(response);
            },
            err => {
                // Clear timeout
                clearTimeout(timeoutId);
                reject(err);
            }
        );
    });
}

// Handle background updates for cryptocurrency data
let cryptoUpdateInterval = null;
const defaultUpdateInterval = 60000; // 1 minute default
let activeUpdateInterval = defaultUpdateInterval;

// Listen for messages from the page
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SET_UPDATE_INTERVAL') {
        updateBackgroundFetchInterval(event.data.interval);
    } else if (event.data && event.data.type === 'START_BACKGROUND_UPDATES') {
        startBackgroundUpdates(event.data.coins, event.data.interval || defaultUpdateInterval);
    } else if (event.data && event.data.type === 'STOP_BACKGROUND_UPDATES') {
        stopBackgroundUpdates();
    }
});

// Update the background fetch interval
function updateBackgroundFetchInterval(interval) {
    // Parse interval - can be 'manual' or a number in milliseconds
    if (interval === 'manual') {
        stopBackgroundUpdates();
        return;
    }

    const intervalMs = parseInt(interval, 10);
    if (isNaN(intervalMs)) {
        return;
    }

    activeUpdateInterval = intervalMs;

    // Restart updates if already running
    if (cryptoUpdateInterval) {
        stopBackgroundUpdates();
        startBackgroundUpdates(null, intervalMs);
    }

    // Notify clients about the update
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'INTERVAL_UPDATED',
                interval: intervalMs
            });
        });
    });
}

// Start background updates
function startBackgroundUpdates(coins, interval) {
    const coinsToUpdate = coins || ['bitcoin']; // Default to bitcoin if no coins provided
    activeUpdateInterval = interval || activeUpdateInterval;

    // Clear any existing interval
    stopBackgroundUpdates();

    // Set up the new interval
    cryptoUpdateInterval = setInterval(() => {
        fetchCryptoData(coinsToUpdate);
    }, activeUpdateInterval);

    console.log(`Service worker: Started background updates every ${activeUpdateInterval}ms for ${coinsToUpdate.join(', ')}`);
}

// Stop background updates
function stopBackgroundUpdates() {
    if (cryptoUpdateInterval) {
        clearInterval(cryptoUpdateInterval);
        cryptoUpdateInterval = null;
        console.log('Service worker: Stopped background updates');
    }
}

// Fetch cryptocurrency data
async function fetchCryptoData(coins) {
    if (!coins || !coins.length) return;

    try {
        // Batch fetch data for all coins
        const promises = coins.map(coinId =>
            fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                return response.json();
            })
        );

        const results = await Promise.all(promises);

        // Send data to all clients
        self.clients.matchAll().then(clients => {
            if (clients && clients.length) {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'CRYPTO_DATA_UPDATE',
                        data: results
                    });
                });
            }
        });

        console.log(`Service worker: Successfully fetched data for ${coins.length} coins`);
    } catch (error) {
        console.error('Service worker: Error fetching crypto data:', error);
    }
}