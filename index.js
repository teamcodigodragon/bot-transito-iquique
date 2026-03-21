
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Configuración básica del servidor para Railway
app.get('/', (req, res) => res.send('🚀 Bot de Rescate de IDs: ACTIVO. Escribe "LISTA" en tu WhatsApp.'));
app.listen(port, '0.0.0.0');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('ready', () => {
    console.log('--- ✅ BOT EN LÍNEA ---');
});

// ESTE ES EL COMANDO QUE TE DARÁ LOS IDS EN TU CELULAR
client.on('message_create', async (msg) => {
    try {
        // Solo responde si TÚ escribes la palabra exacta "LISTA"
        if (msg.body.toUpperCase() === 'LISTA') {
            const chats = await client.getChats();
            const grupos = chats.filter(c => c.isGroup);
            
            let reporteIds = "📋 *LISTA DE GRUPOS Y SUS IDs:*\n\n";
            
            grupos.forEach(g => {
                reporteIds += `👥 *Nombre:* ${g.name}\n🆔 *ID:* ${g.id._serialized}\n\n`;
            });

            // El bot te envía la lista directamente a tu chat
            await client.sendMessage(msg.from, reporteIds);
            console.log("✅ Lista de IDs enviada a tu WhatsApp.");
        }
    } catch (error) {
        console.log("Error al generar la lista:", error);
    }
});

client.initialize();






