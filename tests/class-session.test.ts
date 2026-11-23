import test from 'node:test';
import assert from 'node:assert/strict';
import {mockLesson} from '../src/ai/mock';
import {lessonSchema,sampleIntake,type Lesson} from '../src/model/schema';
import {classDeck,classRows} from '../src/classroom/content';
const lesson:Lesson={id:'test',createdAt:'today',updatedAt:'today',status:'draft',input:sampleIntake,blueprint:mockLesson(sampleIntake),blueprintRevision:1};
test('classroom keeps vocabulary, substitutions and saved meanings consistent',()=>{
 const edited=lessonSchema.parse({...lesson,classroom:{frame:'I am {{단어}}.',replacements:{draw:'drawing a picture'}},handwriting:{includeExpressions:true,meanings:{draw:'그림을 그리다'}}});
 const deck=classDeck(edited),rows=classRows(edited);
 assert.equal(rows[0].cue,'그림을 그리다');assert.equal(deck.slides.find(s=>s.layout==='drill')?.sub,'I am drawing a picture.');
 assert.deepEqual(deck.slides.filter(s=>s.layout==='word').map(s=>s.title),lesson.blueprint.vocabulary);
 assert.equal(deck.slides.filter(s=>s.layout==='activity').length,lesson.blueprint.lessonFlow.length);
 assert.ok(deck.slides.find(s=>s.layout==='activity')?.body.includes(lesson.blueprint.lessonFlow[0].description));
 assert.ok(lessonSchema.safeParse(lesson).success);
});
test('classroom rejects broken frames and retains vocabulary beyond twenty',()=>{
 assert.throws(()=>classDeck({...lesson,classroom:{frame:'no slot',replacements:{}}}));
 const many={...lesson,blueprint:{...lesson.blueprint,vocabulary:Array.from({length:25},(_,i)=>'word'+i)},handwriting:{includeExpressions:true,meanings:Object.fromEntries(Array.from({length:25},(_,i)=>['word'+i,'단어'+i]))}};
 assert.equal(classRows(many).length,25);assert.equal(classDeck(many).slides.filter(s=>s.layout==='drill').length,25);
});
