import { z } from 'zod';

const text = z.string().max(4000);
const required = text.min(1);
const strings = z.array(text).max(60);
export const focusAreas = ['듣기', '말하기', '읽기', '쓰기', '어휘', '협력', '게임', '프로젝트'] as const;
export const environments = ['전자칠판', '학생 1인 1 Chromebook', 'Tablet', '일반 교실', '프린터 사용 가능', '인터넷 사용 가능'] as const;
export const styles = ['활동 중심', '게임 중심', '말하기 중심', '차분한 연습 중심', '균형형'] as const;
export const questionTypes = ['단어 연결', '빈칸 채우기', '문장 완성', '그림 보고 쓰기', '문장 배열', '짧은 읽기', '자유 쓰기'] as const;
export const metaSchema = z.object({ grade: z.number().int().min(3).max(6), subject: z.literal('English'), lessonTitle: text, duration: z.number().int().min(10).max(120), studentCount: z.number().int().min(1).max(40) });
export const intakeSchema = metaSchema.extend({ targetExpressions: strings, vocabulary: strings, focus: strings, environment: strings, style: z.enum(styles), notes: text });
export const validIntakeSchema = intakeSchema.refine(x => x.lessonTitle.trim().length > 0 && x.targetExpressions.some(e => e.trim()), '단원명과 핵심 표현을 입력해 주세요.');
export const activitySchema = z.object({ id: required, phase: z.enum(['Warm-up','Practice','Activity','Game','Wrap-up']), title: text, minutes: z.number().int().min(0).max(120), description: text, interaction: z.enum(['whole-class','pair','group','individual']), materials: strings });
export const blueprintSchema = z.object({ meta: metaSchema, objective: z.object({ ko: text, studentFriendly: text }), targetExpressions: strings, vocabulary: strings, lessonFlow: z.array(activitySchema).max(20), assessment: z.object({ focus: text, method: text }) });
export const generatedBlueprintSchema = blueprintSchema.superRefine((b,c) => {
 if (!b.objective.ko.trim() || !b.objective.studentFriendly.trim() || !b.targetExpressions.length || !b.lessonFlow.length || b.lessonFlow.some(a => !a.title.trim() || !a.description.trim() || a.minutes < 1)) c.addIssue({ code:'custom', message:'학습목표, 표현, 활동은 비어 있을 수 없습니다.' });
 if (b.lessonFlow.reduce((n,a)=>n+a.minutes,0)!==b.meta.duration) c.addIssue({code:'custom',message:'활동 시간의 합이 수업 시간과 다릅니다.'});
 if (new Set(b.lessonFlow.map(a=>a.id)).size!==b.lessonFlow.length) c.addIssue({code:'custom',message:'활동 ID가 중복됩니다.'});
});
export const questionSchema = z.object({ id: required, type: text, prompt: text, context: text, choices: strings, answer: text, teacherNote: text, usedVocabulary: strings });
export const sheetSchema = z.object({ title: text, instructions: text, questions: z.array(questionSchema).min(1).max(30), usedVocabulary: strings });
export const quizQuestionSchema = z.object({ id: required, question: required, choices: z.array(required).length(4), answerIndex: z.number().int().min(0).max(3), usedVocabulary: strings }).refine(q=>new Set(q.choices).size===4,'선택지는 서로 달라야 합니다.');
export const gameSchema = z.discriminatedUnion('gameType', [
 z.object({gameType:z.literal('quiz-show'), title:required, questions:z.array(quizQuestionSchema).min(1).max(20),usedVocabulary:strings}),
 z.object({gameType:z.literal('speed-quiz'),title:required,cards:z.array(z.object({id:required,prompt:required,answer:required})).min(1).max(30),usedVocabulary:strings}),
 z.object({gameType:z.literal('matching'),title:required,pairs:z.array(z.object({id:required,left:required,right:required})).min(2).max(12),usedVocabulary:strings})
]);
export const validatedGameSchema=gameSchema.superRefine((g,c)=>{if(g.gameType==='matching'&&(new Set(g.pairs.map(p=>p.id)).size!==g.pairs.length||new Set(g.pairs.map(p=>p.left)).size!==g.pairs.length||new Set(g.pairs.map(p=>p.right)).size!==g.pairs.length))c.addIssue({code:'custom',message:'매칭 카드에는 중복 ID나 동일한 항목이 없어야 합니다.'});});
export const worksheetOptionsSchema=z.object({difficulty:z.enum(['쉬움','보통','도전']),count:z.union([z.literal(5),z.literal(10),z.literal(15)]),types:z.array(z.enum(questionTypes)).min(1)});
export const assessmentOptionsSchema=z.object({kind:z.enum(['Exit Ticket','5문항 Quiz','10문항 Quiz']),areas:strings.min(1)});
export const materialSchema=<T extends z.ZodTypeAny>(data:T)=>z.object({data,blueprintRevision:z.number().int().min(1),createdAt:required,reviewed:z.boolean()});
export const lessonSchema=z.object({id:required,createdAt:required,updatedAt:required,status:z.enum(['draft','confirmed']),input:intakeSchema,blueprint:blueprintSchema,blueprintRevision:z.number().int().min(1),worksheet:materialSchema(sheetSchema).optional(),game:materialSchema(gameSchema).optional(),assessment:materialSchema(sheetSchema).optional()});
export const preferencesSchema=z.object({grade:z.number().int().min(3).max(6),duration:z.number().int().min(10).max(120),studentCount:z.number().int().min(1).max(40),environment:strings,style:z.enum(styles),mode:z.enum(['mock','live'])});
export const workspaceSchema=z.object({version:z.literal(1),lessons:z.array(lessonSchema).max(500),preferences:preferencesSchema,draft:intakeSchema.optional(),activeLessonId:text.optional()});
export const requestSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('lesson'),input:validIntakeSchema}),
 z.object({action:z.literal('worksheet'),blueprint:generatedBlueprintSchema,options:worksheetOptionsSchema}),
 z.object({action:z.literal('assessment'),blueprint:generatedBlueprintSchema,options:assessmentOptionsSchema}),
 z.object({action:z.literal('game'),blueprint:generatedBlueprintSchema,gameType:z.enum(['quiz-show','speed-quiz','matching'])}),
 z.object({action:z.literal('reviseActivity'),blueprint:generatedBlueprintSchema,activity:activitySchema,instruction:required}),
 z.object({action:z.literal('reviseQuestion'),blueprint:generatedBlueprintSchema,question:questionSchema,instruction:required})
]);
export type Intake=z.infer<typeof intakeSchema>;
export type Blueprint=z.infer<typeof blueprintSchema>;
export type Activity=z.infer<typeof activitySchema>;
export type Question=z.infer<typeof questionSchema>;
export type Sheet=z.infer<typeof sheetSchema>;
export type Game=z.infer<typeof gameSchema>;
export type Lesson=z.infer<typeof lessonSchema>;
export type Preferences=z.infer<typeof preferencesSchema>;
export type Workspace=z.infer<typeof workspaceSchema>;
export type AIRequest=z.infer<typeof requestSchema>;
export type WorksheetOptions=z.infer<typeof worksheetOptionsSchema>;
export type AssessmentOptions=z.infer<typeof assessmentOptionsSchema>;
export const defaults:Preferences={grade:4,duration:40,studentCount:24,environment:['전자칠판','학생 1인 1 Chromebook','프린터 사용 가능'],style:'균형형',mode:'mock'};
export const newIntake=(p:Preferences):Intake=>({...p,subject:'English',lessonTitle:'',targetExpressions:[''],vocabulary:[],focus:['말하기','읽기'],notes:''});
export const sampleIntake:Intake={...newIntake(defaults),lessonTitle:'Lesson 11. What Are You Doing?',targetExpressions:['What are you doing?',"I'm drawing a picture."],vocabulary:['draw','read','write','sing','dance','cook'],style:'활동 중심'};
export const emptyWorkspace=():Workspace=>({version:1,lessons:[],preferences:{...defaults}});
