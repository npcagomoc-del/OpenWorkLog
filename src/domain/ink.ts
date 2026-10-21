import { z } from 'zod';

export const inkPointSchema = z.strictObject({
  x: z.number().min(0).max(8192),
  y: z.number().min(0).max(8192),
  pressure: z.number().min(0).max(1),
});
export const inkStrokeSchema = z.strictObject({
  id: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  width: z.number().min(0.25).max(64),
  points: z.array(inkPointSchema).min(1).max(10000),
});
export const inkDocumentSchema = z
  .strictObject({
    version: z.literal(1),
    width: z.number().positive().max(8192),
    height: z.number().positive().max(8192),
    strokes: z.array(inkStrokeSchema).max(2000),
  })
  .superRefine((document, context) => {
    if (document.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0) > 100000)
      context.addIssue({ code: 'custom', message: 'Drawing exceeds 100000 points.' });
    if (new Set(document.strokes.map((stroke) => stroke.id)).size !== document.strokes.length)
      context.addIssue({ code: 'custom', message: 'Drawing has duplicate stroke IDs.' });
    if (
      document.strokes.some((stroke) =>
        stroke.points.some((point) => point.x > document.width || point.y > document.height),
      )
    )
      context.addIssue({
        code: 'custom',
        message: 'Drawing points must remain inside the canvas.',
      });
  });
export type InkPoint = Readonly<z.infer<typeof inkPointSchema>>;
export type InkStroke = Readonly<z.infer<typeof inkStrokeSchema>>;
export type InkDocument = Readonly<z.infer<typeof inkDocumentSchema>>;
