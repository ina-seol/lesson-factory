import {z} from 'zod';
const short=z.string().trim().min(1).max(240),vocabulary=z.array(z.string().max(120)).max(60);
export const extraSchema=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('flashcards'),title:short,cards:z.array(z.object({id:short,front:short,back:short})).min(1).max(30),usedVocabulary:vocabulary}),
 z.object({kind:z.literal('slides'),title:short,slides:z.array(z.object({id:short,title:z.string().trim().min(1).max(100),body:z.string().trim().min(1).max(600),notes:z.string().max(1200)})).min(1).max(20),usedVocabulary:vocabulary}),
 z.object({kind:z.literal('wordquiz'),title:short,format:z.enum(['choice','spelling']),questions:z.array(z.object({id:short,prompt:short,answer:short,choices:z.array(short).max(4)})).min(1).max(20),usedVocabulary:vocabulary})
]);
export const validExtraSchema=extraSchema.superRefine((x,c)=>{
 const items=x.kind==='flashcards'?x.cards:x.kind==='slides'?x.slides:x.questions;
 if(new Set(items.map(i=>i.id)).size!==items.length)c.addIssue({code:'custom',message:'항목 ID는 서로 달라야 합니다.'});
 if(x.kind==='wordquiz')for(const q of x.questions){
 if(x.format==='choice'&&(q.choices.length!==4||new Set(q.choices).size!==4||!q.choices.includes(q.answer)))c.addIssue({code:'custom',message:'객관식은 서로 다른 선택지 4개와 그중 하나인 정답이 필요합니다.'});
 if(x.format==='spelling'&&q.choices.length)c.addIssue({code:'custom',message:'철자 쓰기에는 선택지를 넣지 마세요.'});}
});
export const extraOptionsSchema=z.object({kind:z.enum(['flashcards','slides','wordquiz']),count:z.number().int().min(1).max(20),source:z.enum(['vocabulary','expressions']),format:z.enum(['choice','spelling'])});
export type Extra=z.infer<typeof extraSchema>;
export type ExtraKind=Extra['kind'];
export type ExtraOptions=z.infer<typeof extraOptionsSchema>;
