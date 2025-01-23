const Dashboard = {
  init: async function() {
    const dashboard = document.createElement('div');
    dashboard.className = 'modern-dashboard';
    
    // Login form yang lebih modern
    const loginForm = `
      <div class="login-wrapper">
        <div class="login-container glass-effect">
          <div class="login-header">
            <img src="/assets/logo.png" alt="Logo" class="logo">
            <h2>Welcome Back!</h2>
            <p class="subtitle">Login ke dashboard admin</p>
          </div>

          <div class="login-tabs">
            <button class="tab-btn active" data-tab="device">
              <i class="fas fa-microchip"></i>
              <span>Device ID</span>
            </button>
            <button class="tab-btn" data-tab="phone">
              <i class="fas fa-mobile-alt"></i>
              <span>Phone</span>
            </button>
          </div>

          <form id="loginForm" class="animated-form">
            <div class="input-group device-input active">
              <div class="input-wrapper">
                <i class="fas fa-microchip input-icon"></i>
                <input type="text" id="deviceId" placeholder="Masukkan Device ID">
                <span class="input-focus-border"></span>
              </div>
            </div>

            <div class="input-group phone-input">
              <div class="input-wrapper">
                <i class="fas fa-phone input-icon"></i>
                <input type="tel" id="phoneNumber" placeholder="Masukkan Nomor Telepon">
                <span class="input-focus-border"></span>
              </div>
            </div>

            <div class="error-message" style="display:none;">
              <i class="fas fa-exclamation-circle"></i>
              <span></span>
            </div>

            <button type="submit" class="login-btn">
              <span>Login</span>
              <i class="fas fa-arrow-right"></i>
            </button>
          </form>
        </div>
      </div>
    `;

    // Dashboard content yang lebih modern
    const dashboardContent = `
      <div class="dashboard-content" style="display:none">
        <nav class="top-nav glass-effect">
          <div class="nav-left">
            <img src="/assets/logo-small.png" alt="Logo" class="nav-logo">
            <h3>Admin Dashboard</h3>
          </div>
          <div class="nav-right">
            <div class="user-profile">
              <img src="/assets/avatar.png" alt="Profile" class="avatar">
              <span class="username">Admin</span>
            </div>
            <button class="logout-btn">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </nav>

        <div class="dashboard-grid">
          <div class="stats-section">
            <div class="stats-grid">
              <div class="stat-card glass-effect">
                <div class="stat-icon">
                  <i class="fas fa-network-wired"></i>
                </div>
                <div class="stat-info">
                  <h3>IP Address</h3>
                  <div id="ipAddress" class="stat-value">-</div>
                </div>
              </div>

              <div class="stat-card glass-effect">
                <div class="stat-icon">
                  <i class="fas fa-signal"></i>
                </div>
                <div class="stat-info">
                  <h3>RX Power</h3>
                  <div id="rxPower" class="stat-value">-</div>
                </div>
              </div>

              <div class="stat-card glass-effect">
                <div class="stat-icon">
                  <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                  <h3>Connected Users</h3>
                  <div id="connectedUsers" class="stat-value">-</div>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <div class="wifi-settings glass-effect">
              <div class="settings-header">
                <i class="fas fa-wifi"></i>
                <h3>WiFi Settings</h3>
              </div>
              <form id="wifiForm">
                <div class="input-wrapper">
                  <i class="fas fa-broadcast-tower input-icon"></i>
                  <input type="text" id="ssid" placeholder="SSID">
                </div>
                <div class="input-wrapper">
                  <i class="fas fa-key input-icon"></i>
                  <input type="password" id="password" placeholder="Password">
                </div>
                <button type="submit" class="update-btn">
                  <i class="fas fa-save"></i>
                  <span>Update Settings</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    dashboard.innerHTML = loginForm + dashboardContent;
    document.body.appendChild(dashboard);
    
    this.setupEventListeners();
  },

  setupEventListeners: function() {
    // Login handler
    this.setupLoginHandlers();

    // WiFi settings update handler
    document.getElementById('wifiForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const ssid = document.getElementById('ssid').value;
      const password = document.getElementById('password').value;
      await this.updateWiFiSettings(ssid, password);
    });
  },

  setupLoginHandlers: function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const deviceInput = document.querySelector('.device-input');
    const phoneInput = document.querySelector('.phone-input');
    const errorMessage = document.querySelector('.error-message');
    
    // Tab switching
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (btn.dataset.tab === 'device') {
          deviceInput.classList.add('active');
          phoneInput.classList.remove('active');
          document.getElementById('deviceId').required = true;
          document.getElementById('phoneNumber').required = false;
        } else {
          phoneInput.classList.add('active');
          deviceInput.classList.remove('active');
          document.getElementById('deviceId').required = false;
          document.getElementById('phoneNumber').required = true;
        }
      });
    });

    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.style.display = 'none';
      
      const deviceId = document.getElementById('deviceId').value;
      const phoneNumber = document.getElementById('phoneNumber').value;
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ deviceId, phoneNumber })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Simpan token di localStorage
          localStorage.setItem('dashboardToken', data.token);
          localStorage.setItem('userData', JSON.stringify(data.user));
          
          // Tampilkan dashboard
          document.querySelector('.login-container').style.display = 'none';
          document.querySelector('.dashboard-content').style.display = 'block';
          
          // Load data dashboard
          this.loadDashboardData(data.user.deviceId);
        } else {
          errorMessage.textContent = data.message;
          errorMessage.style.display = 'block';
        }
      } catch (err) {
        errorMessage.textContent = 'Terjadi kesalahan saat login';
        errorMessage.style.display = 'block';
      }
    });
  },

  loadDashboardData: async function(deviceId) {
    // Fetch data dari GenieACS API
    try {
      const response = await fetch(`/api/device-data/${deviceId}`);
      const data = await response.json();
      
      document.getElementById('ipAddress').textContent = data.ipAddress;
      document.getElementById('rxPower').textContent = data.rxPower + ' dBm';
      document.getElementById('connectedUsers').textContent = data.connectedUsers;
      
      document.getElementById('ssid').value = data.ssid;
      document.getElementById('password').value = data.password;
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  },

  updateWiFiSettings: async function(ssid, password) {
    try {
      const response = await fetch('/api/update-wifi', {
        method: 'POST',
        body: JSON.stringify({ ssid, password })
      });
      
      if (response.ok) {
        alert('WiFi settings updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update WiFi settings:', err);
      alert('Failed to update WiFi settings');
    }
  }
};

export default Dashboard; 