
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE GRUPOS ---
const GRUPOS_FUENTES = [
    "🕹️𝐔𝐑𝐁𝐀𝐍 𝐂𝐎𝐍𝐓𝐑𝐎𝐋𝐄𝐒•𝟐𝟒/𝟕🚨🚔",
    "CONTROL - IQUIQUE - HOSPICIO",
    "CONTROL PDI Y CARABINEROS",
    "RUTAS IQUIQUE ALTO HOSPICIO\npozo Almonte pueblos del interior y aeropuerto",
    "Controles iqq - hospicio"
];

const GRUPO_DESTINO_NOMBRE = "Team Codigo Dragon";

app.get('/', (req, res) => {
    res.send('<html><body style="background:#000;color:#25D366;text-align:center;padding-top:50px;font-family:sans-serif;"><h1>🚀 Team Codigo Dragon: ONLINE</h1><p>Revisa los Logs en Railway para ver la actividad.</p></body></html>');
});

app.listen(port, '0.0.0.0');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('ready', () => {
    console.log('------------------------------------------------');
    console.log('✅ BOT CONECTADO - ESCUCHANDO GRUPOS DE IQUIQUE');
    console.log('------------------------------------------------');
});

// ESTA FUNCIÓN ES LA QUE HACE TODO EL TRABAJO
client.on('message_create', async (msg) => {
    try {
        const chat = await msg.getChat();
        
        if (chat.isGroup) {
            const nombreLimpio = chat.name ? chat.name.trim() : "";
            const idGrupo = chat.id._serialized;

            // LOG DE DEPURACIÓN (Míralo en Railway para obtener los IDs)
            console.log(`[MENSAJE DETECTADO] Grupo: "${nombreLimpio}" | ID: ${idGrupo}`);

            // 1. Verificamos si el nombre coincide con nuestra lista
            const esFuente = GRUPOS_FUENTES.some(g => g.trim() === nombreLimpio);

            if (esFuente) {
                // Evitar auto-reenvío si el bot escribe en el destino
                if (msg.fromMe && nombreLimpio === GRUPO_DESTINO_NOMBRE) return;

                const todosLosChats = await client.getChats();
                const destino = todosLosChats.find(c => c.name === GRUPO_DESTINO_NOMBRE);

                if (destino && msg.body) {
                    const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                    const cuerpoReporte = `🚨 *REPORTE REENVIADO*\n🕒 ${hora}\n📍 *Fuente:* ${nombreLimpio}\n\n${msg.body}`;
                    
                    await client.sendMessage(destino.id._serialized, cuerpoReporte);
                    console.log(`>>> ✅ COPIADO EXITOSAMENTE AL TEAM DRAGON`);
                }
            }
        }
    } catch (err) {
        console.error("Error procesando mensaje:", err);
    }
});

client.initialize();




