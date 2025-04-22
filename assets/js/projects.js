document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    const projectCards = document.querySelectorAll('.project-card');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();

            projectCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('.project-body p').textContent.toLowerCase();

                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Filter functionality
    const categoryFilter = document.querySelector('.filter-options select:first-child');
    const statusFilter = document.querySelector('.filter-options select:last-child');

    function applyFilters() {
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        const selectedStatus = statusFilter ? statusFilter.value : 'all';

        projectCards.forEach(card => {
            // This is placeholder logic - in a real app, you'd have data attributes on cards
            const cardCategory = 'all'; // Would be extracted from card data
            const cardStatus = card.querySelector('.status-tag').textContent.toLowerCase();

            const categoryMatch = selectedCategory === 'all' || cardCategory === selectedCategory;
            const statusMatch = selectedStatus === 'all' || cardStatus === selectedStatus;

            if (categoryMatch && statusMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    // New Project Button
    const newProjectBtn = document.querySelector('.new-project-btn');

    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', function() {
            alert('New project form would open here');
            // In a real app, you'd open a modal or redirect to a form
        });
    }

    // Project Detail Buttons
    const detailButtons = document.querySelectorAll('.project-action-btn');

    detailButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectName = this.closest('.project-card').querySelector('h3').textContent;
            alert(`Viewing details for ${projectName}`);
            // In a real app, you'd open a modal with details or navigate to a detail page
        });
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
        });
    }
});