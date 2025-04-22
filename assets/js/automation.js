document.addEventListener('DOMContentLoaded', function() {
    // Toggle switches functionality
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');

    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const processCard = this.closest('.process-card');
            const processName = processCard.querySelector('h3').textContent;

            if (this.checked) {
                console.log(`Activated: ${processName}`);
                // In a real app, you'd send an API request to activate the process

                // Simulate success feedback
                addLogEntry(`${processName} activated successfully`, 'success');
            } else {
                console.log(`Deactivated: ${processName}`);
                // In a real app, you'd send an API request to deactivate the process

                // Simulate success feedback
                addLogEntry(`${processName} deactivated`, 'info');
            }
        });
    });

    // Run Button functionality
    const runButtons = document.querySelectorAll('.run-btn');

    runButtons.forEach(button => {
        button.addEventListener('click', function() {
            const processCard = this.closest('.process-card');
            const processName = processCard.querySelector('h3').textContent;

            console.log(`Running: ${processName}`);
            // Change button text temporarily
            const originalText = this.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
            button.disabled = true;

            // Simulate an API call with a delay
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;

                // Add a log entry
                addLogEntry(`${processName} completed successfully`, 'success');
            }, 2000);
        });
    });

    // Config Button functionality
    const configButtons = document.querySelectorAll('.config-btn');

    configButtons.forEach(button => {
        button.addEventListener('click', function() {
            const processCard = this.closest('.process-card');
            const processName = processCard.querySelector('h3').textContent;

            alert(`Configuration panel for ${processName} would open here`);
            // In a real app, you'd open a modal with configuration options
        });
    });

    // Run All button
    const runAllBtn = document.querySelector('.run-all-btn');

    if (runAllBtn) {
        runAllBtn.addEventListener('click', function() {
            const activeProcesses = document.querySelectorAll('.toggle-switch input:checked');

            if (activeProcesses.length === 0) {
                alert('No active processes to run');
                return;
            }

            // Disable button temporarily
            runAllBtn.disabled = true;
            const originalText = runAllBtn.innerHTML;
            runAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running All...';

            // Simulate running all processes
            setTimeout(() => {
                runAllBtn.innerHTML = originalText;
                runAllBtn.disabled = false;

                addLogEntry('All active automations completed successfully', 'success');
            }, 3000);
        });
    }

    // Stop All button
    const stopAllBtn = document.querySelector('.stop-all-btn');

    if (stopAllBtn) {
        stopAllBtn.addEventListener('click', function() {
            const confirmation = confirm('Are you sure you want to stop all running processes?');

            if (confirmation) {
                // Disable all toggle switches
                toggleSwitches.forEach(toggle => {
                    toggle.checked = false;
                });

                addLogEntry('All automations stopped', 'warning');
            }
        });
    }

    // Function to add a log entry
    function addLogEntry(message, type = 'info') {
        const logContainer = document.querySelector('.log-container');

        if (!logContainer) return;

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;

        let icon = '';
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

        logEntry.innerHTML = `
            <div class="log-time">${timeString}</div>
            <div class="log-content">
                ${icon}
                <span>${message}</span>
            </div>
        `;

        // Add to the top of the log for most recent first
        logContainer.insertBefore(logEntry, logContainer.firstChild);
    }

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
        });
    }
});