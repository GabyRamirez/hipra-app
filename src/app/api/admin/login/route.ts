import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // In a real app we would check against the 'Admin' model in Prisma
    // For simplicity and speed for this specific project, we can use the .env credentials
    // provided by the user or defined in the seed.
    
    const adminEmail = "admin@lainter.cat"; // From seed
    const adminPassword = process.env.ADMIN_PASSWORD || "hipra_admin_2026";

    if (email === adminEmail && password === adminPassword) {
      // Set a session cookie
      // In a production app, use a proper JWT
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'authenticated_session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return NextResponse.json({ message: 'Login correcte.' });
    }

    return NextResponse.json({ message: 'Credencials incorrectes.' }, { status: 401 });

  } catch (error) {
    console.error('[Admin Login Error]:', error);
    return NextResponse.json({ message: 'Error intern del servidor.' }, { status: 500 });
  }
}
