const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();

// --- INFRAESTRUCTURA DE RED ---
app.get('/', (req, res) => res.send('🚀 Sistema Team Codigo Dragon: ONLINE'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './sesion_bot' }),
    puppeteer: { 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
    }
});

// --- DEFINICIÓN DE GRUPOS (COMPARATIVAS) ---
const U1 = "🕹️𝐔𝐑𝐁𝐀𝐍 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐄𝐒•𝟐𝟒/𝟕🚨🚔";
const C2 = "CONTROL - IQUIQUE - HOSPICIO";
const C3 = "CONTROL PDI Y CARABINEROS";
const R4 = "RUTAS IQUIQUE ALTO HOSPICIO\npozo Almonte pueblos del interior y aeropuerto";
const C5 = "Controles iqq - hospicio";

// Grupo Destino (Igualado a "t")
const t = "Team Codigo Dragon";

client.on('ready', () => {
    console.log('✅ BOT VINCULADO Y ESCANEANDO GRUPOS');
});

client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (!chat.isGroup) return;

        const N = chat.name; // Nombre del grupo que envía el mensaje
        let aliasFuente = "";

        // --- LÓGICA DE COMPARATIVAS (N = ...) ---
        if (N === U1) { aliasFuente = "U1"; }
        else if (N === C2) { aliasFuente = "C2"; }
        else if (N === C3) { aliasFuente = "C3"; }
        else if (N === R4) { aliasFuente = "R4"; }
        else if (N === C5) { aliasFuente = "C5"; }
        else { return; } // Exit (Sigue escaneando)

        // --- SI HAY MATCH, EJECUTAR MAGIA HACIA "t" ---
        if (aliasFuente !== "" && msg.body) {
            const todosLosChats = await client.getChats();
            const grupoT = todosLosChats.find(c => c.name && c.name.includes(t));

            if (grupoT) {
                const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                
                const reporte = `🚨 *REPORTE [${aliasFuente}]*\n🕒 *Hora:* ${hora}\n📍 *Fuente:* ${N}\n\n${msg.body}`;
                
                await client.sendMessage(grupoT.id._serialized, reporte);
                console.log(`✨ Magia: Reenviado desde ${aliasFuente} a Team Codigo Dragon`);
            }
        }

    } catch (e) {
        console.log("Error en el cruce de datos:", e);
    }
});

client.initialize();








