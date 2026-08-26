import { z } from 'zod';
import { DIFFICULTY } from '../constants/assessmentConstants';

// ─── Assessment form ──────────────────────────────────────────────────────────

export const assessmentSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().trim().optional(),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(1, 'Duration must be at least 1 minute')
      .max(1440, 'Duration cannot exceed 24 hours'),
    maxAttempts: z.coerce.number().int().min(1).max(10).default(1),
    startTime: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.startTime) < new Date(data.endTime);
      }
      return true;
    },
    { message: 'End time must be after start time', path: ['endTime'] },
  );

// ─── Test case sub-form ───────────────────────────────────────────────────────

export const testCaseSchema = z.object({
  inputData: z.string().optional().nullable(),
  expectedOutput: z.string().min(1, 'Expected output is required'),
  sample: z.boolean().default(false),
  hidden: z.boolean().default(true),
  weight: z.coerce.number().int().min(1, 'Weight must be at least 1').default(1),
});

// ─── Question form ────────────────────────────────────────────────────────────

export const questionSchema = z.object({
  title: z.string().trim().min(1, 'Question title is required').max(500),
  description: z.string().trim().min(1, 'Problem statement is required'),
  inputFormat: z.string().trim().optional().nullable(),
  outputFormat: z.string().trim().optional().nullable(),
  constraints: z.string().trim().optional().nullable(),
  difficulty: z.nativeEnum(DIFFICULTY, { message: 'Select a difficulty level' }),
  compiler: z.string().optional().default('ALL'),
  marks: z.coerce.number().int().min(1).max(100).default(10),
  timeLimitMs: z.coerce.number().int().min(100).max(10000).default(2000),
  memoryLimitMb: z.coerce.number().int().min(16).max(1024).default(256),
  testCases: z.array(testCaseSchema).min(1, 'Add at least one test case'),
});
