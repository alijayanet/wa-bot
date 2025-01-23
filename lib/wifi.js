const axios = require("axios")
const { fetchText, fetchJson } = require('../tools/fetcher')
const config = require('../config.json')

const setPassword = (deviceId, newPassword) => axios.post(config.genieacsBaseUrl + "/devices/" + deviceId + "/tasks?connection_request", {
    name: 'setParameterValues',
    parameterValues: [
        ["InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.PreSharedKey.1.PreSharedKey", newPassword, "xsd:string"]
    ]
});

const setSSIDName = (deviceId, newName) => axios.post(config.genieacsBaseUrl + "/devices/" + deviceId + "/tasks?connection_request", {
    name: 'setParameterValues',
    parameterValues: [
        ["InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.SSID", newName, "xsd:string"]
    ]
});

const getDeviceByIdentifier = async (identifier) => {
    let query = { _id: identifier };
    let queryUrl = `${config.genieacsBaseUrl}/devices?query=${encodeURIComponent(JSON.stringify(query))}`;
    let response = await axios.get(queryUrl);
    let devices = response.data;

    if (devices.length === 0) {
        query = { "VirtualParameters.pppUsername": identifier };
        queryUrl = `${config.genieacsBaseUrl}/devices?query=${encodeURIComponent(JSON.stringify(query))}&projection=_id`;
        response = await axios.get(queryUrl);
        devices = response.data;
    }

    if (devices.length === 0) {
        throw new Error(`No device found for ${identifier}.`);
    }

    return devices[0]._id;
};


const ubahPass = async (identifier, newPassword) => {
    try {
        const deviceId = await getDeviceByIdentifier(identifier);
        await setPassword(deviceId, newPassword);

        return `Password WiFi Anda Telah Berhasil Dirubah.`;
    } catch (error) {
        console.error('Failed to change password:', error);
        return `Gagal Mengubah Password WiFi\n\nSilahkan Cek Format Password Atau Hubungi Admin\n\nTerimakasih\n\n${config.namabot}`;
    }
};

const ubahSSID = async (identifier, newSSID) => {
    try {
        const deviceId = await getDeviceByIdentifier(identifier);
        await setSSIDName(deviceId, newSSID);

        return `Nama Wifi Anda Telah Berhasil Dirubah:\n\n==============\n${newSSID}\n==============\n\n${config.namabot}`;
    } catch (error) {
        console.error('Failed to change SSID:', error);
        return `Gagal Mengubah Nama Wifi\n\nSilahkan Cek Format Nama Wifi Atau Hubungi Admin\n\nTerimakasih\n\n${config.namabot}`;
    }
};

const getSSIDInfo = async (deviceId) => {
    const response = await axios.get(config.genieacsBaseUrl + "/devices/?query=" + encodeURIComponent(JSON.stringify({ _id: deviceId })));
    const data = response.data[0];

    return {
        uptime: data.VirtualParameters.uptimeDevice._value,
        ssidName: data.InternetGatewayDevice.LANDevice['1'].WLANConfiguration['1'].SSID._value,
        totalAssociation: data.InternetGatewayDevice.LANDevice['1'].WLANConfiguration['1'].TotalAssociations._value,
        transmitPower: data.InternetGatewayDevice.LANDevice['1'].WLANConfiguration['1'].TransmitPower._value
    };
};

