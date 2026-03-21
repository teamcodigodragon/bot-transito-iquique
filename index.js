
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE GRUPOS (EXTRACCIÓN EXACTA) ---
const GRUPOS_PERMITIDOS = [
    "🕹️𝐔𝐑𝐁𝐀𝐍 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐄𝐒•𝟐𝟒/𝟕🚨🚔",
    "CONTROL - IQUIQUE - HOSPICIO",
    "CONTROL PDI Y CARABINEROS",
    "RUTAS IQUIQUE ALTO HOSPICIO\npozo Almonte pueblos del interior y aeropuerto",
    "Controles iqq - hospicio"
];

const MI_GRUPO_DESTINO = "Team Codigo Dragon";

// Servidor para mantener vivo el servicio en Railway
app.get('/', (req, res) => {
    res.send('<html><body style="background:#000;color:#25D366;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h1>🚀 Team Codigo Dragon Online</h1></body></html>');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${port}`);
});

// Configuración del Cliente con Estrategia de Persistencia
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process'
        ]
    }
});

client.on('ready', () => {
    console.log('--- ✅ BOT VINCULADO Y ESCUCHANDO REPORTES ---');
});

// Lógica de Reenvío Forzado (Usa message_create para no perder nada)
client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        
        if (chat.isGroup) {
            const nombreGrupoActual = chat.name ? chat.name.trim() : "";

            // Verificamos si el mensaje viene de uno de los grupos de la lista
            if (GRUPOS_PERMITIDOS.includes(nombreGrupoActual)) {
                
                // Evitar que el bot se reenvíe a sí mismo si escribe en el destino
                if (msg.fromMe && nombreGrupoActual === MI_GRUPO_DESTINO) return;

                // Buscamos el grupo de destino (Team Codigo Dragon)
                const todosLosChats = await client.getChats();
                const miGrupoDestino = todosLosChats.find(c => c.name === MI_GRUPO_DESTINO);

                if (miGrupoDestino && msg.body) {
                    const ahora = new Date();
                    const horaFormateada = ahora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                    
                    const reporte = `🚨 *REPORTE REENVIADO*\n🕒 ${horaFormateada}\n📍 *Fuente:* ${nombreGrupoActual}\n\n${msg.body}`;
                    
                    await client.sendMessage(miGrupoDestino.id._serialized, reporte);
                    console.log(`✅ COPIADO con éxito desde: ${nombreGrupoActual}`);
                }
            }
        }
    } catch (error) {
        console.log("Error al procesar mensaje:", error);
    }
});

// Manejo de desconexión para evitar que el bot se muera
client.on('disconnected', (reason) => {
    console.log('Bot desconectado:', reason);
    client.initialize();
});

client.initialize();




