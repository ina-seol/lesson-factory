import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleIntake,emptyWorkspace,workspaceSchema,type AIRequest,type Lesson} from '../src/model/schema';
import {mockLesson,mockGenerate} from '../src/ai/mock';
import {validateResponse} from '../src/ai/provider';
import {validExtraSchema,type Extra,type ExtraOptions} from '../src/model/extras';
import {unknownVocabulary,editBlueprint,isStale} from '../src/model/consistency';
import {parseBackup,readWorkspace,writeWorkspace} from '../src/storage/workspace';
import {buildPresentation,slidePages} from '../src/materials/presentation';
import {normalizeAnswer} from '../src/materials/ExtraPlayer';
import {getConnection,setConnection,clearConnection,getAIRequestTarget} from '../src/ai/connection';
const blueprint=mockLesson(sampleIntake);
const options:ExtraOptions[]=[{kind:'flashcards',source:'vocabulary',count:6,format:'choice'},{kind:'flashcards',source:'expressions',count:2,format:'choice'},{kind:'slides',source:'vocabulary',count:8,format:'choice'},{kind:'wordquiz',source:'vocabulary',count:6,format:'choice'},{kind:'wordquiz',source:'vocabulary',count:6,format:'spelling'}];
test('new materials match counts, schema and sample vocabulary',()=>{for(const o of options){const r:AIRequest={action:'extra',blueprint,options:o};const x=validateResponse(r,mockGenerate(r)) as Extra;assert.deepEqual(unknownVocabulary(blueprint,x),[]);}});
test('new materials survive autosave and backup; old backups load; Blueprint edits mark all stale',()=>{
 const w=emptyWorkspace(),l:Lesson={id:'one',createdAt:'now',updatedAt:'now',status:'confirmed',input:sampleIntake,blueprint,blueprintRevision:1};w.lessons=[l];assert.equal(parseBackup(JSON.stringify(w)).lessons.length,1);
 for(const o of [options[0],options[2],options[3]])Object.assign(l,{[o.kind]:{data:mockGenerate({action:'extra',blueprint,options:o}),createdAt:'now',reviewed:true,blueprintRevision:1}});
 const m=new Map<string,string>(),storage={getItem:(k:string)=>m.get(k)||null,setItem:(k:string,v:string)=>{m.set(k,v);}};writeWorkspace(storage,w);assert.deepEqual(readWorkspace(storage).data,workspaceSchema.parse(w));assert.deepEqual(parseBackup(JSON.stringify(w)),workspaceSchema.parse(w));
 const changed=editBlueprint(l,{...blueprint,vocabulary:[...blueprint.vocabulary,'jump']});for(const key of ['flashcards','slides','wordquiz'] as const)assert.ok(isStale(changed,key));
});
test('invalid quiz choices and foreign flashcard words rejected',()=>{
 const quiz=mockGenerate({action:'extra',blueprint,options:options[3]}) as Extract<Extra,{kind:'wordquiz'}>;quiz.questions[0].choices=['a','a','b','c'];assert.equal(validExtraSchema.safeParse(quiz).success,false);
 const r:AIRequest={action:'extra',blueprint,options:options[0]},cards=mockGenerate(r) as Extract<Extra,{kind:'flashcards'}>;cards.cards[0].front='ski';assert.throws(()=>validateResponse(r,cards));assert.ok(unknownVocabulary(blueprint,cards).includes('ski'));assert.equal(normalizeAnswer('  DRAW  '),normalizeAnswer('draw'));assert.notEqual(normalizeAnswer('drow'),normalizeAnswer('draw'));
});
test('PPTX export creates zipped PowerPoint and bounded content',async()=>{
 const deck=mockGenerate({action:'extra',blueprint,options:options[2]}) as Extract<Extra,{kind:'slides'}>;deck.slides[0].body='가'.repeat(600);const pages=slidePages(deck);assert.ok(pages.length>deck.slides.length);assert.ok(pages.every(p=>p.body.split('\n').length<=7));
 const pptx=await buildPresentation(deck),output=await pptx.write({outputType:'nodebuffer'});assert.ok(Buffer.isBuffer(output));assert.equal((output as Buffer).subarray(0,2).toString(),'PK');
});
test('connection persists across module reload, stays out of backups and can be removed',async()=>{
 const oldWindow=Object.getOwnPropertyDescriptor(globalThis,'window'),oldStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),data=new Map<string,string>();
 Object.defineProperty(globalThis,'window',{configurable:true,value:{location:{hostname:'ina-seol.github.io'}}});Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>data.set(k,v),removeItem:(k:string)=>data.delete(k)}});
 try{setConnection('https://example.workers.dev','test-only-token');const modulePath='../src/ai/connection.ts?reload-test',reloaded=await import(modulePath);assert.equal(reloaded.getConnection().accessToken,'test-only-token');assert.equal(getAIRequestTarget().url,'https://example.workers.dev/api/ai');assert.ok(!JSON.stringify(emptyWorkspace()).includes('test-only-token'));assert.throws(()=>setConnection('http://example.com','token'));assert.equal(getConnection().accessToken,'test-only-token');clearConnection();assert.equal(getConnection().accessToken,'');assert.throws(()=>getAIRequestTarget());}finally{if(oldWindow)Object.defineProperty(globalThis,'window',oldWindow);else Reflect.deleteProperty(globalThis,'window');if(oldStorage)Object.defineProperty(globalThis,'localStorage',oldStorage);else Reflect.deleteProperty(globalThis,'localStorage');}
});
