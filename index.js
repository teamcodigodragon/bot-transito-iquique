
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const app = express();

let qrVisual = "";

app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center;background:#1a1a1a;color:#fff;padding:40px;font-family:sans-serif;height:100vh;">
            <h2 style="color:#00ff00;">🛡️ Activación LavoraTech / Team Codigo Dragon</h2>
            <div style="background:#fff;padding:20px;display:inline-block;border-radius:15px;">
                ${qrVisual ? `<img src="${qrVisual}" style="width:250px;" />` : "<h3>Generando QR... Refresca en unos segundos</h3>"}
            </div>
            <p style="margin-top:20px;">Escanea este código con tu WhatsApp para activar el reenvío.</p>
            <p style="color:#888;font-size:12px;">Estado: Esperando vinculación...</p>
        </div>
    `);
});

app.listen(process.env.PORT || 3000);

const client = new Client({
    // Cambiamos la ruta a una carpeta local del proyecto
    authStrategy: new LocalAuth({ dataPath: './sesion_bot' }), 
    puppeteer: { 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
    }
});

const ORIGENES = ["URBAN", "CONTROL", "PDI", "CARABINEROS", "RUTAS", "IQQ"];
const DESTINO_NOMBRE = "Team Codigo Dragon";

client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => { qrVisual = url; });
    console.log("⚠️ NUEVO QR GENERADO");
});

client.on('ready', () => {
    qrVisual = "<h1 style='color:#00ff00;'>✅ BOT CONECTADO Y REPLICANDO</h1>";
    console.log("✅ BOT LISTO PARA IQUIQUE");
});

client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            const nombre = chat.name.toUpperCase();
            // Filtramos por palabras clave y evitamos que se reenvíe a sí mismo
            if (ORIGENES.some(f => nombre.includes(f)) && !nombre.includes(DESTINO_NOMBRE.toUpperCase())) {
                const chats = await client.getChats();
                const target = chats.find(c => c.name && c.name.includes(DESTINO_NOMBRE));
                
                if (target && msg.body) {
                    const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                    await client.sendMessage(target.id._serialized, `🚨 *REPORTE DE RUTA*\n🕒 ${hora}\n📍 *Origen:* ${chat.name}\n\n${msg.body}`);
                }
            }
        }
    } catch (e) { console.log("Error en reenvío:", e); }
});

client.initialize();







