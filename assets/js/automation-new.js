document.addEventListener('DOMContentLoaded', function() {
    // Navigation Tab Switching
    initializeSidebarNavigation();

    // Dashboard Actions
    initializeDashboardActions();

    // Card Expandable Functionality
    initializeExpandableCards();

    // Process Table Actions
    initializeProcessTableActions();

    // Quick Action Buttons
    initializeQuickActions();

    // Feature Cards Actions
    initializeFeatureCards();

    // Modal Functionality
    initializeModals();

    // Mobile Menu Toggle
    initializeMobileMenu();

    // Simulated Metrics Update
    simulateMetricsUpdates();
});

// Navigation Tab Switching
function initializeSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentViews = document.querySelectorAll('.content-view');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetView = this.getAttribute('data-view');

            // Deactivate all nav items and hide all views
            navItems.forEach(navItem => navItem.classList.remove('active'));
            contentViews.forEach(view => view.classList.remove('active'));

            // Activate selected nav item and show corresponding view
            this.classList.add('active');
            document.getElementById(`${targetView}-view`).classList.add('active');
        });
    });
}

// Dashboard Actions Initialization
function initializeDashboardActions() {
    // Run All button
    const runAllBtn = document.querySelector('.action-btn.run-all');
    if (runAllBtn) {
        runAllBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
            this.disabled = true;

            // Simulate process running
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-play"></i> Run All';
                this.disabled = false;

                // Add success notification
                addNotification('All active automations executed successfully', 'success');
            }, 2000);
        });
    }

    // Refresh button
    const refreshBtn = document.querySelector('.action-btn.refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            this.disabled = true;

            // Simulate refresh
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                this.disabled = false;

                // Update timestamp
                updateDashboardTimestamp();

                // Add notification
                addNotification('Dashboard refreshed', 'info');
            }, 1000);
        });
    }

    // Settings button
    const settingsBtn = document.querySelector('.action-btn.settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            openModal('config-modal', 'Dashboard Settings');
        });
    }
}

// Expandable Cards
function initializeExpandableCards() {
    const expandBtns = document.querySelectorAll('.expand-btn');

    expandBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.dashboard-card');

            if (card.classList.contains('expanded')) {
                // Collapse the card
                card.classList.remove('expanded');
                this.innerHTML = '<i class="fas fa-expand-alt"></i>';
                card.style.position = '';
                card.style.zIndex = '';
                card.style.width = '';
                card.style.height = '';
                card.style.top = '';
                card.style.left = '';
            } else {
                // Expand the card
                card.classList.add('expanded');
                this.innerHTML = '<i class="fas fa-compress-alt"></i>';

                // Save the card's position and size info
                const cardRect = card.getBoundingClientRect();
                card.style.position = 'fixed';
                card.style.zIndex = '50';
                card.style.width = 'calc(100% - 80px)';
                card.style.height = 'calc(100% - 120px)';
                card.style.top = '70px';
                card.style.left = '40px';
            }
        });
    });
}

// Process Table Actions
function initializeProcessTableActions() {
    // Run buttons
    const runButtons = document.querySelectorAll('.table-btn.run');
    runButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const processName = this.closest('tr').querySelector('.process-name span').textContent;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            this.disabled = true;

            // Simulate process running
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-play"></i>';
                this.disabled = false;

                // Add log entry
                addNotification(`${processName} executed successfully`, 'success');

                // Add to log list
                addLogEntry(`${processName} completed successfully`, 'success');
            }, 1500);
        });
    });

    // Configure buttons
    const configButtons = document.querySelectorAll('.table-btn.config');
    configButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const processName = this.closest('tr').querySelector('.process-name span').textContent;
            openModal('config-modal', `Configure ${processName}`);
        });
    });
}

