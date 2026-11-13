const accountBtn = document.getElementById('accountBtn');
const accountModal = document.getElementById('accountModal');
const closeModal = document.querySelector('.close-modal');
const loginForm = document.getElementById('loginForm');
const quickOrderBtns = document.querySelectorAll('.quick-order-btn');

let currentUser = null;

window.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('rajmata_customer');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    accountBtn.textContent = `Hi, ${currentUser.name.split(' ')[0]}`;
  }
});

accountBtn.addEventListener('click', () => {
  if (currentUser) {
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

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const customerData = {
    name: document.getElementById('custName').value,
    phone: document.getElementById('custPhone').value,
    pin: document.getElementById('custPin').value,
    address: document.getElementById('custAddress').value,
  };

  localStorage.setItem('rajmata_customer', JSON.stringify(customerData));
  currentUser = customerData;
  
  accountBtn.textContent = `Hi, ${currentUser.name.split(' ')[0]}`;
  accountModal.style.display = 'none';
  alert('Account details saved successfully!');
});

quickOrderBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const itemName = e.target.getAttribute('data-name');
    const itemPrice = e.target.getAttribute('data-price');
    
    const businessWhatsApp = "919850664511"; 
    
    let message = `*NEW ORDER: RAJMATA SAREES*\n\n`;
    message += `*Item:* ${itemName}\n`;
    message += `*Price:* ₹${itemPrice}\n\n`;
    
    if (currentUser) {
      message += `*Customer Details:*\n`;
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
