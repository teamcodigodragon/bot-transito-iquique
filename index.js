
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express'); // Usaremos esto para ver el QR como imagen
const app = express();
const port = process.env.PORT || 3000;

let qrImagen = '';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', async (qr) => {
    // En lugar de dibujar, generamos una imagen real
    qrImagen = await qrcode.toDataURL(qr);
    console.log('--- QR GENERADO: Entra al link de abajo para verlo ---');
});

// Creamos una página web simple para ver el QR
app.get('/', (req, res) => {
    if (qrImagen) {
        res.send(`<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${qrImagen}" style="width:300px;height:300px;"></body></html>`);
    } else {
        res.send('<h1>Generando QR... espera 10 segundos y recarga</h1>');
    }
});

app.listen(port, () => {
    console.log(`Servidor listo en el puerto ${port}`);
});

const MI_GRUPO_DESTINO = "Team Codigo Dragon"; 
client.on('ready', () => { console.log('¡BOT CONECTADO!'); });
// ... (resto del código de reenvío que ya tienes)
client.initialize();
