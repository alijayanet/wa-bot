exports.wifimenu = (nama, namabot) => {
    return `
Hai Selamat Datang ${nama}, ini adalah bot milik 「 *${namabot}* 」
#########################
Untuk menggunakan perintah bot cukup ketik menu list dibawah ini :

_*Menu*_  = Lihat daftar Menu.
_*Perintah*_ = Lihat daftar perintah.
_*Admin*_ = Melihat Nomor Admin.

##########################
_*CATATAN*_: 
Jika ada kendala dan pertanyaan, silahkan chat admin pada nomor di bawah
https://wa.me/6285645055000
##########################

Terima Kasih
Support by *${namabot}*`
}
exports.customermenu = (nama, namabot) => {
    return `
Selamat Datang Di 「 ${nama} 」
===================================
Silahkan ketik menu list dibawah ini :

_*ubahwifi*_  = Mengubah Nama / SSID Wifi.
Contoh : ubahwifi nama Wifibaru
_*ubahsandi*_   = Mengubah Password Wifi.
Contoh : ubahsandi 1245678
NB : -Minimal 8 Digit (Bebas Huruf Dan Angka).
_*gantipower*_ = Merubah power untuk mengatur cakupan sinyal
NB : Untuk Power Hanya Bisa Diisi 100, 80, 60, 40, 20. 
_*reboot*_    = Reboot / Restart Modem.
_*cekdevice*_  = Cek Info lengkap modem.
_*refresh*_  = merefresh/summon Modem.
_*cekclient*_  = melihat perangkat yang terhubung.

##########################
_*CATATAN*_: 
Jika ada kendala dan pertanyaan, silahkan chat admin pada nomor di bawah
https://wa.me/6285645055000
##########################

Terima Kasih
Support by *${namabot}*`
}
