"use strict";

//Module
const { 
MessageType,
Mimetype,
downloadContentFromMessage
 } = require("@adiwajshing/baileys");
const chokidar = require('chokidar');
const fs = require("fs");
const usersFilePath = './database/users.json';
const axios = require('axios');

// Fungsi untuk memuat data dari file JSON
function loadUsers() {
    return JSON.parse(fs.readFileSync(usersFilePath));
}

// Inisialisasi pengguna dari file JSON
let users = loadUsers();

// Memantau perubahan pada file JSON
chokidar.watch(usersFilePath).on('change', (path) => {
    console.log(`${path} has been changed`);
    users = loadUsers();
});

//Library
const { color, bgcolor } = require("../lib/color");
const setting = JSON.parse(fs.readFileSync('./config.json'));
const { getBuffer, fetchJson, fetchText, getRandom, getGroupAdmins, runtime, sleep, convert, convertGif } = require("../lib/myfunc");
const { wifimenu, customermenu } = require("./wifi");
const { setPassword, setSSIDName, getDeviceInfo, rebootModem, refreshModem, getClientInfo, ubahSSID, ubahPass  } = require('../lib/wifi');


//Database
//let reseller = JSON.parse(fs.readFileSync('./database/reseller.json'));
// let statik = JSON.parse(fs.readFileSync('./database/statik.json'));
// let voucher = JSON.parse(fs.readFileSync('./database/voucher.json'));
// let atm = JSON.parse(fs.readFileSync('./database/user/atm.json'));

let {
    ownerNumber,
    nama,
    namabot,
    parentbinding,
    telfon
} = setting

