document.addEventListener("DOMContentLoaded", () => {
  let allSarees = [];
  let currentUser = JSON.parse(localStorage.getItem("rajmata_session")) || null;
  let cart = [];
  let currentCategory = "All";
  let searchQuery = "";
  let sortMethod = "featured";

  const get = (id) => document.getElementById(id);

  const productGrid = get("productGrid");
  const categoryTabs = get("categoryTabs");
  const searchInput = get("searchInput");
  const sortSelect = get("sortSelect");

  const cartDrawer = get("cartDrawer");
  const drawerOverlay = get("drawerOverlay");
  const cartOpenBtn = get("cartOpenBtn");
  const cartCloseBtn = get("cartCloseBtn");
  const cartBadgeCount = get("cartBadgeCount");
  const drawerBadge = get("drawerBadge");
  const cartItemsList = get("cartItemsList");
  const cartTotalPrice = get("cartTotalPrice");

  const openCheckoutModalBtn = get("openCheckoutModalBtn");
  const checkoutModal = get("checkoutModal");
  const modalCloseBtn = get("modalCloseBtn");
  const addressForm = get("addressForm");

  const trackIdInput = get("trackIdInput");
  const trackOrderBtn = get("trackOrderBtn");
  const trackingResultContainer = get("trackingResultContainer");

  const lightboxModal = get("lightboxModal");
  const lightboxImg = get("lightboxImg");
  const lightboxCloseBtn = get("lightboxCloseBtn");

  const authModal = get("authModal");
  const authModalOpenBtn = get("authModalOpenBtn");
  const authModalCloseBtn = get("authModalCloseBtn");
  const tabLoginBtn = get("tabLoginBtn");
  const tabRegisterBtn = get("tabRegisterBtn");
  const loginForm = get("loginForm");
  const registerForm = get("registerForm");
  const userBadge = get("userBadge");
  const userNameLabel = get("userNameLabel");
  const logoutBtn = get("logoutBtn");

  const adminSection = get("adminSection");
  const customerTableBody = get("customerTableBody");
  const adminOrdersTableBody = get("adminOrdersTableBody");
  const custCount = get("custCount");
  const exportCsvBtn = get("exportCsvBtn");

  async function fetchSarees() {
    try {
      const res = await fetch('/api/sarees');
      allSarees = await res.json();
      renderProducts();
    } catch (err) {
      console.error("Failed to load sarees:", err);
    }
  }

  function renderProducts() {
    if (!productGrid) return;
    let filtered = [...allSarees];

    if (currentCategory !== "All") {
      filtered = filtered.filter(s => s.category && s.category.toLowerCase() === currentCategory.toLowerCase());
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) || 
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
    }

    if (sortMethod === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortMethod === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortMethod === "discount") {
      filtered.sort((a, b) => {
        const discA = (a.originalPrice - a.price) / a.originalPrice;
        const discB = (b.originalPrice - b.price) / b.originalPrice;
        return discB - discA;
      });
    }

    if (filtered.length === 0) {
      productGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fff; border-radius: 8px;">
          <p style="color: #666; font-size: 1.1rem;">No sarees match your search or filter.</p>
        </div>`;
      return;
    }

    const isAdmin = currentUser && currentUser.isAdmin;

    productGrid.innerHTML = filtered.map(saree => {
      const discount = saree.originalPrice > saree.price
        ? Math.round(((saree.originalPrice - saree.price) / saree.originalPrice) * 100)
        : 0;

      return `
        <article class="card">
          <div class="card-img-wrap" onclick="openLightbox('${saree.image}')">
            ${discount > 0 ? `<span class="discount-badge">${discount}% OFF</span>` : ''}
            <img src="${saree.image}" alt="${saree.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'">
            <span class="zoom-hint">🔍 Tap to inspect</span>
          </div>
          <div class="card-body">
            <span class="card-trust-pill">${saree.trustBadge || 'Silk Mark Certified'}</span>
            <span class="card-category">${saree.category}</span>
            <h3 class="card-title">${saree.name}</h3>
            <p class="card-desc">${saree.description}</p>
            
            <div class="price-container">
              <span class="discounted-price">₹${Number(saree.price).toLocaleString('en-IN')}</span>
              ${saree.originalPrice > saree.price ? `<span class="original-cut-price">₹${Number(saree.originalPrice).toLocaleString('en-IN')}</span>` : ''}
            </div>

            <button class="btn-add" onclick="addToBag(${saree.id})">Add to Bag</button>
            ${isAdmin ? `<button class="btn-delete-item" style="display:block;" onclick="deleteSaree(${saree.id})">🗑️ Delete Saree</button>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  if (categoryTabs) {
    categoryTabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.cat;
      renderProducts();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortMethod = e.target.value;
      renderProducts();
    });
  }

  if (authModalOpenBtn && authModal) {
    authModalOpenBtn.addEventListener("click", (e) => {
      e.preventDefault();
      authModal.classList.add("active");
    });
  }

  if (authModalCloseBtn && authModal) {
    authModalCloseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      authModal.classList.remove("active");
    });
  }

  if (tabLoginBtn && tabRegisterBtn && loginForm && registerForm) {
    tabLoginBtn.addEventListener("click", () => {
      tabLoginBtn.classList.add("active");
      tabRegisterBtn.classList.remove("active");
      loginForm.style.display = "flex";
      registerForm.style.display = "none";
    });

    tabRegisterBtn.addEventListener("click", () => {
      tabRegisterBtn.classList.add("active");
      tabLoginBtn.classList.remove("active");
      registerForm.style.display = "flex";
      loginForm.style.display = "none";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const phone = get("loginPhone") ? get("loginPhone").value.trim() : "";
      const pass = get("loginPassword") ? get("loginPassword").value : "";

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, pass })
        });

        const data = await res.json();
        if (res.ok) {
          currentUser = data;
          localStorage.setItem("rajmata_session", JSON.stringify(currentUser));
          syncAuthUI();
          if (authModal) authModal.classList.remove("active");
          loginForm.reset();
          alert(currentUser.isAdmin ? "Logged in with Admin privileges." : `Welcome back, ${currentUser.name}!`);
        } else {
          alert(data.error || "Invalid credentials.");
        }
      } catch (err) {
        alert("Server connection error during login.");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = get("regName") ? get("regName").value.trim() : "";
      const phone = get("regPhone") ? get("regPhone").value.trim() : "";
      const pass = get("regPassword") ? get("regPassword").value : "";

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, pass })
        });

        const data = await res.json();
        if (res.ok) {
          currentUser = data;
          localStorage.setItem("rajmata_session", JSON.stringify(currentUser));
          syncAuthUI();
          if (authModal) authModal.classList.remove("active");
          registerForm.reset();
          alert(`Welcome, ${name}! Your account is registered.`);
        } else {
          alert(data.error || "Registration failed.");
        }
      } catch (err) {
        alert("Server error during registration.");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      currentUser = null;
      localStorage.removeItem("rajmata_session");
      syncAuthUI();
    });
  }

  function syncAuthUI() {
    const isAdmin = currentUser && currentUser.isAdmin;

    if (currentUser) {
      if (authModalOpenBtn) authModalOpenBtn.style.display = "none";
      if (userBadge) userBadge.style.display = "flex";
      if (userNameLabel) userNameLabel.textContent = currentUser.name + (isAdmin ? " (Admin)" : "");

      if (adminSection) {
        if (isAdmin) {
          adminSection.classList.add("unlocked");
          fetchAdminData();
        } else {
          adminSection.classList.remove("unlocked");
        }
      }
    } else {
      if (authModalOpenBtn) authModalOpenBtn.style.display = "block";
      if (userBadge) userBadge.style.display = "none";
      if (adminSection) adminSection.classList.remove("unlocked");
    }

    renderProducts();
  }

  window.addToBag = function(id) {
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      const item = allSarees.find(s => s.id === id);
      if (item) cart.push({ ...item, quantity: 1 });
    }
    updateCartUI();
    if (cartDrawer && drawerOverlay) {
      cartDrawer.classList.add("active");
      drawerOverlay.classList.add("active");
    }
  };

  window.changeQty = function(id, delta) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    cart[idx].quantity += delta;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    updateCartUI();
  };

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalSum = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartBadgeCount) cartBadgeCount.textContent = totalCount;
    if (drawerBadge) drawerBadge.textContent = totalCount;
    if (cartTotalPrice) cartTotalPrice.textContent = `₹${totalSum.toLocaleString('en-IN')}`;

    if (!cartItemsList) return;
    if (cart.length === 0) {
      cartItemsList.innerHTML = `<p style="text-align: center; color: #888; margin-top: 2rem;">Your bag is empty.</p>`;
      return;
    }

    cartItemsList.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div style="font-weight:600; font-size:0.95rem;">${item.name}</div>
          <div style="color:var(--text-muted); font-size:0.85rem;">₹${Number(item.price).toLocaleString('en-IN')} × ${item.quantity}</div>
          <div style="margin-top:0.3rem;">
            <button onclick="changeQty(${item.id}, -1)">-</button>
            <span style="padding:0 0.5rem;">${item.quantity}</span>
            <button onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <div><strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong></div>
      </div>
    `).join('');
  }

  if (cartOpenBtn) {
    cartOpenBtn.addEventListener("click", () => {
      if (cartDrawer && drawerOverlay) {
        cartDrawer.classList.add("active");
        drawerOverlay.classList.add("active");
      }
    });
  }

  if (cartCloseBtn) {
    cartCloseBtn.addEventListener("click", () => {
      if (cartDrawer && drawerOverlay) {
        cartDrawer.classList.remove("active");
        drawerOverlay.classList.remove("active");
      }
    });
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener("click", () => {
      if (cartDrawer) cartDrawer.classList.remove("active");
      drawerOverlay.classList.remove("active");
    });
  }

  if (openCheckoutModalBtn) {
    openCheckoutModalBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        alert("Please add at least one saree to your bag first!");
        return;
      }
      if (cartDrawer && drawerOverlay) {
        cartDrawer.classList.remove("active");
        drawerOverlay.classList.remove("active");
      }

      if (currentUser) {
        if (get("custName")) get("custName").value = currentUser.name;
        if (get("custPhone")) get("custPhone").value = currentUser.phone;
      }
      if (checkoutModal) checkoutModal.classList.add("active");
    });
  }

  if (modalCloseBtn && checkoutModal) {
    modalCloseBtn.addEventListener("click", () => checkoutModal.classList.remove("active"));
  }

  if (addressForm) {
    addressForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const customer = {
        name: get("custName").value.trim(),
        phone: get("custPhone").value.trim(),
        city: get("custCity").value.trim(),
        pincode: get("custPincode").value.trim(),
        address: get("custAddress").value.trim()
      };

      const payload = {
        customer,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, category: i.category })),
        total: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)
      };

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const createdOrder = await res.json();
        const trackingId = createdOrder.id;

        let msg = `*NEW ORDER - RAJMATA SAREES*%0A`;
        msg += `--------------------------------%0A`;
        msg += `*📦 Tracking ID:* ${trackingId}%0A`;
        msg += `*👤 Name:* ${customer.name}%0A`;
        msg += `*📞 Phone:* ${customer.phone}%0A`;
        msg += `*🏠 Address:* ${customer.address}, ${customer.city} (${customer.pincode})%0A%0A`;
        msg += `*🛍️ Items Ordered:*%0A`;

        cart.forEach((item, idx) => {
          msg += `${idx + 1}. *${item.name}* (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString('en-IN')}%0A`;
        });

        msg += `--------------------------------%0A`;
        msg += `*💰 TOTAL PAYABLE:* ₹${payload.total.toLocaleString('en-IN')}%0A%0A`;
        msg += `Please confirm my order. I can track it using ID: *${trackingId}*.`;

        window.open(`https://wa.me/919322575059?text=${msg}`, "_blank");

        if (trackIdInput && trackOrderBtn) {
          trackIdInput.value = trackingId;
          trackOrderBtn.click();
          const trkSec = get("trackingSection");
          if (trkSec) trkSec.scrollIntoView({ behavior: "smooth" });
        }

        cart = [];
        updateCartUI();
        if (checkoutModal) checkoutModal.classList.remove("active");
        addressForm.reset();
      } catch (err) {
        console.error("Order error:", err);
      }
    });
  }

  window.openLightbox = function(url) {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = url;
    lightboxModal.classList.add("active");
  };

  if (lightboxCloseBtn && lightboxModal) {
    lightboxCloseBtn.addEventListener("click", () => lightboxModal.classList.remove("active"));
  }
  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) lightboxModal.classList.remove("active");
    });
  }

  if (trackOrderBtn && trackIdInput) {
    trackOrderBtn.addEventListener("click", async () => {
      const searchId = trackIdInput.value.trim().toUpperCase();
      if (!searchId) return;

      try {
        const res = await fetch(`/api/orders/${searchId}`);
        if (!res.ok) {
          alert("Tracking ID not found. Please verify your ID.");
          if (trackingResultContainer) trackingResultContainer.style.display = "none";
          return;
        }

        const order = await res.json();
        const stages = ["Placed", "Confirmed", "Dispatched", "Delivered"];
        const currentIdx = stages.indexOf(order.status);

        if (trackingResultContainer) {
          trackingResultContainer.style.display = "block";
          trackingResultContainer.innerHTML = `
            <div style="border-top: 1px solid var(--border-light); padding-top: 1.5rem; margin-top: 1.5rem;">
              <h3>Tracking Details: <span style="color:var(--gold-hover);">${order.id}</span></h3>
              <p><strong>Customer:</strong> ${order.customerName} | <strong>City:</strong> ${order.city}</p>
              <p><strong>Total:</strong> ₹${Number(order.total).toLocaleString('en-IN')} | <strong>Date:</strong> ${order.date}</p>

              <div class="tracking-stepper">
                <div class="step-node ${currentIdx >= 0 ? 'completed' : ''}">
                  <div class="step-circle">1</div>
                  <div style="font-size:0.85rem; font-weight:600;">Placed</div>
                </div>
                <div class="step-node ${currentIdx >= 1 ? 'completed' : (currentIdx === 0 ? 'active' : '')}">
                  <div class="step-circle">2</div>
                  <div style="font-size:0.85rem; font-weight:600;">Confirmed</div>
                </div>
                <div class="step-node ${currentIdx >= 2 ? 'completed' : (currentIdx === 1 ? 'active' : '')}">
                  <div class="step-circle">3</div>
                  <div style="font-size:0.85rem; font-weight:600;">Dispatched</div>
                </div>
                <div class="step-node ${currentIdx >= 3 ? 'completed' : (currentIdx === 2 ? 'active' : '')}">
                  <div class="step-circle">4</div>
                  <div style="font-size:0.85rem; font-weight:600;">Delivered</div>
                </div>
              </div>
            </div>
          `;
        }
      } catch (err) {
        console.error("Tracking lookup error:", err);
      }
    });
  }

  async function fetchAdminData() {
    try {
      const [usersRes, ordersRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/orders')
      ]);

      const users = await usersRes.json();
      const orders = await ordersRes.json();

      if (custCount) custCount.textContent = users.length;

      if (customerTableBody) {
        customerTableBody.innerHTML = users.map(u => `
          <tr>
            <td><strong>${u.name}</strong> ${u.isAdmin ? '<span style="color:var(--gold); font-size:0.75rem;">(Admin)</span>' : ''}</td>
            <td><a href="https://wa.me/91${u.phone}" target="_blank" style="color:var(--whatsapp-green); font-weight:600;">💬 ${u.phone}</a></td>
            <td>${u.flag || 'Active'}</td>
            <td>${u.joinedDate || 'N/A'}</td>
            <td>
              <button onclick="setFlag('${u.phone}', 'Flagged')">🚩 Flag</button>
              <button onclick="setFlag('${u.phone}', 'VIP')">⭐ VIP</button>
              <button onclick="setFlag('${u.phone}', 'Active')">Reset</button>
            </td>
          </tr>
        `).join('');
      }

      if (adminOrdersTableBody) {
        adminOrdersTableBody.innerHTML = orders.map(ord => `
          <tr>
            <td><strong>${ord.id}</strong></td>
            <td>${ord.customerName} (${ord.customerPhone})</td>
            <td>${ord.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</td>
            <td>₹${Number(ord.total).toLocaleString('en-IN')}</td>
            <td>
              <select class="status-select" onchange="changeOrderStatus('${ord.id}', this.value)">
                <option value="Placed" ${ord.status === 'Placed' ? 'selected' : ''}>🟡 Placed</option>
                <option value="Confirmed" ${ord.status === 'Confirmed' ? 'selected' : ''}>🔵 Confirmed</option>
                <option value="Dispatched" ${ord.status === 'Dispatched' ? 'selected' : ''}>🟣 Dispatched</option>
                <option value="Delivered" ${ord.status === 'Delivered' ? 'selected' : ''}>🟢 Delivered</option>
              </select>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.error("Admin dashboard error:", err);
    }
  }

  // Google Sheets-Ready CSV Exporter
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();

        if (!data || data.length === 0) {
          alert("No registered customer records found yet.");
          return;
        }

        const headers = [
          "Customer Name",
          "Phone Number",
          "Registered Date",
          "Status / Flag",
          "Total Orders",
          "Total Spend (INR)",
          "Preferred Fabrics"
        ];

        const escapeCell = (val) => {
          const str = String(val ?? '');
          return `"${str.replace(/"/g, '""')}"`;
        };

        const rows = data.map(c => [
          escapeCell(c.name),
          escapeCell(c.phone),
          escapeCell(c.joinedDate),
          escapeCell(c.flag),
          c.totalOrders,
          c.totalSpent,
          escapeCell(c.favoriteCategories)
        ].join(","));

        const csvString = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const downloadUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", `Rajmata_Sarees_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      } catch (err) {
        console.error("CSV Export error:", err);
        alert("Failed to export analytics data for Google Sheets.");
      }
    });
  }

  window.setFlag = async function(phone, flag) {
    await fetch(`/api/users/${phone}/flag`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag })
    });
    fetchAdminData();
  };

  window.changeOrderStatus = async function(id, status) {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    alert(`Order ${id} marked as ${status}.`);
  };

  window.deleteSaree = async function(id) {
    if (!confirm("Are you sure you want to delete this saree?")) return;
    try {
      await fetch(`/api/sarees/${id}`, { method: 'DELETE' });
      await fetchSarees();
    } catch (err) {
      alert("Failed to delete saree.");
    }
  };

  fetchSarees();
  syncAuthUI();
  updateCartUI();
});