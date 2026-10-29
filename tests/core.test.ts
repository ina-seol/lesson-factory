import test from 'node:test';
import assert from 'node:assert/strict';
import { createId } from '../src/model/id';
import { sampleIntake, emptyWorkspace, workspaceSchema, type AIRequest, type Lesson } from '../src/model/schema';
import { mockGenerate, mockLesson } from '../src/ai/mock';
import { validateResponse } from '../src/ai/provider';
import { generateValidated, handleAI } from '../src/ai/server';
import { editBlueprint, isStale, unknownVocabulary } from '../src/model/consistency';
import { readWorkspace, writeWorkspace, parseBackup, mergeBackup, STORAGE_KEY } from '../src/storage/workspace';
import { chooseAnswer, initialQuiz, nextQuestion, secondsRemaining, matchPair } from '../src/games/state';

test('record IDs work without crypto.randomUUID and remain distinct', () => {
  const httpCrypto = { getRandomValues: crypto.getRandomValues.bind(crypto) };
  const ids = Array.from({ length: 100 }, () => createId(httpCrypto));
  assert.equal(new Set(ids).size, ids.length);
  ids.forEach(id => assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
});

test('sample Blueprint and all five material outputs meet their schemas and vocabulary', () => {
  const blueprint = mockLesson(sampleIntake);
  validateResponse({ action: 'lesson', input: sampleIntake }, blueprint);
  assert.equal(blueprint.lessonFlow.reduce((sum, a) => sum + a.minutes, 0), 40);
  const requests: AIRequest[] = [
    { action: 'worksheet', blueprint, options: { difficulty: '보통', count: 5, types: ['단어 연결', '빈칸 채우기', '문장 배열'] } },
    { action: 'assessment', blueprint, options: { kind: 'Exit Ticket', areas: ['말하기', '읽기'] } },
    ...(['quiz-show', 'speed-quiz', 'matching'] as const).map(gameType => ({ action: 'game' as const, blueprint, gameType })),
  ];
  for (const request of requests) {
    const material = validateResponse(request, mockGenerate(request));
    assert.deepEqual(unknownVocabulary(blueprint, material as Parameters<typeof unknownVocabulary>[1]), []);
  }
});

test('AI repairs malformed JSON once and rejects repeated failure', async () => {
  const request: AIRequest = { action: 'lesson', input: sampleIntake };
  let calls = 0;
  const result = await generateValidated(request, async () => ++calls === 1 ? '{invalid' : JSON.stringify(mockLesson(sampleIntake)));
  assert.equal(calls, 2);
  assert.deepEqual(result, mockLesson(sampleIntake));
  calls = 0;
  await assert.rejects(generateValidated(request, async () => { calls++; return '{}'; }), /두 번 검증/);
  assert.equal(calls, 2);
});

test('missing API key returns a recoverable error without contacting a provider', async () => {
  const response = await handleAI(new Request('https://lesson.example/api/ai', { method: 'POST', body: '{}' }), {}, async () => { throw new Error('must not fetch'); });
  assert.equal(response.status, 503);
  assert.match(await response.text(), /Mock Mode/);
});

test('backup round trip preserves lesson data and import creates new lesson IDs', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const workspace = emptyWorkspace();
  workspace.lessons.push({ id: 'original', createdAt: '2026-10-29T00:00:00Z', updatedAt: '2026-10-29T00:00:00Z', status: 'draft', input: sampleIntake, blueprint: mockLesson(sampleIntake), blueprintRevision: 1 });
  writeWorkspace(storage, workspace);
  assert.deepEqual(readWorkspace(storage).data, workspaceSchema.parse(workspace));
  const backup = parseBackup(values.get(STORAGE_KEY)!);
  values.clear();
  const recovered = mergeBackup(emptyWorkspace(), backup, () => 'restored');
  writeWorkspace(storage, recovered);
  assert.equal(readWorkspace(storage).data.lessons[0].id, 'restored');
  assert.deepEqual(recovered.lessons[0].blueprint, workspace.lessons[0].blueprint);
  assert.throws(() => parseBackup('{"version":99}'));
});

test('Blueprint edits return to draft and mark existing materials stale', () => {
  const blueprint = mockLesson(sampleIntake);
  const request: AIRequest = { action: 'worksheet', blueprint, options: { difficulty: '보통', count: 5, types: ['문장 배열'] } };
  const lesson: Lesson = { id: 'lesson', createdAt: 'now', updatedAt: 'now', status: 'confirmed', input: sampleIntake, blueprint, blueprintRevision: 1, worksheet: { data: mockGenerate(request) as NonNullable<Lesson['worksheet']>['data'], blueprintRevision: 1, reviewed: true, createdAt: 'now' } };
  const changed = editBlueprint(lesson, { ...blueprint, vocabulary: [...blueprint.vocabulary, 'jump'] });
  assert.equal(changed.status, 'draft');
  assert.equal(isStale(changed, 'worksheet'), true);
  assert.equal(lesson.blueprintRevision, 1);
});

test('Quiz Show prevents repeated scoring and completes on the final question', () => {
  let state = chooseAnswer(initialQuiz(), 1, 1);
  state = chooseAnswer(state, 1, 1);
  assert.equal(state.score, 1);
  state = nextQuestion(state, 2);
  state = chooseAnswer(state, 0, 1);
  state = chooseAnswer(state, 1, 1);
  assert.equal(state.score, 1);
  assert.equal(nextQuestion(state, 2).finished, true);
});

test('Speed Quiz uses elapsed wall-clock time and Matching ignores duplicate matches', () => {
  assert.equal(secondsRemaining(60000, 0), 60);
  assert.equal(secondsRemaining(60000, 59500), 1);
  assert.equal(secondsRemaining(60000, 70000), 0);
  assert.deepEqual(matchPair('a', 'b', []), { matched: [], correct: false });
  assert.deepEqual(matchPair('a', 'a', []), { matched: ['a'], correct: true });
  assert.deepEqual(matchPair('a', 'a', ['a']), { matched: ['a'], correct: false });
});
