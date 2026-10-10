/**
 * Toast Notification Utility
 */
export const toast = {
  success: (message) => {
    showToastNotification(message, 'success');
  },
  error: (message) => {
    showToastNotification(message, 'error');
  },
  info: (message) => {
    showToastNotification(message, 'info');
  },
};

const activeToasts = new Set();

function showToastNotification(message, type = 'info') {
  if (activeToasts.has(message)) return;
  activeToasts.add(message);

  let container = document.getElementById('norozz-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'norozz-toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  toastEl.style.cssText = `
    min-width: 280px;
    max-width: 400px;
    padding: 12px 18px;
    border-radius: 12px;
    color: #ffffff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    pointer-events: auto;
    animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    background: ${
      type === 'success'
        ? 'linear-gradient(135deg, #059669, #10b981)'
        : type === 'error'
        ? 'linear-gradient(135deg, #dc2626, #f87171)'
        : 'linear-gradient(135deg, #2563eb, #3b82f6)'
    };
  `;

  toastEl.innerHTML = `<span>${message}</span>`;
  
  const closeBtn = document.createElement('span');
  closeBtn.style.cssText = 'cursor:pointer; opacity:0.8; font-weight:bold;';
  closeBtn.textContent = '✕';
  closeBtn.onclick = () => {
    toastEl.remove();
    activeToasts.delete(message);
  };
  toastEl.appendChild(closeBtn);

  container.appendChild(toastEl);

  const removeToast = () => {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateY(10px)';
    toastEl.style.transition = 'all 0.3s ease';
    toastEl.addEventListener('transitionend', () => {
      toastEl.remove();
      activeToasts.delete(message);
    }, { once: true });
  };

  setTimeout(removeToast, 4000);
}
