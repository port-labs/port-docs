// Check for existing token and update button state
const hasToken = sessionStorage.getItem('portToken');
if (hasToken) {
  document.querySelector('.header-port-login')?.classList.add('has-token');
}

// Add click handler to the button
document.querySelector('.header-port-login')?.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();

  const modal = document.createElement('div');
  modal.className = 'port-login-modal';
  modal.innerHTML = `
    <div class="port-login-modal-content">
      <h2>Port Authentication</h2>
      <p>Please provide your Port bearer token to enable interactive features across the documentation.</p>
      <p>You can find your token in the Port platform under Settings → API Access.</p>
      <input type="password" class="port-login-token-input" placeholder="Enter your Port bearer token">
      <div class="port-login-modal-buttons">
        <button class="port-login-button port-login-cancel">Cancel</button>
        <button class="port-login-button port-login-save">Save Token</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  function closeModal() {
    document.body.removeChild(modal);
  }

  modal.querySelector('.port-login-cancel').addEventListener('click', closeModal);
  
  modal.querySelector('.port-login-save').addEventListener('click', () => {
    const token = modal.querySelector('.port-login-token-input').value;
    if (token) {
      sessionStorage.setItem('portToken', token);
      document.querySelector('.header-port-login').classList.add('has-token');
      closeModal();
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}); 