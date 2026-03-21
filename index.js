const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// PUNTEROS DE FRACCIÓN (Basta que el nombre CONTENGA esto)
const PUNTEROS = ["URBAN", "CONTROL", "PDI", "CARABINEROS", "RUTAS", "iqq"];
const DESTINO = "Team Codigo Dragon";

app.get('/', (req, res) => res.send('Ejecutando Reenvío por Punteros...'));
app.listen(port, '0.0.0.0');

const client = new Client({
    authStrategy: new LocalAuth(),
    bypassCSP: true,
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    }
});

client.on('ready', () => {
    console.log('--- 🚀 BOT EN LÍNEA: TEAM CODIGO DRAGON ---');
});

// USAMOS 'message_create' PARA QUE LEA TAMBIÉN TUS PROPIOS POSTS
client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        
        if (chat.isGroup) {
            const nombreDato = chat.name ? chat.name.toUpperCase() : "";

            // ¿El nombre del grupo donde llegó el post tiene alguno de nuestros punteros?
            const coincidePuntero = PUNTEROS.some(p => nombreDato.includes(p.toUpperCase()));

            // Si coincide y NO es el grupo donde queremos copiar...
            if (coincidePuntero && chat.name !== DESTINO) {
                
                const todosLosChats = await client.getChats();
                // Buscamos el grupo destino ignorando mayúsculas/minúsculas
                const grupoDestino = todosLosChats.find(c => 
                    c.name && c.name.trim().toUpperCase() === DESTINO.toUpperCase()
                );

                if (grupoDestino) {
                    const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                    const cuerpo = `🚨 *REPORTE DETECTADO*\n🕒 ${hora}\n📍 *Origen:* ${chat.name}\n\n${msg.body}`;
                    
                    await client.sendMessage(grupoDestino.id._serialized, cuerpo);
                    console.log(`✅ COPIADO EXITOSO: De [${chat.name}] a [${DESTINO}]`);
                } else {
                    console.log(`❌ ERROR: No encuentro el grupo "${DESTINO}" en tu WhatsApp.`);
                }
            }
        }
    } catch (e) {
        console.log("Error en el proceso de puntero:", e);
    }
});

client.initialize();






