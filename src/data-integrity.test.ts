import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

// Validates the split data model documented in CLAUDE.md against the real files
// in public/data. Kept at that doc's altitude: schema shape + referential
// integrity only (no portrait-file-exists or every-person-belongs-to-an-instrument
// checks, which are intentionally looser in the data).

const dataDir = resolve(process.cwd(), 'public/data');
const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(resolve(dataDir, file), 'utf8'));

const parseOrThrow = <T>(schema: z.ZodType<T>, value: unknown): T => {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(z.prettifyError(result.error));
  return result.data;
};

const eraSchema = z.object({
  name: z.string().min(1),
  startYear: z.number().int(),
  endYear: z.number().int(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'expected a #RRGGBB hex color'),
});

const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  fullName: z.string().min(1).optional(),
  born: z.number().int(),
  bornEstimated: z.boolean().optional(),
  died: z.number().int().nullable(),
  role: z.enum(['composer', 'player', 'both']),
  gender: z.enum(['female', 'male', 'unknown']).optional(),
  bio: z.string(),
  photoUrl: z.string().nullable(),
  wikiUrl: z.string().nullable(),
  websiteUrl: z.string().nullable(),
});

const connectionSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  type: z.enum(['relative', 'student-teacher']),
  label: z.string().optional(),
});

const instrumentConfigSchema = z.object({
  instrument: z.string().min(1),
  eras: z.array(eraSchema).min(1),
  peopleIds: z.array(z.string().min(1)).min(1),
});

const people = parseOrThrow(z.array(personSchema), readJson('people.json'));
const personIds = new Set(people.map((p) => p.id));

const instrumentFiles = readdirSync(dataDir).filter(
  (f: string) =>
    f.endsWith('.json') && f !== 'people.json' && f !== 'connections.json',
);

const duplicates = (ids: string[]): string[] =>
  ids.filter((id, i) => ids.indexOf(id) !== i);

describe('people.json', () => {
  test('every entry matches the Person schema', () => {
    parseOrThrow(z.array(personSchema), readJson('people.json'));
  });

  test('person ids are unique', () => {
    expect(duplicates(people.map((p) => p.id))).toEqual([]);
  });
});

describe('connections.json', () => {
  const connections = parseOrThrow(
    z.array(connectionSchema),
    readJson('connections.json'),
  );

  test('every entry matches the Connection schema', () => {
    parseOrThrow(z.array(connectionSchema), readJson('connections.json'));
  });

  test('every from/to references a person in people.json', () => {
    const dangling = connections
      .filter((c) => !personIds.has(c.from) || !personIds.has(c.to))
      .map((c) => `${c.from} -> ${c.to}`);
    expect(dangling).toEqual([]);
  });
});

test('at least one instrument config is present', () => {
  expect(instrumentFiles.length).toBeGreaterThan(0);
});

describe.each(instrumentFiles)('%s', (file: string) => {
  const config = parseOrThrow(instrumentConfigSchema, readJson(file));

  test('matches the InstrumentConfig schema', () => {
    parseOrThrow(instrumentConfigSchema, readJson(file));
  });

  test('every peopleId exists in people.json', () => {
    const missing = config.peopleIds.filter((id) => !personIds.has(id));
    expect(missing).toEqual([]);
  });

  test('has no duplicate peopleIds', () => {
    expect(duplicates(config.peopleIds)).toEqual([]);
  });
});
