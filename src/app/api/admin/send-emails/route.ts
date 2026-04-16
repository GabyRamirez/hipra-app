import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAndUnblockContact } from '@/lib/brevo';

export async function POST(req: Request) {
  try {
    let workerId;
    try {
      const data = await req.json();
      workerId = data.workerId;
    } catch(e) {}

    const workers = await prisma.worker.findMany({
      where: workerId ? { id: workerId } : { hasAnswered: false },
    });

    if (workers.length === 0) {
      return NextResponse.json({ message: 'No hi ha treballadors pendents de resposta.' });
    }

    let successCount = 0;
    let failCount = 0;

    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    for (const worker of workers) {
      try {
        const surveyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/survey/${worker.token}`;
        
        // Generar QR en format Base64 per incrustar al mail
        const QRCode = require('qrcode');
        const qrDataUrl = await QRCode.toDataURL(surveyLink);
        
        // Optional: check and unblock
        await checkAndUnblockContact(worker.email);

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': BREVO_API_KEY || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: "La Intersindical", email: process.env.BREVO_SENDER_EMAIL || "informatica@intersindical-csc.cat" },
            to: [{ email: worker.email, name: worker.name || 'Treballador/a' }],
            subject: "Invitació a l'Avaluació de Lloc de Treball | Hipra",
            htmlContent: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; text-align: center;">
                <h2 style="color: #E5352C;">Invitació a l'Avaluació TLC</h2>
                <p style="text-align: left;">Hola ${worker.name || 'Treballador/a'},</p>
                <p style="text-align: left;">T'invitem a respondre el qüestionari d'avaluació segons el manual d'indústria (TLC).</p>
                
                <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
                  <p style="font-weight: bold; margin-bottom: 15px;">Escaneja aquest codi amb el teu mòbil personal:</p>
                  <img src="${qrDataUrl}" alt="QR Code" style="width: 200px; height: 200px; border: 5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
                  <p style="font-size: 11px; color: #666; margin-top: 15px;">O fes clic al botó si ja estàs al mòbil:</p>
                  <a href="${surveyLink}" style="display: inline-block; background-color: #16143E; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">OBRIR ENQUESTA</a>
                </div>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: left;">Aquesta invitació és personal i intransferible.</p>
              </div>
            `,
          }),
        });

        if (response.ok) successCount++;
        else failCount++;
      } catch (err) {
        failCount++;
      }
    }

    return NextResponse.json({ 
      message: `Enviament finalitzat. Èxit: ${successCount}, Errors: ${failCount}.` 
    });

  } catch (error) {
    console.error('[API Send Emails Error]:', error);
    return NextResponse.json({ message: 'Error intern del servidor.' }, { status: 500 });
  }
}
