const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const express = require('express');
const app = express();

let qrVisual = "";

// --- SERVIDOR WEB PARA VER EL QR EN RENDER ---
const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center;background:#0d1117;color:#58a6ff;padding:50px;font-family:sans-serif;height:100vh;">
            <h1 style="color:#238636;">🐉 SISTEMA TEAM CODIGO DRAGON</h1>
            <p style="color:#ffffff;">Estado: ${qrVisual ? 'Esperando Escaneo' : 'Iniciando...'}</p>
            <div style="background:#fff;padding:20px;display:inline-block;border-radius:15px;box-shadow: 0 0 20px rgba(0,0,0,0.5);">
                ${qrVisual.startsWith('data') ? `<img src="${qrVisual}" style="width:300px;"/>` : `<h2>${qrVisual}</h2>`}
            </div>
            <p style="color:#8b949e;margin-top:20px;">Abre WhatsApp > Dispositivos vinculados > Escanear QR</p>
        </div>
    `);
});

app.listen(port, '0.0.0.0', () => console.log(`🌍 Web activa en puerto ${port}`));

async function conectarBot() {
    // Carpeta de sesión para no pedir QR a cada rato
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['LavoraTech', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            qrVisual = await qrcode.toDataURL(qr);
            console.log("⚠️ QR LISTO EN LA URL DE RENDER");
        }

        if (connection === 'open') {
            qrVisual = "✅ BOT CONECTADO Y REPLICANDO";
            console.log("🚀 CONEXIÓN EXITOSA CON WHATSAPP");
        }

        if (connection === 'close') {
            const debeReconectar = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`❌ Conexión cerrada. Reconectando: ${debeReconectar}`);
            if (debeReconectar) conectarBot();
        }
    });

    // --- LÓGICA DE REPLICACIÓN DE GRUPOS ---
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!texto) return;

        try {
            const jid = msg.key.remoteJid;
            if (!jid.endsWith('@g.us')) return;

            const metadata = await sock.groupMetadata(jid);
            const N = metadata.subject; // Nombre real del grupo
            const t = "Team Codigo Dragon"; // Destino

            // Limpieza de nombre para comparación (quita emojis y estilos)
            const nLimpio = N.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
            
            let alias = "";
            if (nLimpio.includes("URBAN")) alias = "U1";
            else if (nLimpio.includes("CONTROL") && nLimpio.includes("IQUIQUE")) alias = "C2";
            else if (nLimpio.includes("PDI") || nLimpio.includes("CARABINEROS")) alias = "C3";
            else if (nLimpio.includes("RUTAS")) alias = "R4";
            else if (nLimpio.includes("CONTROLES IQQ")) alias = "C5";

            // Si es uno de los grupos y NO es el grupo de destino (t)
            if (alias !== "" && !nLimpio.includes(t.toUpperCase())) {
                const gruposActivos = await sock.groupFetchAllParticipating();
                const destino = Object.values(gruposActivos).find(g => g.subject.includes(t));

                if (destino) {
                    const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                    
                    await sock.sendMessage(destino.id, { 
                        text: `🚨 *REPORTE [${alias}]*\n🕒 *Hora:* ${hora}\n📍 *Origen:* ${N}\n\n${texto}` 
                    });
                    console.log(`✨ Magia: Replicado de ${alias} a ${t}`);
                }
            }
        } catch (e) {
            // Error silencioso si falla la metadata o no es grupo
        }
    });
}

conectarBot();











