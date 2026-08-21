import nodemailer from 'nodemailer';

const DEFAULT_SMTP_USER = 'leonkoffifadou2000@gmail.com';
const DEFAULT_SMTP_PASS = 'cnxwmwkgktjawffa';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  try {
    const { email, code, recipientName } = req.body || {};

    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email et code requis' });
    }

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

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
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

    const mailOptions = {
      from: process.env.SMTP_FROM || `"KlinaTop Sécurité RH" <${smtpUser}>`,
      to: email.trim(),
      subject: `KlinaTop - Votre code de confirmation : ${code}`,
      text: `Bonjour ${recipientName || ''},\n\nVotre code de confirmation pour activer votre compte Administrateur RH sur KlinaTop est : ${code}\n\nCe code est valable 10 minutes.\n\nL'équipe KlinaTop.`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Vercel Serverless Email] ✅ Email expédié à ${email} (MessageId: ${info.messageId})`);

    return res.status(200).json({
      success: true,
      delivered: true,
      messageId: info.messageId
    });
  } catch (err: any) {
    console.error('[Vercel Serverless Email] ❌ Erreur SMTP :', err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}