// Vehicle Owner Dashboard JavaScript - Multi-page Refactored
class RentalDashboard {
  constructor() {
    this.currentBookingId = null;
    this.storagePrefix = this.getStoragePrefix();
    this.init();
  }

  getStoragePrefix() {
    const ownerId = document.body?.dataset?.ownerId || "anonymous";
    return `owner:${ownerId}:`;
  }

  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  init() {
    this.loadStoredData();
    this.setupEventListeners();
    this.updateUserDisplay();

    // Dynamically load data based on the current page context
    if (document.getElementById("dashboard-overview")) {
      this.loadDashboardData();
    }
    if (document.getElementById("staffTable")) {
      this.loadStaffData();
    }

    if (document.getElementById("bookingsTable")) {
      this.loadBookingData();
    }
  }

  loadStoredData() {
    // If mockData is completely removed from the HTML, we need to initialize it locally
    if (typeof mockData === 'undefined') {
      window.mockData = {
        staff: [],
        vehicles: [],
        bookings: []
      };
    }

    // Load any stored data from localStorage
    const storedStaff = localStorage.getItem(`${this.storagePrefix}staffData`);
    const storedVehicles = localStorage.getItem(`${this.storagePrefix}vehicleData`);
    const storedBookings = localStorage.getItem(`${this.storagePrefix}bookingData`);

    if (storedStaff) {
      mockData.staff = JSON.parse(storedStaff);
    }
    if (storedVehicles) {
      mockData.vehicles = JSON.parse(storedVehicles);
    }
    if (storedBookings) {
      mockData.bookings = JSON.parse(storedBookings);
    }
  }

  saveData() {
    // Save current data to localStorage
    localStorage.setItem(`${this.storagePrefix}staffData`, JSON.stringify(mockData.staff));
    localStorage.setItem(`${this.storagePrefix}vehicleData`, JSON.stringify(mockData.vehicles));
    localStorage.setItem(`${this.storagePrefix}bookingData`, JSON.stringify(mockData.bookings));
  }

