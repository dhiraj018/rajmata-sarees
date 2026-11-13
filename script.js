// Remove the Firebase imports if you are handling the database writes purely on your backend/Render server. 
// This script handles the UI, saves the customer locally, and routes the order to WhatsApp automatically.

const accountBtn = document.getElementById('accountBtn');
const accountModal = document.getElementById('accountModal');
const closeModal = document.querySelector('.close-modal');
const loginForm = document.getElementById('loginForm');
const quickOrderBtns = document.querySelectorAll('.quick-order-btn');

// State to hold logged-in user data
let currentUser = null;

// On load, check if user is already saved in local storage
window.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('rajmata_customer');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    accountBtn.textContent = `Hi, ${currentUser.name.split(' ')[0]}`;
  }
});

// Modal Toggles
accountBtn.addEventListener('click', () => {
  if (currentUser) {
    // If already logged in, show their info in the form so they can update it
    document.getElementById('custName').value = currentUser.name;
    document.getElementById('custPhone').value = currentUser.phone;
    document.getElementById('custPin').value = currentUser.pin;
    document.getElementById('custAddress').value = currentUser.address;
  }
  accountModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
  accountModal.style.display = 'none';
});

// Handle Login / Registration
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const customerData = {
    name: document.getElementById('custName').value,
    phone: document.getElementById('custPhone').value,
    pin: document.getElementById('custPin').value,
    address: document.getElementById('custAddress').value,
  };

  // Save to local storage for automatic WhatsApp pre-fill
  localStorage.setItem('rajmata_customer', JSON.stringify(customerData));
  currentUser = customerData;
  
  // Optional: Send this data to your Node.js backend to save in Firebase securely
  /*
  try {
    await fetch('https://YOUR-RENDER-URL.onrender.com/api/save-customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
  } catch (error) {
    console.error("Cloud save failed", error);
  }
  */

  accountBtn.textContent = `Hi, ${currentUser.name.split(' ')[0]}`;
  accountModal.style.display = 'none';
  alert('Account details saved successfully!');
});

// Handle WhatsApp Checkout
quickOrderBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const itemName = e.target.getAttribute('data-name');
    const itemPrice = e.target.getAttribute('data-price');
    
    // Store WhatsApp Number (Replace with your actual business number)
    const businessWhatsApp = "919850664511"; 
    
    let message = `*NEW ORDER: RAJMATA SAREES*\n\n`;
    message += `*Item:* ${itemName}\n`;
    message += `*Price:* ₹${itemPrice}\n\n`;
    
    if (currentUser) {
      message += `*Customer Details (Cloud Synced):*\n`;
      message += `Name: ${currentUser.name}\n`;
      message += `Phone: ${currentUser.phone}\n`;
      message += `Delivery Address:\n${currentUser.address}\n`;
    } else {
      alert("Please sign in first so we can attach your delivery address to the order.");
      accountModal.style.display = 'flex';
      return; 
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${businessWhatsApp}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  });
});