// Quick Actions
function initializeQuickActions() {
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');

    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const actionName = this.querySelector('span').textContent;

            // Handle different actions
            switch (actionName) {
                case 'Import Proposals':
                    openModal('config-modal', 'Import Proposals');
                    break;
                case 'Batch KYC':
                    openModal('config-modal', 'Batch KYC Processing');
                    break;
                case 'Release Funds':
                    openModal('config-modal', 'Release Funds');
                    break;
                case 'Generate Report':
                    generateReport();
                    break;
                case 'Oracle Health':
                    checkOracleHealth();
                    break;
                case 'View Map':
                    openGeospatialView();
                    break;
                default:
                    addNotification(`${actionName} action triggered`, 'info');
            }
        });
    });
}

// Feature Cards Actions
function initializeFeatureCards() {
    // Run Now buttons
    const runNowButtons = document.querySelectorAll('.feature-action-btn.primary');
    runNowButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const featureName = this.closest('.feature-card').querySelector('h3').textContent;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
            this.disabled = true;

            // Simulate process running
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-play"></i> Run Now';
                this.disabled = false;

                addNotification(`${featureName} executed successfully`, 'success');
            }, 2000);
        });
    });

    // Configure buttons
    const configButtons = document.querySelectorAll('.feature-action-btn.secondary');
    configButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const featureName = this.closest('.feature-card').querySelector('h3').textContent;
            openModal('config-modal', `Configure ${featureName}`);
        });
    });
}

// Modal Functionality
function initializeModals() {
    const modals = document.querySelectorAll('.modal-container');
    const modalCloseBtns = document.querySelectorAll('.modal-close, .btn-cancel');

    // Close modal when clicking close button or cancel
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = btn.closest('.modal-container');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Save button functionality
    const saveButtons = document.querySelectorAll('.btn-save');
    saveButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = btn.closest('.modal-container');
            const modalTitle = modal.querySelector('.modal-header h2').textContent;

            // Simulate saving
            btn.textContent = 'Saving...';
            btn.disabled = true;

            setTimeout(() => {
                closeModal(modal);
                addNotification(`${modalTitle} settings saved successfully`, 'success');
                btn.textContent = 'Save Changes';
                btn.disabled = false;
            }, 1000);
        });
    });
}

// Mobile Menu
function initializeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.automation-sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking on content area (mobile)
        document.querySelector('.automation-content').addEventListener('click', function() {
            if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// Simulated Metrics Updates
function simulateMetricsUpdates() {
    // Simulate occasional metrics updates
    setInterval(() => {
        // Random chance to update a metric
        if (Math.random() > 0.7) {
            const metrics = document.querySelectorAll('.metric-data p');
            if (metrics.length > 0) {
                const randomMetric = metrics[Math.floor(Math.random() * metrics.length)];

                // Add animation class
                randomMetric.classList.add('metric-update');

                // Remove animation class after animation completes
                setTimeout(() => {
                    randomMetric.classList.remove('metric-update');
                }, 1000);
            }
        }
    }, 5000);
}

// Helper Functions
function addNotification(message, type) {
    // Create notification element if it doesn't exist
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Set icon based on type
    let icon;
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-times-circle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }

    notification.innerHTML = `${icon} <span>${message}</span>`;
    notificationContainer.appendChild(notification);

    // Remove after animation
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function addLogEntry(message, type) {
    const logList = document.querySelector('.log-list');
    if (logList) {
        // Create new log entry
        const logItem = document.createElement('div');
        logItem.className = `log-item ${type}`;

        // Set icon based on type
        let icon;
        switch (type) {
            case 'success':
                icon = 'check-circle';
                break;
            case 'warning':
                icon = 'exclamation-triangle';
                break;
            case 'error':
                icon = 'times-circle';
                break;
            default:
                icon = 'info-circle';
        }

        // Get current time
        const now = new Date();
        const time = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

        // Set log content
        logItem.innerHTML = `
            <div class="log-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="log-details">
                <p>${message}</p>
                <span class="log-time">${time}</span>
            </div>
        `;

        // Add to log list (prepend)
        logList.prepend(logItem);

        // Remove old logs if too many
        const logItems = logList.querySelectorAll('.log-item');
        if (logItems.length > 10) {
            for (let i = 10; i < logItems.length; i++) {
                logItems[i].remove();
            }
        }
    }
}

function updateDashboardTimestamp() {
    const timestampEl = document.querySelector('.update-time');
    if (timestampEl) {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        timestampEl.textContent = now.toLocaleDateString('en-US', options);
    }
}

function openModal(modalId, title) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Set modal title if provided
        if (title && modal.querySelector('.modal-header h2')) {
            modal.querySelector('.modal-header h2').textContent = title;
        }

        // Show modal
        modal.classList.add('active');

        // Dynamic content based on modal type could be added here
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            // Example: different content based on title
            if (title.includes('Configure')) {
                const featureName = title.replace('Configure ', '');
                populateConfigModal(modalBody, featureName);
            } else if (title === 'Import Proposals') {
                populateImportModal(modalBody);
            } else if (title === 'Release Funds') {
                populateReleaseFundsModal(modalBody);
            }
        }
    }
}