  setupEventListeners() {
    // Mobile menu toggle
    const toggleBtn = document.getElementById("mobileToggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("show");
      });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        sessionStorage.clear();
        localStorage.removeItem(`${this.storagePrefix}staffData`);
        localStorage.removeItem(`${this.storagePrefix}vehicleData`);
        localStorage.removeItem(`${this.storagePrefix}bookingData`);
        window.location.href = "/logout/"; // Use standard Django logout routing
      });
    }

    // Add Staff
    const saveStaffBtn = document.getElementById("saveStaffBtn");
    if (saveStaffBtn) {
      saveStaffBtn.addEventListener("click", () => {
        this.addStaff();
      });
    }

    // Add Vehicle
    const saveVehicleBtn = document.getElementById("saveVehicleBtn");
    if (saveVehicleBtn) {
      saveVehicleBtn.addEventListener("click", () => {
        this.addVehicle();
      });
    }

    // Assign Staff
    const confirmAssignBtn = document.getElementById("confirmAssignBtn");
    if (confirmAssignBtn) {
      confirmAssignBtn.addEventListener("click", () => {
        this.assignStaff();
      });
    }
  }

  loadDashboardData() {
    // Data is now handled natively via Django context in dashboard_view
  }

  getBadgeClass(status) {
    switch (status.toLowerCase()) {
      case "active":
        return "badge-success";
      case "completed":
        return "badge-info";
      case "pending":
        return "badge-warning";
      case "inactive":
        return "badge-secondary";
      case "available":
        return "badge-success";
      case "rented":
        return "badge-danger";
      case "assigned":
        return "badge-primary";
      case "cancelled":
        return "badge-danger";
      default:
        return "badge-primary";
    }
  }

  loadRecentBookings() {
    // Recent bookings are now handled natively via Django context in dashboard_view
  }

  loadStaffData() {
    const tbody = document.getElementById("staffTable");
    if (!tbody) return;

    fetch('/api/staff/')
      .then(res => res.json())
      .then(data => {
        if (data.staff) {
          mockData.staff = data.staff;
          tbody.innerHTML = mockData.staff
            .map(
              (staff) => `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <div class="avatar bg-primary text-white d-flex align-items-center justify-content-center text-uppercase fw-bold">
                            ${staff.name.charAt(0)}
                        </div>
                        <div>
                            <div class="font-semibold text-dark">${staff.name}</div>
                            <div class="small text-muted">${staff.email}</div>
                        </div>
                    </div>
                </td>
                <td>${staff.phone}</td>
                <td><span class="badge badge-secondary">${staff.role}</span></td>
                <td><span class="badge ${this.getBadgeClass(staff.status)}">${staff.status}</span></td>
                <td class="text-muted">${staff.joinDate}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-icon btn-secondary" onclick="dashboard.editStaff(${staff.id})" disabled title="Edit disabled for API managed staff">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-icon btn-danger" onclick="dashboard.deleteStaff(${staff.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `,
            )
            .join("");
        }
      })
      .catch(err => console.error("Error loading staff API data:", err));
  }

  loadVehicleData() {
    const grid = document.getElementById("vehicleGrid");
    if (!grid) return;

    grid.innerHTML = mockData.vehicles
      .map(
        (shop) => `
            <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                <div class="card h-100">
                    <div style="height: 200px; overflow: hidden; position: relative;">
                        <img src="${shop.image || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400'}" alt="${shop.name}" style="width: 100%; height: 100%; object-fit: cover;">
                        <span class="badge ${shop.is_open ? 'badge-success' : 'badge-danger'}" style="position: absolute; top: 12px; right: 12px; font-size: 0.75rem;">
                            ${shop.is_open ? 'Open' : 'Closed'}
                        </span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h5 class="mb-1">${shop.name}</h5>
                                <div class="text-muted small"><i class="bi bi-geo-alt-fill me-1"></i>${shop.address || 'N/A'}</div>
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2 mb-4 mt-2">
                            <span class="badge badge-secondary"><i class="bi bi-star-fill text-warning me-1"></i>${shop.rating || 0} (${shop.review_count || 0})</span>
                            <span class="badge badge-secondary"><i class="bi bi-clock me-1"></i>${shop.operating_hours || 'N/A'}</span>
                        </div>
                        <div class="mb-3 small text-muted">
                            <i class="bi bi-telephone me-1"></i>${shop.phone || 'N/A'}
                        </div>
                        
                        <div class="mt-auto d-flex justify-content-between align-items-center pt-3 border-top position-relative">
                            <small class="text-muted font-monospace" style="font-size: 0.75rem;">Lat: ${shop.latitude || 0}, Lng: ${shop.longitude || 0}</small>
                            <div class="d-flex gap-2">
                                <button class="btn btn-icon btn-secondary" onclick="dashboard.editVehicle(${shop.id})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-icon btn-danger" onclick="dashboard.deleteVehicle(${shop.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  loadBookingData() {
    // Booking table is now fully rendered via Django template natively
    // Removed legacy mapping function
  }

  // --- Utility functions ---

  getBadgeClass(status) {
      // No longer needed for bookings since Django template parses colors natively, 
      // but keeping it for legacy staff references in case
      switch(status.toLowerCase()) {
        case 'active': return 'badge-success';
        case 'inactive': return 'badge-secondary';
        case 'pending': return 'badge-warning';
        case 'completed': return 'badge-primary';
        case 'cancelled': return 'badge-danger';
        default: return 'badge-secondary';
      }
  }

  openAssignModal(bookingId, currentStaffId = null) {
    // Populate the hidden dropdown value using the parameter or event
    const bookingInput = document.getElementById("modalBookingId");
    if(bookingInput) {
        bookingInput.value = bookingId;
    }
    
    // Set a generic booking info HTML for the modal card header
    const infoDiv = document.getElementById("bookingInfo");
    if (infoDiv) {
        infoDiv.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <div class="bg-primary bg-opacity-10 text-primary rounded p-2 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                     <i class="bi bi-calendar-check fs-4"></i>
                </div>
                <div>
                     <h6 class="mb-1 fw-bold text-dark">${currentStaffId ? 'Reassigning' : 'Assigning'} to Booking #BKG-${bookingId.toString().padStart(4, '0')}</h6>
                     <div class="small text-muted"><i class="bi bi-info-circle me-1"></i>Please select an active staff member below.</div>
                </div>
            </div>
        `;
    }

    const select = document.getElementById("assignStaffSelect");
    if (select) {
        if (currentStaffId) {
            select.value = currentStaffId;
        } else {
            select.value = "";
        }
    }
  }

  addStaff() {
    const form = document.getElementById("addStaffForm");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      name: document.getElementById("staffName").value,
      email: document.getElementById("staffEmail").value,
      phone: document.getElementById("staffPhone").value,
      password: document.getElementById("staffPassword") ? document.getElementById("staffPassword").value : 'defaultPass123',
      role: 'staff'
    };

    fetch('/api/staff/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': this.getCookie('csrftoken')
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        this.loadStaffData();
        const modal = bootstrap.Modal.getInstance(document.getElementById("addStaffModal"));
        modal.hide();
        form.reset();
        this.showNotification("Staff member added successfully!", "success");
      } else {
        this.showNotification("Error: " + data.error, "danger");
      }
    })
    .catch(err => this.showNotification("Network error", "danger"));
  }

  addVehicle() {
    const form = document.getElementById("addVehicleForm");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const imageUrl =
      document.getElementById("shopImage").value ||
      `https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400`;

    const newShop = {
      id: Math.max(...mockData.vehicles.map((v) => v.id)) + 1,
      name: document.getElementById("shopName").value,
      address: document.getElementById("shopAddress").value,
      latitude: parseFloat(document.getElementById("shopLat").value) || 0,
      longitude: parseFloat(document.getElementById("shopLng").value) || 0,
      phone: document.getElementById("shopPhone").value,
      image: imageUrl,
      rating: parseFloat(document.getElementById("shopRating").value) || 0,
      review_count: parseInt(document.getElementById("shopReviews").value) || 0,
      operating_hours: document.getElementById("shopHours").value,
      is_open: document.getElementById("shopIsOpen").checked,
      status: "available", // To prevent breaking existing status logic just in case
    };

    mockData.vehicles.push(newShop);
    this.saveData();
    this.loadVehicleData();

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addVehicleModal"),
    );
    modal.hide();
    form.reset();

    this.showNotification("Shop added successfully!", "success");
  }



  editStaff(id) {
    const staff = mockData.staff.find((s) => s.id === id);
    document.getElementById("staffName").value = staff.name;
    document.getElementById("staffEmail").value = staff.email;
    document.getElementById("staffPhone").value = staff.phone;
    document.getElementById("staffRole").value = staff.role;

    const modal = new bootstrap.Modal(document.getElementById("addStaffModal"));
    modal.show();

    document.getElementById("saveStaffBtn").onclick = () =>
      this.updateStaff(id);
  }

  updateStaff(id) {
    const staff = mockData.staff.find((s) => s.id === id);
    staff.name = document.getElementById("staffName").value;
    staff.email = document.getElementById("staffEmail").value;
    staff.phone = document.getElementById("staffPhone").value;
    staff.role = document.getElementById("staffRole").value;

    this.saveData();
    this.loadStaffData();

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addStaffModal"),
    );
    modal.hide();

    document.getElementById("saveStaffBtn").onclick = () => this.addStaff();
    document.getElementById("addStaffForm").reset();

    this.showNotification("Staff updated successfully!", "success");
  }

  deleteStaff(id) {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this staff member?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch('/api/staff/', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCookie('csrftoken')
          },
          body: JSON.stringify({id: id})
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                this.loadStaffData();
                this.showNotification("Staff deleted successfully!", "success");
            } else {
                this.showNotification("Failed to delete: " + data.error, "danger");
            }
        })
        .catch(err => this.showNotification("Network error", "danger"));
      }
    });
  }

  editVehicle(id) {
    const shop = mockData.vehicles.find((v) => v.id === id);
    document.getElementById("shopName").value = shop.name || "";
    document.getElementById("shopAddress").value = shop.address || "";
    document.getElementById("shopLat").value = shop.latitude || 0;
    document.getElementById("shopLng").value = shop.longitude || 0;
    document.getElementById("shopPhone").value = shop.phone || "";
    document.getElementById("shopHours").value = shop.operating_hours || "";
    document.getElementById("shopRating").value = shop.rating || 0;
    document.getElementById("shopReviews").value = shop.review_count || 0;
    document.getElementById("shopImage").value = shop.image || "";
    document.getElementById("shopIsOpen").checked = shop.is_open !== false;

    const modal = new bootstrap.Modal(
      document.getElementById("addVehicleModal"),
    );
    modal.show();

    document.getElementById("saveVehicleBtn").onclick = () =>
      this.updateVehicle(id);
  }

  updateVehicle(id) {
    const shop = mockData.vehicles.find((v) => v.id === id);
    shop.name = document.getElementById("shopName").value;
    shop.address = document.getElementById("shopAddress").value;
    shop.latitude = parseFloat(document.getElementById("shopLat").value) || 0;
    shop.longitude = parseFloat(document.getElementById("shopLng").value) || 0;
    shop.phone = document.getElementById("shopPhone").value;
    shop.operating_hours = document.getElementById("shopHours").value;
    shop.rating = parseFloat(document.getElementById("shopRating").value) || 0;
    shop.review_count = parseInt(document.getElementById("shopReviews").value) || 0;
    shop.is_open = document.getElementById("shopIsOpen").checked;

    const imgUrl = document.getElementById("shopImage").value;
    if (imgUrl) shop.image = imgUrl;

    this.saveData();
    this.loadVehicleData();

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addVehicleModal"),
    );
    modal.hide();

    document.getElementById("saveVehicleBtn").onclick = () => this.addVehicle();
    document.getElementById("addVehicleForm").reset();

    this.showNotification("Shop updated successfully!", "success");
  }

  deleteVehicle(id) {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this shop?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        mockData.vehicles = mockData.vehicles.filter((v) => v.id !== id);
        this.saveData();
        this.loadVehicleData();
        this.showNotification("Shop deleted successfully!", "success");
      }
    });
  }

  updateUserDisplay() {
    // Keep server-rendered Django user info unless explicit session values exist.
    const emailElems = document.querySelectorAll(".user-email-display");
    const nameElems = document.querySelectorAll(".user-name");

    const email = sessionStorage.getItem("userEmail");
    if (!email) return;

    emailElems.forEach((el) => (el.textContent = email));

    // If the app stored an explicit name, use it.
    // Otherwise keep the server-rendered name unchanged.
    const storedName = sessionStorage.getItem("userName");
    if (storedName && nameElems.length > 0) {
      nameElems.forEach((el) => (el.textContent = storedName));
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    // Map types to text colors for the toast text
    const textClass = type === "success" ? "text-success" : "text-primary";
    const icon =
      type === "success" ? "bi-check-circle-fill" : "bi-info-circle-fill";

    notification.className = `alert bg-white shadow-lg border border-start border-4 ${type === "success" ? "border-success" : "border-primary"} position-fixed top-0 end-0 m-4 d-flex align-items-center gap-3`;
    notification.style.zIndex = "9999";
    notification.style.minWidth = "300px";
    notification.style.animation = "fadeIn 0.3s ease-out forwards";

    notification.innerHTML = `
            <i class="bi ${icon} fs-4 ${textClass}"></i>
            <div class="flex-grow-1">
                <div class="font-medium text-dark">${type === "success" ? "Success" : "Notice"}</div>
                <div class="small text-muted">${message}</div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = "0";
        notification.style.transform = "translateY(-10px)";
        notification.style.transition = "all 0.3s ease-out";
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener("DOMContentLoaded", () => {
  dashboard = new RentalDashboard();
});