const axios = require('axios');

const GenieACS = {
  baseUrl: process.env.GENIEACS_URL || 'http://localhost:7557',
  
  async getDeviceData(deviceId) {
    try {
      const response = await axios.get(`${this.baseUrl}/devices/${deviceId}`);
      
      // Parse data yang diperlukan
      return {
        ipAddress: this.extractParameter(response.data, 'InternetGatewayDevice.IPAddress'),
        rxPower: this.extractParameter(response.data, 'InternetGatewayDevice.RXPower'),
        connectedUsers: this.extractParameter(response.data, 'InternetGatewayDevice.ConnectedUsers'),
        ssid: this.extractParameter(response.data, 'InternetGatewayDevice.WiFi.SSID'),
        password: this.extractParameter(response.data, 'InternetGatewayDevice.WiFi.Password')
      };
    } catch (err) {
      console.error('GenieACS API Error:', err);
      throw new Error('Failed to fetch device data');
    }
  },
  
  async updateWiFiSettings(deviceId, ssid, password) {
    try {
      await axios.post(`${this.baseUrl}/devices/${deviceId}/tasks`, {
        name: 'setParameterValues',
        parameterValues: [
          ['InternetGatewayDevice.WiFi.SSID', ssid],
          ['InternetGatewayDevice.WiFi.Password', password]
        ]
      });
      return true;
    } catch (err) {
      console.error('Failed to update WiFi settings:', err);
      return false;
    }
  },
  
  extractParameter(data, paramPath) {
    // Helper untuk mengekstrak nilai parameter dari response GenieACS
    try {
      return data.parameters[paramPath].value;
    } catch {
      return null;
    }
  }
};

module.exports = GenieACS; 