function closeModal(modal) {
    modal.classList.remove('active');
}

// Modal content generators
function populateConfigModal(modalBody, featureName) {
    modalBody.innerHTML = `
        <div class="config-form">
            <div class="form-group">
                <label>Feature Name</label>
                <input type="text" value="${featureName}" class="form-control" disabled>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select class="form-control">
                    <option value="active" selected>Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="scheduled">Scheduled</option>
                </select>
            </div>
            <div class="form-group">
                <label>Run Frequency</label>
                <select class="form-control">
                    <option value="manual">Manual Only</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily" selected>Daily</option>
                    <option value="weekly">Weekly</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notification Settings</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" checked> On Success</label>
                    <label><input type="checkbox" checked> On Failure</label>
                    <label><input type="checkbox" checked> On Warning</label>
                </div>
            </div>
            <div class="form-group">
                <label>Advanced Settings</label>
                <button class="btn-advanced">Configure Advanced Settings</button>
            </div>
        </div>
    `;
}

function populateImportModal(modalBody) {
    modalBody.innerHTML = `
        <div class="import-form">
            <div class="form-group">
                <label>Import Source</label>
                <select class="form-control">
                    <option value="csv">CSV File</option>
                    <option value="api">External API</option>
                    <option value="form">Form Submissions</option>
                </select>
            </div>
            <div class="form-group">
                <label>Upload File</label>
                <div class="file-upload">
                    <input type="file" id="file-upload" hidden>
                    <button class="file-select-btn">Choose File</button>
                    <span class="file-name">No file selected</span>
                </div>
            </div>
            <div class="form-group">
                <label>Import Options</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" checked> Skip Duplicates</label>
                    <label><input type="checkbox" checked> Auto-validate</label>
                    <label><input type="checkbox"> Auto-approve if validated</label>
                </div>
            </div>
        </div>
    `;

    // Add file select functionality
    setTimeout(() => {
        const fileSelectBtn = modalBody.querySelector('.file-select-btn');
        const fileInput = modalBody.querySelector('#file-upload');
        const fileNameSpan = modalBody.querySelector('.file-name');

        if (fileSelectBtn && fileInput && fileNameSpan) {
            fileSelectBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    fileNameSpan.textContent = e.target.files[0].name;
                }
            });
        }
    }, 100);
}

