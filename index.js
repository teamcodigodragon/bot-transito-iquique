const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

let qrImagen = '';

// 1. Servidor web que NUNCA se apaga
app.get('/', (req, res) => {
    if (qrImagen) {
        res.send(`<html><body style="background:#000;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${qrImagen}" style="border:10px solid white;width:300px;height:300px;"></body></html>`);
    } else {
        res.send('<html><body style="background:#000;color:white;display:flex;justify-content:center;align-items:center;height:100vh;"><h1>Iniciando... Recarga en 10 segundos</h1></body></html>');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${port}`);
});

// 2. Configuración del Bot
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('qr', async (qr) => {
    qrImagen = await qrcode.toDataURL(qr);
    console.log('¡QR LISTO EN EL LINK!');
});

client.on('ready', () => {
    qrImagen = ''; // Limpia el QR cuando ya entró
    console.log('¡BOT ONLINE!');
});

client.initialize();

