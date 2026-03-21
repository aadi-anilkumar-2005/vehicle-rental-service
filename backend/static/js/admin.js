document.addEventListener('DOMContentLoaded', () => {
    /**
     * 1. ACTIVE MENU TRACKING
     * Automatically highlights the sidebar link matching the current page.
     */
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const itemUrl = item.getAttribute('href');
        // Match exact path or sub-paths (excluding dashboard catch-all)
        if (currentPath === itemUrl || (currentPath.includes(itemUrl) && itemUrl !== '/admin/dashboard/')) {
            item.classList.add('active');
        } 
        // Handle root admin path
        else if (currentPath === '/admin/' && itemUrl === '/admin/dashboard/') {
            item.classList.add('active');
        }
    });

    /**
     * 2. SMART FILTERING & SORTING
     * Syncs URL query parameters with <select> dropdowns.
     */
    const filterSelects = document.querySelectorAll('[data-filter], [data-sort]');
    
    if (filterSelects.length > 0) {
        filterSelects.forEach(select => {
            // Set initial state from URL on page load
            const urlParams = new URLSearchParams(window.location.search);
            const savedValue = urlParams.get(select.getAttribute('name'));
            if (savedValue) select.value = savedValue;

            // Update URL and reload on change
            select.addEventListener('change', () => {
                const url = new URL(window.location);
                const key = select.getAttribute('name');
                const val = select.value;

                if (val) {
                    url.searchParams.set(key, val);
                } else {
                    url.searchParams.delete(key);
                }
                
                // Show a subtle loading state (optional)
                document.body.style.opacity = '0.7';
                window.location.href = url.toString();
            });
        });
    }

    /**
     * 3. MODAL MANAGEMENT
     * Handles opening/closing of Glassmorphism modals.
     */
    const closeBtns = document.querySelectorAll('.modal-close, [data-dismiss="modal"]');
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) modal.classList.remove('active');
        });
    });

    // Close modal if user clicks on the darkened background
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
        }
    });

    /**
     * 4. ACTION CONFIRMATIONS (SweetAlert2)
     * Adds a professional confirmation dialog to delete/approve actions.
     */
    const actionForms = document.querySelectorAll('.confirm-action');
    actionForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = form.dataset.confirmMsg || "Are you sure you want to proceed?";
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Are you sure?',
                    text: msg,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3b82f6', // RentXplore Blue
                    cancelButtonColor: '#64748b',
                    confirmButtonText: 'Yes, do it!',
                    background: '#ffffff',
                    borderRadius: '16px'
                }).then((result) => {
                    if (result.isConfirmed) form.submit();
                });
            } else {
                if (confirm(msg)) form.submit();
            }
        });
    });

    /**
     * 5. DATA-DRIVEN MODALS
     * Populates Edit/Reject modals with data from the clicked button.
     */
    const dataModalBtns = document.querySelectorAll('[data-modal-target]');
    dataModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.dataset.modalTarget;
            const modal = document.getElementById(targetId);
            
            if (modal) {
                // Automatically map all data- attributes to form inputs in the modal
                Object.keys(btn.dataset).forEach(key => {
                    const input = modal.querySelector(`[name="${key}"], #[id="edit${key.charAt(0).toUpperCase() + key.slice(1)}"]`);
                    if (input) input.value = btn.dataset[key];
                });
                modal.classList.add('active');
            }
        });
    });

    /**
     * 6. IMAGE PREVIEW (KYC)
     */
    const kycImages = document.querySelectorAll('.doc-box img');
    const imgModal = document.getElementById('imgModal');
    if (kycImages.length > 0 && imgModal) {
        const display = document.getElementById('modalImageDisplay');
        kycImages.forEach(img => {
            img.addEventListener('click', () => {
                display.src = img.src;
                imgModal.classList.add('active');
            });
        });
    }

    /**
     * 7. CLICKABLE TABLE ROWS / CARDS
     */
    const rows = document.querySelectorAll('[data-href]');
    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            // Only navigate if the user didn't click a button or link inside the row
            if (!e.target.closest('button') && !e.target.closest('a')) {
                window.location.href = row.dataset.href;
            }
        });
    });
});