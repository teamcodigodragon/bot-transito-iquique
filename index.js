const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

let qrImagen = '';

// --- CONFIGURACIÓN DEL FILTRO (EDITA ESTO) ---
const GRUPOS_PERMITIDOS = [
    "🕹️𝐔𝐑𝐁𝐀𝐍 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐄𝐒•𝟐𝟒/𝟕🚨🚔, 
    "CONTROL - IQUIQUE - HOSPICIO,
    "CONTROL PDI Y CARABINEROS,
    "Controles iqq - hospicio"
];

const MI_GRUPO_DESTINO = "Team Codigo Dragon"; 

// --- SERVIDOR PARA VER EL QR ---
app.get('/', (req, res) => {
    if (qrImagen) {
        res.send(`<html><body style="background:#000;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${qrImagen}" style="border:10px solid white;width:300px;height:300px;"></body></html>`);
    } else {
        res.send('<html><body style="background:#000;color:white;display:flex;justify-content:center;align-items:center;height:100vh;"><h1>Bot Conectado o Iniciando...</h1></body></html>');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor en puerto ${port}`);
});

// --- LÓGICA DEL BOT ---
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('qr', async (qr) => {
    qrImagen = await qrcode.toDataURL(qr);
    console.log('Nuevo QR generado');
});

client.on('ready', () => {
    qrImagen = ''; 
    console.log('¡BOT ONLINE Y ESCUCHANDO!');
});

// ESTA ES LA LÍNEA QUE BUSCÁBAMOS: LA ESCUCHA DE MENSAJES
client.on('message', async msg => {
    try {
        const chat = await msg.getChat();

        // Filtro: Solo si es grupo y está en la lista blanca
        if (chat.isGroup && GRUPOS_PERMITIDOS.includes(chat.name)) {
            
            const todosLosChats = await client.getChats();
            const miGrupo = todosLosChats.find(c => c.name === MI_GRUPO_DESTINO);

            if (miGrupo && msg.body) {
                const hora = new Date().toLocaleTimeString();
                const reporte = `🚨 *REPORTE REENVIADO*\n🕒 ${hora}\n📍 *Fuente:* ${chat.name}\n\n${msg.body}`;
                
                await client.sendMessage(miGrupo.id._serialized, reporte);
            }
        }
    } catch (e) {
        console.log("Error en el proceso: ", e);
    }
});

client.initialize();


