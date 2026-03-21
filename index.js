
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

let qrImagen = '';

// --- CONFIGURACIÓN DE GRUPOS ---
const GRUPOS_PERMITIDOS = [
    "REPORTES RUTA A-16", 
    "CONTROL IQUIQUE",
    "Zello Iquique Oficial",
    "Avisos de Carabineros"
];
const MI_GRUPO_DESTINO = "Team Codigo Dragon"; 

// --- SERVIDOR WEB ---
app.get('/', (req, res) => {
    if (qrImagen) {
        res.send(`<html><body style="background:#000;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${qrImagen}" style="border:10px solid white;width:300px;height:300px;"></body></html>`);
    } else {
        res.send('<html><body style="background:#000;color:white;display:flex;justify-content:center;align-items:center;height:100vh;"><h1>Esperando el QR... recarga en 10 segundos</h1></body></html>');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${port}`);
});

// --- EL AJUSTE MAESTRO ---
const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', async (qr) => {
    qrImagen = await qrcode.toDataURL(qr);
    console.log('NUEVO QR GENERADO');
});

client.on('ready', () => {
    qrImagen = ''; 
    console.log('¡BOT ONLINE!');
});

// Lógica de reenvío
client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        if (chat.isGroup && GRUPOS_PERMITIDOS.includes(chat.name)) {
            const todosLosChats = await client.getChats();
            const miGrupo = todosLosChats.find(c => c.name === MI_GRUPO_DESTINO);
            if (miGrupo && msg.body) {
                const hora = new Date().toLocaleTimeString();
                const reporte = `🚨 *REPORTE REENVIADO*\n🕒 ${hora}\n📍 *Fuente:* ${chat.name}\n\n${msg.body}`;
                await client.sendMessage(miGrupo.id._serialized, reporte);
            }
        }
    } catch (e) { console.log("Error:", e); }
});

client.initialize();