const getDeviceInfo = async (identifier) => {
  try {
    let query = { _id: identifier };
    let queryUrl = `${config.genieacsBaseUrl}/devices?query=${encodeURIComponent(JSON.stringify(query))}`;
    let response = await axios.get(queryUrl);
    let devices = response.data;

    if (devices.length === 0) {
      query = { "VirtualParameters.pppUsername": identifier };
      queryUrl = `${config.genieacsBaseUrl}/devices?query=${encodeURIComponent(JSON.stringify(query))}`;
      response = await axios.get(queryUrl);
      devices = response.data;
      if (devices.length === 0) {
        throw new Error(`No device found for ${identifier}.`);
      }
    }

    const deviceId = devices[0]._id;

    const generateUrl = (projection) => `${config.genieacsBaseUrl}/devices?query=${encodeURIComponent(JSON.stringify({_id: deviceId}))}&projection=${projection}`;
    
    const infoUrls = {
      model_name: generateUrl('InternetGatewayDevice.DeviceInfo.ModelName'),
      ssid: generateUrl('InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.SSID'),
      connected: generateUrl('VirtualParameters.userconnected'),
      redaman: generateUrl('VirtualParameters.redaman'),
      temp: generateUrl('VirtualParameters.temp'),
      uptime: generateUrl('VirtualParameters.uptimeDevice'),
      username: generateUrl('VirtualParameters.pppUsername'),
      ipaddress: generateUrl('VirtualParameters.pppIP'),
      lokasi: generateUrl('_tags'),
      inform: `${config.genieacsBaseUrl}/devices?query=${encodeURIComponent(JSON.stringify({_id: deviceId}))}&projection=_lastInform`
    };

    const responses = await Promise.all(Object.values(infoUrls).map(url => axios.get(url).then(res => res.data)));

    const modelName = responses[0][0].InternetGatewayDevice.DeviceInfo.ModelName?._value || 'Model Name Not Found';
    const ssid = responses[1][0].InternetGatewayDevice.LANDevice['1'].WLANConfiguration['1'].SSID?._value || 'SSID Not Found';
    const connected = responses[2][0].VirtualParameters.userconnected?._value || 'User Connected Not Found';
    const redaman = responses[3][0].VirtualParameters.redaman?._value || 'Redaman Not Found';
    const temp = responses[4][0].VirtualParameters.temp?._value || 'Temperature Not Found';
    const uptime = responses[5][0].VirtualParameters.uptimeDevice?._value || 'Uptime Not Found';
    const username = responses[6][0].VirtualParameters.pppUsername?._value || 'Username Not Found';
    const ipaddress = responses[7][0].VirtualParameters.pppIP?._value || 'IP Address Not Found';
    const lokasi = responses[8][0]._tags || 'belum ditentukan';

    const informTimeStr = responses[9][0]._lastInform;
    const informTime = new Date(informTimeStr);
    const currentTime = new Date();

    const onlineThreshold = new Date(currentTime.getTime() - 5 * 60000); // 5 minutes
    const offlineThreshold = new Date(currentTime.getTime() - 24 * 60 * 60000); // 1 day

    let status;
    if (informTime > onlineThreshold) {
      status = "Online \u{1F7E2}";  // Green Circle (Unicode)
    } else if (informTime > offlineThreshold) {
      status = "Offline \u{1F534}"; // Red Circle (Unicode)
    } else {
      status = "Isolir \u{26AB}"; // Black Circle (Unicode)
    }

    return {
      modelName,
      ssid,
      connected,
      redaman,
      temp,
      uptime,
      username,
      ipaddress,
      lokasi,
      status
    };
  } catch (error) {
    console.error('Failed to fetch device data:', error);
    throw error;
  }
};

const rebootModem = async (identifier) => {
  try {
    if (!identifier) {
      return "Please provide a device ID or pppUsername. Usage: /reboot <device_id or pppUsername>";
    }

    // Coba untuk menemukan perangkat berdasarkan device_id
    let query = { _id: identifier };
    let queryUrl = `${config.genieacsBaseUrl}/devices?query=${encodeURIComponent(JSON.stringify(query))}`;
    let response = await axios.get(queryUrl);
    let devices = response.data;

    if (devices.length === 0) {
      // Jika tidak ditemukan, coba untuk menemukan berdasarkan pppUsername
      query = { "VirtualParameters.pppUsername": identifier };
      queryUrl = `${config.genieacsBaseUrl}/devices?query=${encodeURIComponent(JSON.stringify(query))}&projection=_id`;
      response = await axios.get(queryUrl);
      devices = response.data;
      if (devices.length === 0) {
        return `No device found for ${identifier}.`;
      }
    }

    const deviceId = devices[0]._id;

    // Kirim perintah reboot ke perangkat
    const taskData = { name: 'reboot' };
    const url = `${config.genieacsBaseUrl}/devices/${deviceId}/tasks?connection_request`;
    response = await axios.post(url, taskData);

    if (response.status === 202) {
      return "Modem reboot command has been accepted and is being processed.";
    } else if (response.status === 200) {
      return "Modem reboot command successfully sent.";
    } else {
      return `Failed to send modem reboot command. Status code: ${response.status}`;
    }
  } catch (error) {
    console.error('Failed to send modem reboot command:', error);
    return `Failed to send modem reboot command: ${error.message}`;
  }
};

const refreshModem = (deviceId) => {
    return axios.post(`${config.genieacsBaseUrl}/devices/${deviceId}/tasks?timeout=3000&connection_request`, {
        name: 'refreshObject',
        objectName: 'InternetGatewayDevice'
    })
    .then(response => {
        if (response.status === 202) {
            return "Modem refresh command has been accepted and is being processed.";
        } else if (response.status === 200) {
            return "Modem refresh command successfully sent.";
        } else {
            throw new Error(`Failed to send modem refresh command. Status code: ${response.status}`);
        }
    })
    .catch(error => {
        throw new Error(`Failed to send modem refresh command: ${error.message}`);
    });
};