function populateReleaseFundsModal(modalBody) {
    modalBody.innerHTML = `
        <div class="release-funds-form">
            <div class="form-group">
                <label>Project Selection</label>
                <select class="form-control">
                    <option value="">-- Select Project --</option>
                    <option value="1">AI Research Lab</option>
                    <option value="2">Water Purification</option>
                    <option value="3">Tech Literacy</option>
                    <option value="4">Clean Energy Initiative</option>
                </select>
            </div>
            <div class="form-group">
                <label>Milestone</label>
                <select class="form-control" disabled>
                    <option value="">Select project first</option>
                </select>
            </div>
            <div class="form-group">
                <label>Amount to Release</label>
                <div class="input-with-prefix">
                    <span class="prefix">$</span>
                    <input type="number" class="form-control" disabled>
                </div>
            </div>
            <div class="form-group">
                <label>Release Type</label>
                <div class="radio-group">
                    <label><input type="radio" name="release-type" checked> Standard</label>
                    <label><input type="radio" name="release-type"> Expedited (higher gas)</label>
                </div>
            </div>
        </div>
    `;

    // Add project selection functionality
    setTimeout(() => {
        const projectSelect = modalBody.querySelector('select:first-of-type');
        const milestoneSelect = modalBody.querySelector('select:last-of-type');
        const amountInput = modalBody.querySelector('input[type="number"]');

        if (projectSelect && milestoneSelect && amountInput) {
            projectSelect.addEventListener('change', () => {
                if (projectSelect.value) {
                    milestoneSelect.disabled = false;
                    milestoneSelect.innerHTML = '';

                    // Add different milestones based on project
                    if (projectSelect.value === '1') {
                        milestoneSelect.innerHTML = `
                            <option value="1.1">Research Phase 1 Complete</option>
                            <option value="1.2">Prototype Development</option>
                            <option value="1.3">Final Report</option>
                        `;

                    } else if (projectSelect.value === '2') {
                        milestoneSelect.innerHTML = `
                            <option value="2.1">Equipment Purchase</option>
                            <option value="2.2">Installation Complete</option>
                        `;
                    } else {
                        milestoneSelect.innerHTML = `
                            <option value="m1">Phase 1</option>
                            <option value="m2">Phase 2</option>
                        `;
                    }

                    milestoneSelect.addEventListener('change', () => {
                        amountInput.disabled = false;

                        // Set suggested amount based on milestone
                        if (milestoneSelect.value === '1.1') amountInput.value = 15000;
                        else if (milestoneSelect.value === '1.2') amountInput.value = 25000;
                        else if (milestoneSelect.value === '1.3') amountInput.value = 10000;
                        else if (milestoneSelect.value === '2.1') amountInput.value = 35000;
                        else if (milestoneSelect.value === '2.2') amountInput.value = 15000;
                        else amountInput.value = 20000;
                    });
                } else {
                    milestoneSelect.disabled = true;
                    milestoneSelect.innerHTML = '<option value="">Select project first</option>';
                    amountInput.disabled = true;
                    amountInput.value = '';
                }
            });
        }
    }, 100);
}

// Feature-specific functions
function generateReport() {
    addNotification('Generating report, please wait...', 'info');

    // Simulate report generation
    setTimeout(() => {
        openModal('config-modal', 'Report Generated');

        // Populate modal with report content
        const modalBody = document.querySelector('#config-modal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="report-success">
                    <div class="report-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <h3>Report Generated Successfully</h3>
                    <p>Your report has been generated and is ready to download.</p>
                    <div class="report-actions">
                        <button class="btn-download"><i class="fas fa-download"></i> Download Report</button>
                        <button class="btn-email"><i class="fas fa-envelope"></i> Email Report</button>
                    </div>
                </div>
            `;

            // Add download functionality
            const downloadBtn = modalBody.querySelector('.btn-download');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    addNotification('Report download started', 'success');
                    // In real app, this would trigger actual file download
                });
            }

            // Add email functionality
            const emailBtn = modalBody.querySelector('.btn-email');
            if (emailBtn) {
                emailBtn.addEventListener('click', () => {
                    addNotification('Report sent via email', 'success');
                });
            }
        }
    }, 2000);
}

function checkOracleHealth() {
    addNotification('Checking oracle health...', 'info');

    // Simulate health check
    setTimeout(() => {
        const navItem = document.querySelector('[data-view="smart-contracts"]');
        if (navItem) navItem.click();

        setTimeout(() => {
            addNotification('Oracle health check complete: All systems operational', 'success');
        }, 500);
    }, 1500);
}

function openGeospatialView() {
    const navItem = document.querySelector('[data-view="geo-tools"]');
    if (navItem) navItem.click();
}