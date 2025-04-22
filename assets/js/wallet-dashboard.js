document.addEventListener('DOMContentLoaded', function() {
    // TODO: Implement JavaScript interactions for the DevFund dashboard
    // - Navigation menu toggle for mobile
    // - Interactive elements within panels (e.g., chart updates, RPA management)
    // - Web3 wallet connections
    // - API calls for data fetching

    console.log('DevFund Dashboard JS Loaded');

    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.devfund-header nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            // Basic toggle example - replace with a proper mobile menu implementation
            if (nav.style.display === 'block') {
                nav.style.display = 'none';
            } else {
                nav.style.display = 'block';
                // You'll likely want to style this better, e.g., as a dropdown
                nav.style.position = 'absolute';
                nav.style.top = '60px'; // Adjust based on header height
                nav.style.right = '20px';
                nav.style.backgroundColor = '#161b22';
                nav.style.border = '1px solid #30363d';
                nav.style.padding = '1rem';
                nav.style.borderRadius = '8px';
            }
        });
    }

});