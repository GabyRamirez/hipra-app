import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAndUnblockContact } from '@/lib/brevo';

export async function POST(req: Request) {
  try {
    const { email, turnstileToken } = await req.json();

    if (!email || !turnstileToken) {
      console.error('[API request-link] Dades incompletes: falta correu o token Turnstile.');
      return NextResponse.json({ message: 'Dades incompletes.' }, { status: 400 });
    }

    // 1. Verificar Cloudflare Turnstile
    try {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        console.error('[API request-link] Error validació Turnstile:', verifyData);
        return NextResponse.json({ message: 'Error de validació de seguretat.' }, { status: 400 });
      }
    } catch (err) {
      console.error('[API request-link] Error de xarxa amb Turnstile:', err);
      return NextResponse.json({ message: 'Error de connexió de seguretat.' }, { status: 500 });
    }

    // 2. Cercar treballador al cens
    try {
      const worker = await prisma.worker.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!worker) {
        console.warn('[API request-link] Correu no trobat al cens:', email);
        return NextResponse.json({ message: 'Aquest correu no figura al cens d\'Hipra.' }, { status: 404 });
      }

      if (worker.hasAnswered) {
        console.warn('[API request-link] Treballador ja ha contestat:', email);
        return NextResponse.json({ message: 'Aquest correu ja ha completat l\'enquesta.' }, { status: 403 });
      }

      // 3. Enviar correu amb l'enllaç
      const link = `${process.env.NEXT_PUBLIC_BASE_URL}/survey/${worker.token}`;
      const emailStatus = await sendSurveyEmail(worker.email, worker.name || 'Treballador/a', link);

      if (!emailStatus.success) {
        console.error('[API request-link] Error enviant el correu amb Brevo per a:', email);
        return NextResponse.json({ message: 'Error enviant el correu. Revisa Brevo.' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Correu enviat correctament.' });

    } catch (err) {
      console.error('[API request-link] Error de Base de Dades:', err);
      return NextResponse.json({ message: 'Error intern del servidor. Comprova la BD.' }, { status: 500 });
    }

  } catch (error) {
    console.error('[API request-link] Error general:', error);
    return NextResponse.json({ message: 'Error intern del servidor.' }, { status: 500 });
  }
}

// Helper per enviar el mail individual
async function sendSurveyEmail(emailTarget: string, name: string, link: string) {
  try {
     const QRCode = require('qrcode');
     const qrDataUrl = await QRCode.toDataURL(link);
     
     await checkAndUnblockContact(emailTarget);

     const BREVO_API_KEY = process.env.BREVO_API_KEY;
     const response = await fetch('https://api.brevo.com/v3/smtp/email', {
       method: 'POST',
       headers: {
         'api-key': BREVO_API_KEY || '',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         sender: { name: "La Intersindical", email: "no-reply@lainter.cat" },
         to: [{ email: emailTarget, name }],
         subject: "Avaluació de Lloc de Treball | Hipra",
         htmlContent: `
           <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; text-align: center;">
             <h2 style="color: #E5352C;">Accés a l'Avaluació TLC</h2>
             <p style="text-align: left;">Hola ${name},</p>
             <p style="text-align: left;">Tal com has sol·licitat, aquí tens l'enllaç per a la valoració del teu lloc de treball.</p>
             
             <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
               <p style="font-weight: bold; margin-bottom: 15px;">Escaneja aquest codi amb el teu mòbil personal:</p>
               <img src="${qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px; border: 5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
               <p style="font-size: 11px; color: #666; margin-top: 15px;">O fes clic al botó si ja estàs al mòbil:</p>
               <a href="${link}" style="display: inline-block; background-color: #16143E; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">OBRIR ENQUESTA</a>
             </div>

             <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
             <p style="font-size: 12px; color: #999; text-align: left;">Aquest enllaç és personal i intransferible.</p>
           </div>
         `,
       }),
     });

     return { success: response.ok };
  } catch (err) {
    console.error('[sendSurveyEmail Helper Error]:', err);
    return { success: false };
  }
}
