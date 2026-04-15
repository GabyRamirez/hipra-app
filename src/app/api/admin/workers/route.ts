import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSecureToken } from '@/lib/auth';

export async function GET() {
  try {
    const workers = await prisma.worker.findMany({
      include: { response: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(workers);
  } catch (error) {
    return NextResponse.json({ message: 'Error recuperant dades.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Check if batch import
    if (Array.isArray(data)) {
        const results = [];
        for (const item of data) {
            if (!item.email) continue;
            const worker = await prisma.worker.upsert({
                where: { email: item.email.toLowerCase().trim() },
                update: { name: item.name },
                create: {
                    email: item.email.toLowerCase().trim(),
                    name: item.name,
                    token: generateSecureToken(),
                }
            });
            results.push(worker);
        }
        return NextResponse.json({ message: `${results.length} treballadors processats.` });
    }

    // Single creation
    const { email, name } = data;
    if (!email) return NextResponse.json({ message: 'Email requerit.' }, { status: 400 });

    const worker = await prisma.worker.create({
      data: {
        email: email.toLowerCase().trim(),
        name,
        token: generateSecureToken(),
      }
    });

    return NextResponse.json(worker);

  } catch (error) {
    console.error('[API Workers Error]:', error);
    return NextResponse.json({ message: 'Error guardant treballador.' }, { status: 500 });
  }
}
