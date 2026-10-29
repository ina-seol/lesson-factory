import type { Blueprint, Game, Sheet, Lesson } from './schema';
const functional=new Set(('a an the i m you he she it we they is are am be do does doing did can could will would should have has my your his her our their this that these those what where when who how why which and or but so to of in on at for from with into as by up down out not no yes please now today name match complete choose circle write read listen say look answer question words word sentence sentences picture pictures order correct wrong try again start finish pass score time point points seconds help me us them all some one two three four five six seven eight nine ten each then first next last thank thanks s t don don’t').split(' '));
export const tokens=(s:string)=>(s.toLowerCase().replace(/[’]/g,"'").match(/[a-z]+(?:'[a-z]+)?/g)||[]);
function forms(word:string){const w=word.toLowerCase();return [w,w+'s',w+'es',w+'ing',w+'ed',w.endsWith('e')?w.slice(0,-1)+'ing':w,w==='write'?'writing':w,w==='run'?'running':w];}
export function unknownVocabulary(b:Blueprint,m:Sheet|Game):string[]{
 const allowed=new Set([...functional,...b.targetExpressions.flatMap(tokens),...b.vocabulary.flatMap(tokens).flatMap(forms)]);
 let content:string[]=[];
 if('questions' in m) content=m.questions.flatMap(q=>'prompt' in q?[q.prompt,q.context,...q.choices,q.answer]:[q.question,...q.choices]);
 else if('cards' in m) content=m.cards.flatMap(c=>[c.prompt,c.answer]);
 else content=m.pairs.flatMap(p=>[p.left,p.right]);
 const declared=m.usedVocabulary.flatMap(tokens);
 return [...new Set([...declared,...content.flatMap(tokens)].filter(t=>!allowed.has(t)))].sort();
}
export const isStale=(lesson:Lesson,key:'worksheet'|'game'|'assessment')=>!!lesson[key]&&lesson[key]!.blueprintRevision!==lesson.blueprintRevision;
export function editBlueprint(lesson:Lesson,blueprint:Blueprint):Lesson{return {...lesson,blueprint,status:'draft',blueprintRevision:lesson.blueprintRevision+1,updatedAt:new Date().toISOString()};}
