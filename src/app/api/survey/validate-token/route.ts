import { NextResponse } from 'next/server';
import { validateWorkerToken } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ message: 'Token no proporcionat.' }, { status: 400 });
  }

  const { worker, error } = await validateWorkerToken(token);

  if (error) {
    return NextResponse.json({ message: error }, { status: 403 });
  }

  return NextResponse.json({ worker });
}
