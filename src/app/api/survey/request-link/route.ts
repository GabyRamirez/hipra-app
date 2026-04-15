import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAndUnblockContact } from '@/lib/brevo';

export async function POST(req: Request) {
  try {
    const { email, turnstileToken } = await req.json();

    if (!email || !turnstileToken) {
      return NextResponse.json({ message: 'Dades incompletes.' }, { status: 400 });
    }

    // 1. Verify Turnstile (Cloudflare)
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return NextResponse.json({ message: 'Verificació de seguretat fallida.' }, { status: 403 });
    }

    // 2. Find worker
    const worker = await prisma.worker.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!worker) {
      return NextResponse.json({ message: 'Aquest correu no està autoritzat.' }, { status: 404 });
    }

    // 3. Check if already answered
    if (worker.hasAnswered) {
      return NextResponse.json({ message: 'Aquest correu ja ha completat l\'enquesta.' }, { status: 403 });
    }

    // 4. Send email with Brevo
    // Build the link
    const surveyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/survey/${worker.token}`;
    
    // We reuse the transactional email sending logic or call a function
    // For now, I'll implement a basic send using Brevo API directly or Brevo SMTP via Nodemailer
    // Let's use the Brevo library I copied, but it only has 'checkAndUnblockContact'
    // I will add a sendSurveyEmail function to src/lib/brevo.ts
    
    const sendRes = await sendSurveyEmail(worker.email, worker.name || 'Treballador/a', surveyLink);

    if (sendRes.success) {
      return NextResponse.json({ message: 'Enllaç enviat correctament.' });
    } else {
      return NextResponse.json({ message: 'Error enviant el correu. Revisa la configuració.' }, { status: 500 });
    }

  } catch (error) {
    console.error('[API Link Request Error]:', error);
    return NextResponse.json({ message: 'Error intern del servidor.' }, { status: 500 });
  }
}

// Minimal email sending helper (this would eventually go into src/lib/brevo.ts)
async function sendSurveyEmail(email: string, name: string, link: string) {
  try {
     // Generar QR en format Base64 per incrustar al mail
     const QRCode = require('qrcode');
     const qrDataUrl = await QRCode.toDataURL(link);

     // Optional: check if blacklisted first (reusing existing lib)
     await checkAndUnblockContact(email);

     const BREVO_API_KEY = process.env.BREVO_API_KEY;
     const response = await fetch('https://api.brevo.com/v3/smtp/email', {
       method: 'POST',
       headers: {
         'api-key': BREVO_API_KEY || '',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         sender: { name: "La Intersindical", email: "no-reply@lainter.cat" },
         to: [{ email, name }],
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
  } catch (error) {
    return { success: false, error };
  }
}