module.exports = { users };
module.exports = async(idoy, msg, m) => {
    try {
        const fromMe = msg.key.fromMe
		const from = msg.key.remoteJid
		const type = Object.keys(msg.message)[0]
        const content = JSON.stringify(msg.message)
		const chats = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type == 'documentMessage') && msg.message.documentMessage.caption ? msg.message.documentMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type == 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type == 'buttonsResponseMessage' && msg.message.buttonsResponseMessage.selectedButtonId) ? msg.message.buttonsResponseMessage.selectedButtonId : (type == 'templateButtonReplyMessage') && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : ""
        if (idoy.multi){
		    var prefix = /^[°•π÷×¶∆£¢€¥®™✓=|!?#%^&.+,\/\\©^]/.test(chats) ? chats.match(/^[°•π÷×¶∆£¢€¥®™✓=|!?#%^&.+,\/\\©^]/gi) : '#'
        } else {
            if (idoy.nopref){
                prefix = ''
            } else {
                prefix = idoy.prefa
            }
        }
		const args = chats.split(' ')
		const command = chats.toLowerCase().split(' ')[0] || ''
        const isGroup = msg.key.remoteJid.endsWith('@g.us')
        const sender = isGroup ? msg.participant : msg.key.remoteJid
        const pushname = msg.pushName
        const isCmd = command.startsWith(prefix)
        const q = chats.slice(command.length + 1, chats.length)
        const body = chats.startsWith(prefix) ? chats : ''
        const botNumber = idoy.user.id.split(':')[0] + '@s.whatsapp.net'
        const groupMetadata = isGroup ? await idoy.groupMetadata(from) : ''
		const groupName = isGroup ? groupMetadata.subject : ''
		const groupId = isGroup ? groupMetadata.jid : ''
		const groupMembers = isGroup ? groupMetadata.participants : ''
		const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
		const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
		const isGroupAdmins = groupAdmins.includes(sender) || false

        const isOwner = ownerNumber.includes(sender)
		const isUrl = (uri) => {
			return uri.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.#?&/=]*)/, 'gi'))
		}

        const isImage = (type === 'imageMessage')
        const isVideo = (type === 'videoMessage')
        const isSticker = (type == 'stickerMessage')
        const isList = (type == 'listResponseMessage')
        const isButton = (type == 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage.selectedDisplayText : ''
		const isSelectedButton = (type == 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage.selectedButtonId : ''
        const isViewOnce = (type == 'viewOnceMessage')
        const isQuotedMsg = (type == 'extendedTextMessage')
        const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') ? true : false : false
        const isQuotedAudio = isQuotedMsg ? content.includes('audioMessage') ? true : false : false
        const isQuotedDocument = isQuotedMsg ? content.includes('documentMessage') ? true : false : false
        const isQuotedVideo = isQuotedMsg ? content.includes('videoMessage') ? true : false : false
        const isQuotedSticker = isQuotedMsg ? content.includes('stickerMessage') ? true : false : false
        const isQuotedList = isQuotedMsg ? content.includes('listResponseMessage') ? true : false : false
        const isQuotedButton = isQuotedMsg ? content.includes('buttonsResponseMessage') ? true : false : false
        const isQuotedContact = isQuotedMsg ? content.includes('contactMessage') ? true : false : false
        const reply = (teks) => {
            idoy.sendMessage(from, { text: teks }, { quoted: msg });
        }

        let sendContact = (jid, numbers, name, quoted) => {
            let number = numbers.replace(/[^0-9]/g, '')
            const vcard = 'BEGIN:VCARD\n' 
            + 'VERSION:3.0\n' 
            + 'FN:' + name + '\n'
            + 'ORG:;\n'
            + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n'
            + 'END:VCARD'
            return idoy.sendMessage(from, { contacts: { displayName: name, contacts: [{ vcard }] } },{ quoted: quoted })
        }


		//Respon Halo Dll
		if (['bot', 'hallo', 'halo', 'hi', 'hai', 'min', 'kak', 'mas'].includes(chats.toLowerCase())) {
			reply(`Hai kak, ${pushname}\nDengan Bot ada yang bisa saya bantu?\n\nSilahkan Ketik _*menu*_ untuk melihat menu yang tersedia.`)
		}
    //Respon Menu Wifi
	if (chats.toLowerCase() === 'menu') {
            reply(wifimenu(pushname, nama, namabot))
	}
    //Respon Menu Pelanggan
	if (chats.toLowerCase() === 'perintah') {
        const user = users.find(v => v.phone_number == (/^([^:@]+)[:@]?.*$/.exec(sender)[1]));
        if(!user) return reply("Anda tidak terdaftar di dalam database pelanggan kami.");
        reply(customermenu(nama, namabot))
    }

		// Respon Command Wifi
		if (chats.toLowerCase() === 'admin') {
			sendContact(from, `${ownerNumber[0]}`, `Admin ${nama}`, msg)
		}
		switch (command) {

            //GenieACS Change SSID
case 'ubahwifi': {
    const user = users.find(v => v.phone_number == (/^([^:@]+)[:@]?.*$/.exec(sender)[1]));
    if (!user) {
        return reply("Anda tidak terdaftar di dalam database pelanggan kami.");
    }

    const identifier = user.device_id || user.pppoe_username; // Ambil device_id atau pppUsername jika tersedia
    if (!identifier) {
        return reply("Device ID atau PPP Username tidak ditemukan.");
    }

    const newSSID = args.slice(1).join(' '); // Ambil SSID baru dari argumen
    if (!newSSID) {
        return reply("Silahkan isi Nama Wifi baru. Contoh: ubahwifi <new_SSID>");
    }

    try {
        const result = await ubahSSID(identifier, newSSID);
        reply(result);
    } catch (error) {
        console.error('Gagal Mengubah Nama Wifi:', error);
        reply(`Gagal Mengubah Nama Wifi\n\nSilahkan Hubungi Admin\n\nTerimakasih\n\n${config.namabot}`);
    }
}
break;
            //GenieACS Change Pass
case 'ubahsandi': {
    const user = users.find(v => v.phone_number == (/^([^:@]+)[:@]?.*$/.exec(sender)[1]));
    if (!user) {
        return reply("Anda tidak terdaftar di dalam database pelanggan kami.");
    }

    const identifier = user.device_id || user.pppoe_username; // Ambil device_id atau pppUsername jika tersedia
    if (!identifier) {
        return reply("Device ID atau PPP Username tidak ditemukan.");
    }

    const newPassword = args.slice(1).join(' '); // Ambil password baru dari argumen
    if (!newPassword) {
        return reply("Silahkan isi Password WiFi baru. Contoh: ubahsandi <new_password>");
    }

    try {
        const result = await ubahPass(identifier, newPassword);
        reply(result);
    } catch (error) {
        console.error('Gagal Mengubah Password WiFi:', error);
        reply(`Gagal Mengubah Password WiFi\n\nSilahkan Hubungi Admin\n\nTerimakasih\n\n${config.namabot}`);
    }
}
break;
            //Change Power Modem
            case 'gantipower': {
                const user = users.find(v => v.phone_number == (/^([^:@]+)[:@]?.*$/.exec(sender)[1]));
                if(!user) return reply("Anda tidak terdaftar di dalam database pelanggan kami.");
                if (user.subscription == 'PAKET-VOUCHER') return reply("Mohon maaf fitur ini hanya bisa dipakai pada pelanggan bulanan.");
                if (!q) return reply(`Silahkan Isi Berapa Power Wifi\n\nContoh : gantipower 80\n\nFungsi : Untuk Mengatur Luas Jangkauan Wifi\n\nNB : Untuk Power Hanya Bisa Diisi 100, 80, 60, 40, 20.`);
                if(!['100', '80', '60', '40', '20'].includes(q)){return reply(`*ERROR!*\n\nSilahkan Cek format gantipower dan coba lagi.\n\nTerimakasih\n${namabot}`)};
                axios.post(setting.genieacsBaseUrl + "/devices/" + user.device_id + "/tasks?connection_request", {
                  name: 'setParameterValues',
                  parameterValues: [
                    ["InternetGatewayDevice.LANDevice.1.WLANConfiguration.1.TransmitPower", `${q}`, "xsd:string"]
                  ]
                })
                .then(response => {
                    console.log(response.data);
                    reply(`Power Wifi Berhasil Dirubah Ke :\n\n==============\n${q}%\n==============\n\n${namabot}`)
                })
                  .catch(error => {
                    console.error(error);
                    reply(`Gagal Mengubah Power Wifi\n\nSilahkan Cek Format Power Wifi Atau Hubungi Admin\n\nTerimakasih\n\n${namabot}`)
                  });}
                break
            

//Reboot Modem
case 'reboot': {
    const user = users.find(v => v.phone_number == (/^([^:@]+)[:@]?.*$/.exec(sender)[1]));
    if (!user) {
        return reply("Anda tidak terdaftar di dalam database pelanggan kami.");
    }

    const identifier = user.device_id || user.pppoe_username; // Ambil device_id atau pppUsername jika tersedia
    if (!identifier) {
        return reply("Device ID atau PPP Username tidak ditemukan.");
    }

    try {
        const result = await rebootModem(identifier);
        reply(result);
    } catch (error) {
        console.error('Gagal Reboot Modem:', error);
        reply(`Gagal Reboot Modem\n\nSilahkan Hubungi Admin\n\nTerimakasih\n\n${namabot}`);
    }
}
break;

            //Monitoring All Modem
            case 'monitorwifi': {
                if(!isOwner) return reply("Menu Khusus Owner.");
                let replyMsg = "> INFO PELANGGAN\n\n"
                await axios.get(setting.genieacsBaseUrl + "/devices").then(({ data }) => {
                    data.forEach(s => {
                        let u = users.find(v => v.device_id == s._id);
                        if (u){
                        replyMsg += `*ID* : ${u?.id || "Tidak Terdaftar"}\n*Name* : ${u?.name  || "Tidak Terdaftar"}\n*◉SSID* : ${s.InternetGatewayDevice.LANDevice['1'].WLANConfiguration['1'].SSID._value}\n*◉Jumlah Device Terkoneksi* : ${s.InternetGatewayDevice.LANDevice['1'].WLANConfiguration['1'].TotalAssociations._value}\n*◉Transmit Power Wifi* : ${s.InternetGatewayDevice.LANDevice['1'].WLANConfiguration['1'].TransmitPower._value}%\n*◉Uptime Perangkat* : ${s.VirtualParameters.uptimeDevice._value}\n\n`
                }})
                    return replyMsg;
                })
                replyMsg += "\n\n\n" + namabot;
                reply(replyMsg)
              }
            break   
//Monitoring Modem client                 
case 'cekdevice': {
    const user = users.find(v => v.phone_number == (/^([^:@]+)[:@]?.*$/.exec(sender)[1]));
    if (!user) {
        return reply("Anda tidak terdaftar di dalam database pelanggan kami.");
    }
    try {
        // Mencoba untuk menemukan perangkat menggunakan device_id atau pppUsername
        const identifier = user.device_id || user.pppoe_username; // Ambil device_id atau pppUsername jika tersedia
        if (!identifier) {
            return reply("Device ID atau PPP Username tidak ditemukan.");
        }

        // Mengambil informasi perangkat
        const deviceInfo = await getDeviceInfo(identifier);

        const {
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
        } = deviceInfo;

        // Mengirimkan informasi perangkat ke pengguna
        reply(`> *INFO PELANGGAN*\n\n*◉Model Name* : ${modelName}\n*◉SSID* : ${ssid}\n*◉Terhubung* : ${connected}\n*◉Redaman* : ${redaman} dBm\n*◉Temperature* : ${temp}°C\n*◉Uptime* : ${uptime}\n*◉Username* : ${username}\n*◉IPAddress* : ${ipaddress}\n*◉Lokasi* : ${lokasi}\n*◉Status* : ${status}\n\n\n${namabot}`);
    } catch (e) {
        console.log(e);
        reply(`*ERROR!*\n\nSilahkan Hubungi Admin\n\nTerimakasih\n\n${namabot}`);
    }
}
break;

case 'refresh': {
    const user = users.find(v => v.phone_number == (/^([^:@]+)[:@]?.*$/.exec(sender)[1]));
    if (!user) {
        return reply("Anda tidak terdaftar di dalam database pelanggan kami.");
    }

    const identifier = user.device_id; // Pastikan device_id sudah ada
    try {
        const result = await refreshModem(identifier);
        reply(result);
    } catch (e) {
        console.log(e);
        reply(`*ERROR!*\n\nSilahkan Hubungi Admin\n\nTerimakasih\n\n${namabot}`);
    }
}
break;    

case 'cekclient': {
  const user = users.find(v => v.phone_number == (/^([^:@]+)[:@]?.*$/.exec(sender)[1]));
  if (!user) {
    return reply("Anda tidak terdaftar di dalam database pelanggan kami.");
  }

  const identifier = user.device_id || user.pppoe_username; // Menggunakan device_id atau pppoe_username
  if (!identifier) {
    return reply("Device ID atau PPPoE Username tidak tersedia.");
  }

  try {
    const result = await getClientInfo(identifier);
    reply(result);
  } catch (e) {
    console.log(e);
    reply(`*ERROR!*\n\nSilahkan Hubungi Admin\n\nTerimakasih\n\n${namabot}`);
  }
}
break;

default:
        }
    } catch (err) {
        console.log(err)
    }
}