const getClientInfo = async (identifier) => {
  try {
    if (!identifier) {
      throw new Error("Please provide a device ID or pppUsername.");
    }

    // Mencoba menemukan perangkat berdasarkan ID perangkat
    let query = { _id: identifier };
    let queryUrl = `${config.genieacsBaseUrl}/devices?query=${encodeURIComponent(JSON.stringify(query))}`;
    let response = await axios.get(queryUrl);
    let devices = response.data;

    if (!devices.length) {
      // Jika tidak ditemukan, coba mencari berdasarkan pppUsername
      query = { "VirtualParameters.pppUsername": identifier };
      queryUrl = `${config.genieacsBaseUrl}/devices?query=${encodeURIComponent(JSON.stringify(query))}&projection=_id`;
      response = await axios.get(queryUrl);
      devices = response.data;
      if (!devices.length) {
        throw new Error(`No device found for ${identifier}.`);
      }
    }

    const deviceId = devices[0]._id;

    // Mendapatkan informasi perangkat yang terhubung dengan projection yang sesuai
    const projection = [
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.AssociatedDevice',
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.2.AssociatedDevice',
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.3.AssociatedDevice',
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.4.AssociatedDevice',
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.5.AssociatedDevice',
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.6.AssociatedDevice',
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.7.AssociatedDevice',
      'InternetGatewayDevice.LANDevice.1.WLANConfiguration.8.AssociatedDevice'
    ].join(',');

    const clientInfoUrl = `${config.genieacsBaseUrl}/devices?query=${encodeURIComponent(JSON.stringify({ _id: deviceId }))}&projection=${encodeURIComponent(projection)}`;
    const clientInfoResponse = await axios.get(clientInfoUrl);
    const clientInfoData = clientInfoResponse.data;

    // Mengumpulkan semua associated devices dari konfigurasi WLAN yang relevan
    let associatedDevices = {};
    for (const configKey in clientInfoData[0]?.InternetGatewayDevice?.LANDevice?.['1']?.WLANConfiguration) {
      const wlanConfig = clientInfoData[0].InternetGatewayDevice.LANDevice['1'].WLANConfiguration[configKey];
      if (wlanConfig?.AssociatedDevice) {
        Object.assign(associatedDevices, wlanConfig.AssociatedDevice);
      }
    }

    // Tentukan parameter berdasarkan vendor jika tersedia
    const getDescription = (device) => device.X_HW_AssociatedDevicedescriptions?._value || 
      device.X_ZTE_COM_AssociatedDeviceName?._value || 
      device.X_ZTE_COM_DeviceName?._value || 
      'Deskripsi Tidak Tersedia';
    const getMac = (device) => device.AssociatedDeviceMACAddress?._value || 'MAC Tidak Tersedia';
    const getIp = (device) => device.AssociatedDeviceIPAddress?._value || 'IP Tidak Tersedia';
    const getSignalQuality = (device) => device.X_HW_SingalQuality?._value || 'Kualitas Sinyal Tidak Tersedia';

    if (Object.keys(associatedDevices).length === 0) {
      throw new Error("No associated devices found.");
    }

    // Mengambil setiap perangkat yang terhubung dari objek AssociatedDevice
    const connectedClients = Object.values(associatedDevices)
      .map((device, index) => {
        const ip = getIp(device);
        const mac = getMac(device);
        const signalQuality = getSignalQuality(device);
        const description = getDescription(device);

        // Hanya menampilkan data yang tersedia
        if (description === 'Deskripsi Tidak Tersedia' &&
            mac === 'MAC Tidak Tersedia' &&
            ip === 'IP Tidak Tersedia' &&
            signalQuality === 'Kualitas Sinyal Tidak Tersedia') {
          return null; // Tidak termasuk perangkat dengan semua data tidak tersedia
        }

        let details = `No: ${index + 1}\n`;
        if (description) details += `Nama Perangkat: ${description}\n`;
        if (mac) details += `MAC: ${mac}\n`;
        if (ip) details += `IP: ${ip}\n`;
        if (signalQuality) details += `Signal: ${signalQuality}\n`;

        return details;
      })
      .filter(detail => detail) // Filter out null values
      .join('\n');

    return `Perangkat Terhubung: ${Object.keys(associatedDevices).length}\n${connectedClients || 'Tidak ada perangkat yang terhubung'}`;
  } catch (error) {
    console.error('Gagal mendapatkan informasi klien:', error);
    throw error;
  }
};

module.exports = {
    setPassword,
    setSSIDName,
    getDeviceInfo,
    rebootModem,
    refreshModem,
    getClientInfo,
    ubahSSID,
    ubahPass
};