import { randomBytes } from "crypto";
import { prisma } from "./db";

/**
 * Generates a random secure token for unique access.
 */
export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Validates a token and returns the associated worker if valid and has not answered yet.
 */
export async function validateWorkerToken(token: string) {
  const worker = await prisma.worker.findUnique({
    where: { token }
  });

  if (!worker) {
    return { error: "Token no vàlid." };
  }

  if (worker.hasAnswered) {
    return { error: "Aquesta enquesta ja ha estat completada.", worker };
  }

  return { worker };
}
