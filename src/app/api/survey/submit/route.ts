import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateWorkerToken } from '@/lib/auth';
import { surveyFactors, calculateProfessionalGroup } from '@/lib/survey-data';

export async function POST(req: Request) {
  try {
    const { token, answers } = await req.json();

    if (!token || !answers) {
      return NextResponse.json({ message: 'Dades incompletes.' }, { status: 400 });
    }

    // 1. Validate Token
    const { worker, error } = await validateWorkerToken(token);
    if (error) {
      return NextResponse.json({ message: error }, { status: 403 });
    }

    // 2. Validate all factors are present
    const answeredIds = Object.keys(answers).map(Number);
    const missing = surveyFactors.filter(f => !answeredIds.includes(f.id));
    if (missing.length > 0) {
      return NextResponse.json({ message: 'Falten respostes en alguns factors.' }, { status: 400 });
    }

    // 3. Calculate Scores
    let totalScore = 0;
    const factorScores: Record<string, number> = {};

    for (const factor of surveyFactors) {
      const selectedGrade = answers[factor.id];
      const gradeData = factor.grades.find(g => g.grade === selectedGrade);
      
      if (!gradeData) {
        return NextResponse.json({ message: `Grau no vàlid per al factor ${factor.id}` }, { status: 400 });
      }

      totalScore += gradeData.points;
      factorScores[`factor${factor.id}`] = gradeData.points;
    }

    const professionalGroup = calculateProfessionalGroup(totalScore);

    // 4. Save in Database (Atomic Transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Create response
      const response = await tx.surveyResponse.create({
        data: {
          workerId: worker!.id,
          ...factorScores as any,
          totalScore,
          professionalGroup,
        }
      });

      // Mark worker as answered
      await tx.worker.update({
        where: { id: worker!.id },
        data: {
          hasAnswered: true,
          answeredAt: new Date(),
        }
      });

      return { professionalGroup, totalScore };
    });

    return NextResponse.json({ results: result });

  } catch (error) {
    console.error('[API Survey Submit Error]:', error);
    return NextResponse.json({ message: 'Error intern del servidor.' }, { status: 500 });
  }
}
