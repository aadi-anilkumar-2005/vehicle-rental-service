document.addEventListener('DOMContentLoaded', () => {
    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('mobile-open');
            } else {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            }
        });
    }

    // Set Active Menu Item based on current URL
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const itemUrl = item.getAttribute('href');
        if (currentPath === itemUrl || (currentPath.includes(itemUrl) && itemUrl !== '/admin/dashboard/')) {
            item.classList.add('active');
        } else if (currentPath === '/admin/' && itemUrl === '/admin/dashboard/') {
            item.classList.add('active');
        }
    });

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (sidebar.classList.contains('mobile-open') && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });

    // Filtering System
    const filterSelects = document.querySelectorAll('[data-filter]');
    if (filterSelects.length > 0) {
        filterSelects.forEach(select => {
            select.addEventListener('change', () => {
                const url = new URL(window.location);
                const filterKey = select.getAttribute('name');
                const filterValue = select.value;
                if (filterValue) {
                    url.searchParams.set(filterKey, filterValue);
                } else {
                    url.searchParams.delete(filterKey);
                }
                window.location.href = url.toString();
            });
        });

        // Set initial select values from URL
        const urlParams = new URLSearchParams(window.location.search);
        filterSelects.forEach(select => {
            const val = urlParams.get(select.getAttribute('name'));
            if (val) select.value = val;
        });
    }

    // Sorting System
    const sortSelect = document.querySelector('[data-sort]');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const url = new URL(window.location);
            const sortVal = sortSelect.value;
            if (sortVal) {
                url.searchParams.set('sort', sortVal);
            } else {
                url.searchParams.delete('sort');
            }
            window.location.href = url.toString();
        });
        const urlParams = new URLSearchParams(window.location.search);
        const sortParam = urlParams.get('sort');
        if (sortParam) sortSelect.value = sortParam;
    }

    // Modals
    const modals = document.querySelectorAll('.modal-overlay');
    const closeBtns = document.querySelectorAll('.modal-close, [data-dismiss="modal"]');
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if(modal) modal.classList.remove('active');
        });
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Action Confirmations (Delete, Approve, Reject)
    const actionForms = document.querySelectorAll('.confirm-action');
    actionForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const actionMsg = form.dataset.confirmMsg || "Are you sure you want to perform this action?";
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Confirm Action',
                    text: actionMsg,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#4F46E5',
                    cancelButtonColor: '#64748B',
                    confirmButtonText: 'Yes, proceed'
                }).then((result) => {
                    if (result.isConfirmed) {
                        form.submit();
                    }
                });
            } else {
                // Fallback if Swal failed to load
                if (confirm(actionMsg)) {
                    form.submit();
                }
            }
        });
    });

    // KYC Rejection Modal
    const rejectBtns = document.querySelectorAll('.btn-reject-kyc');
    const rejectModal = document.getElementById('rejectModal');
    if (rejectBtns.length > 0 && rejectModal) {
        rejectBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const kycId = btn.dataset.kycid;
                document.getElementById('rejectKycId').value = kycId;
                rejectModal.classList.add('active');
            });
        });
    }
    
    // Edit Owner Modal
    const editOwnerBtns = document.querySelectorAll('.btn-edit-owner');
    const editOwnerModal = document.getElementById('editOwnerModal');
    if (editOwnerBtns.length > 0 && editOwnerModal) {
        editOwnerBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('editOwnerId').value = btn.dataset.id;
                document.getElementById('editFirstName').value = btn.dataset.first;
                document.getElementById('editLastName').value = btn.dataset.last;
                document.getElementById('editEmail').value = btn.dataset.email;
                document.getElementById('editPhone').value = btn.dataset.phone;
                editOwnerModal.classList.add('active');
            });
        });
    }

    // Image Preview Modal for KYC
    const docImages = document.querySelectorAll('.doc-box img');
    const imgModal = document.getElementById('imgModal');
    if (docImages.length > 0 && imgModal) {
        const modalImg = document.getElementById('modalImageDisplay');
        docImages.forEach(img => {
            img.addEventListener('click', () => {
                modalImg.src = img.src;
                imgModal.classList.add('active');
            });
        });
    }
    
    // Make cards clickable if they have a data-href
    const clickableCards = document.querySelectorAll('.item-card[data-href]');
    clickableCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't navigate if clicking on buttons inside the card
            if (!e.target.closest('.btn')) {
                window.location.href = card.dataset.href;
            }
        });
    });
});
