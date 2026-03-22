
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('🚀 SISTEMA IQUIQUE V2: EN LINEA'));
app.listen(process.env.PORT || 3000);

async function conectarBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        printQRInTerminal: true, // Esto hará que el QR salga en los LOGS de Railway
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log("⚠️ NUEVO QR GENERADO. COPIA ESTE CODIGO Y PEGALO EN UN GENERADOR DE QR:");
            console.log(qr); // El código QR aparecerá como texto en los Logs
        }
        if (connection === 'close') {
            const debeReconectar = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (debeReconectar) conectarBot();
        } else if (connection === 'open') {
            console.log('✅ BOT CONECTADO AL FIN (V2)');
        }
    });

    // --- LÓGICA DE REENVÍO ---
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const idGrupo = msg.key.remoteJid;
        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (idGrupo.endsWith('@g.us') && texto) {
            // Buscamos el nombre del grupo (esto es más rápido con Baileys)
            const metadata = await sock.groupMetadata(idGrupo);
            const N = metadata.subject.toUpperCase();
            const T = "Team Codigo Dragon";

            const fuentes = ["URBAN", "CONTROL", "PDI", "RUTAS", "IQQ"];
            
            if (fuentes.some(f => N.includes(f)) && !N.includes(T.toUpperCase())) {
                const chats = await sock.groupFetchAllParticipating();
                const destino = Object.values(chats).find(c => c.subject.includes(T));

                if (destino) {
                    await sock.sendMessage(destino.id, { 
                        text: `🚨 *REPORTE RUTA*\n📍 *Origen:* ${metadata.subject}\n\n${texto}` 
                    });
                    console.log(`✨ Replicado de ${metadata.subject} a ${T}`);
                }
            }
        }
    });
}

conectarBot();










