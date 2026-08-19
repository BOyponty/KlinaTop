import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_SMTP_USER = 'leonkoffifadou2000@gmail.com';
const DEFAULT_SMTP_PASS = 'cnxwmwkgktjawffa';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const generateEmailHtml = (code: string, recipientName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 800; color: #0F9D58; letter-spacing: -0.5px; }
        .badge { display: inline-block; background: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-top: 6px; text-transform: uppercase; }
        .title { font-size: 18px; font-weight: 700; color: #111827; margin-top: 16px; margin-bottom: 8px; text-align: center; }
        .desc { font-size: 14px; line-height: 1.6; color: #4b5563; text-align: center; margin-bottom: 24px; }
        .code-container { background: #f0fdf4; border: 2px dashed #0F9D58; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #0F9D58; margin: 0; }
        .code-label { font-size: 12px; color: #047857; margin-top: 6px; font-weight: 600; text-transform: uppercase; }
        .warning { font-size: 12px; color: #6b7280; text-align: center; line-height: 1.5; margin-top: 20px; border-top: 1px solid #f3f4f6; padding-top: 16px; }
        .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">KLINATOP</div>
          <div class="badge">Espace Sécurité RH</div>
        </div>
        <div class="title">Vérification de votre adresse email</div>
        <div class="desc">
          Bonjour <strong>${recipientName || 'Responsable'}</strong>,<br>
          Vous avez initié la création d'un compte Administrateur / RH sur la plateforme <strong>KlinaTop</strong>. Veuillez utiliser le code de sécurité confidentiel ci-dessous pour certifier votre adresse email :
        </div>
        
        <div class="code-container">
          <div class="code">${code}</div>
          <div class="code-label">Code de sécurité à 6 chiffres</div>
        </div>

        <div class="warning">
          Ce code expire dans <strong>10 minutes</strong>.<br>
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
        </div>
        
        <div class="footer">
          &copy; ${new Date().getFullYear()} KlinaTop &bull; Plateforme de Pointage & Gestion RH
        </div>
      </div>
    </body>
    </html>
  `;

  // API: Envoi réel du code par email via Gmail SMTP
  app.post('/api/send-verification-email', async (req, res) => {
    try {
      const { email, code, recipientName } = req.body;

      if (!email || !code) {
        return res.status(400).json({ success: false, error: 'Email et code requis' });
      }

      console.log(`[KlinaTop Email Service] Envoi du code ${code} vers ${email}...`);
      const emailHtml = generateEmailHtml(code, recipientName);

      const smtpUser = (process.env.SMTP_USER || DEFAULT_SMTP_USER).trim();
      const rawPass = (process.env.SMTP_PASS || DEFAULT_SMTP_PASS).trim();
      const cleanPass = rawPass.replace(/\s+/g, '');

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: cleanPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || `"KlinaTop Sécurité RH" <${smtpUser}>`,
        to: email.trim(),
        subject: `KlinaTop - Votre code de confirmation : ${code}`,
        text: `Bonjour ${recipientName || ''},\n\nVotre code de confirmation pour activer votre compte Administrateur RH sur KlinaTop est : ${code}\n\nCe code est valable 10 minutes.\n\nL'équipe KlinaTop.`,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[KlinaTop Email Service] ✅ Email envoyé avec succès à ${email}`);

      return res.json({
        success: true,
        delivered: true,
        messageId: info.messageId
      });

    } catch (err: any) {
      console.error('[KlinaTop Email Service] ❌ Erreur SMTP :', err.message);

      let userFriendlyError = err.message;
      if (err.message?.includes('535') || err.message?.includes('BadCredentials') || err.message?.includes('Username and Password not accepted')) {
        userFriendlyError = `Identifiants Google refusés : Vérifiez votre mot de passe d'application Google.`;
      }

      return res.status(500).json({
        success: false,
        error: userFriendlyError
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware pour le développement et la production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KlinaTop Server] Serveur actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[KlinaTop Server] Erreur au démarrage :', err);
});