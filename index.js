const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// --- CONFIGURACIÓN PERSONALIZADA ---
// Reemplaza el número de abajo con el tuyo (Formato: CodigoPais + Numero sin el +)
// Ejemplo para Chile: "56912345678"
const MI_TELEFONO = "56940440806"

const GRUPOS_PERMITIDOS = [
    "🕹️𝐔𝐑𝐁𝐀𝐍 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐄𝐒•𝟐𝟒/𝟕🚨🚔", 
    "CONTROL - IQUIQUE - HOSPICIO",
    "CONTROL PDI Y CARABINEROS",
    "Controles iqq - hospicio"
];
const MI_GRUPO_DESTINO = "Team Codigo Dragon";

let pairingCode = "GENERANDO CÓDIGO... ESPERA 30 SEGUNDOS";

// --- INTERFAZ WEB PARA VER EL CÓDIGO ---
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Panel Control Team Dragon</title></head>
            <body style="background:#111; color:#eee; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0;">
                <h1 style="color:#25D366;">Vinculación por Número</h1>
                <p>Ingresa este código en tu WhatsApp:</p>
                <div style="background:#222; padding:30px; border:3px dashed #25D366; border-radius:15px; font-size:4rem; font-weight:bold; letter-spacing:8px; color:#fff;">
                    ${pairingCode}
                </div>
                <div style="margin-top:30px; text-align:center; max-width:400px; color:#aaa;">
                    <p>1. Ve a WhatsApp > Dispositivos vinculados</p>
                    <p>2. Vincular un dispositivo > <b>Vincular con el número de teléfono</b></p>
                    <p>3. Escribe el código de arriba.</p>
                </div>
                <script>setTimeout(() => { location.reload(); }, 15000);</script>
            </body>
        </html>
    `);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor en puerto ${port}`);
});

// --- LÓGICA DEL BOT ---
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        ]
    }
});

// ESTO REEMPLAZA AL QR: PIDE EL CÓDIGO DE 8 DÍGITOS
client.on('qr', async () => {
    try {
        console.log("Solicitando código de vinculación para:", MI_TELEFONO);
        const code = await client.requestPairingCode(MI_TELEFONO);
        pairingCode = code;
        console.log(">>> CÓDIGO DE VINCULACIÓN:", code);
    } catch (err) {
        console.error("Error al pedir código:", err);
        pairingCode = "ERROR: REINICIA RAILWAY";
    }
});

client.on('ready', () => {
    pairingCode = "¡BOT CONECTADO!";
    console.log('--- EL BOT ESTÁ ONLINE Y ESCUCHANDO ---');
});

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        // Solo reenvía si es grupo y está en la lista blanca
        if (chat.isGroup && GRUPOS_PERMITIDOS.includes(chat.name)) {
            const todosLosChats = await client.getChats();
            const miGrupo = todosLosChats.find(c => c.name === MI_GRUPO_DESTINO);
            
            if (miGrupo && msg.body) {
                const reporte = `🚨 *REPORTE REENVIADO*\n🕒 ${new Date().toLocaleTimeString()}\n📍 *Fuente:* ${chat.name}\n\n${msg.body}`;
                await client.sendMessage(miGrupo.id._serialized, reporte);
                console.log(`Reporte enviado desde ${chat.name}`);
            }
        }
    } catch (e) {
        console.log("Error al procesar mensaje:", e);
    }
});

client.initialize();




