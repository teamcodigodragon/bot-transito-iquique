const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('🕵️ MONITOR DE TRÁFICO ACTIVO'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './sesion_bot' }),
    puppeteer: { 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

// DESTINO FINAL
const t = "Team Codigo Dragon";

client.on('ready', () => {
    console.log('🚀 BOT TOTALMENTE CONECTADO');
});

// ESTO MOSTRARÁ TODO EN LOS LOGS DE RAILWAY
client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        
        // LOG DE SEGURIDAD: Esto aparecerá en Railway cada vez que alguien escriba
        console.log(`📩 MENSAJE RECIBIDO DE: "${chat.name}" | TEXTO: ${msg.body.substring(0, 20)}...`);

        if (chat.isGroup) {
            const N = chat.name.toUpperCase();
            
            // Filtro simplificado al máximo
            const esFuente = N.includes("URBAN") || N.includes("CONTROL") || N.includes("PDI") || N.includes("RUTAS") || N.includes("IQQ");
            const esDestino = N.includes(t.toUpperCase());

            if (esFuente && !esDestino) {
                const todos = await client.getChats();
                const destino = todos.find(c => c.name && c.name.toUpperCase().includes(t.toUpperCase()));

                if (destino) {
                    const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                    await client.sendMessage(destino.id._serialized, `🚨 *REPORTE AUTOMÁTICO*\n🕒 ${hora}\n📍 *Origen:* ${chat.name}\n\n${msg.body}`);
                    console.log(`✅ REPLICADO A ${t}`);
                } else {
                    console.log(`❌ ERROR: No encontré el grupo "${t}" en tu WhatsApp.`);
                }
            }
        }
    } catch (e) {
        console.log("⚠️ ERROR CRÍTICO:", e);
    }
});

client.initialize();










