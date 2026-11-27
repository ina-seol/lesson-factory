import test from 'node:test';
import assert from 'node:assert/strict';
import {mockLesson} from '../src/ai/mock';
import {sampleIntake,lessonSchema} from '../src/model/schema';
import {speakingDefaults,speakingPatterns,makeSpeakingSlides} from '../src/materials/speaking';
const base=mockLesson(sampleIntake);
function sentences(expressions:string[],words:string[]){const d=speakingDefaults({...base,targetExpressions:expressions,vocabulary:words});return makeSpeakingSlides(d.frame,d.rows,'x').map(s=>s.sub);}
test('substitution preserves the original action phrase without copying its object to other verbs',()=>{
 assert.deepEqual(sentences(['What are you doing?',"I'm drawing a picture."],['draw','read','write']),["I'm drawing a picture.","I'm reading.","I'm writing."]);
});
test('weather, preferences, objects and ability frames come from answers rather than questions',()=>{
 assert.deepEqual(sentences(["How's the weather?","It's sunny."],['sunny','rainy']),["It's sunny.","It's rainy."]);
 assert.deepEqual(sentences(['I like apples.'],['apple','banana','milk']),['I like apples.','I like bananas.','I like milk.']);
 assert.deepEqual(sentences(["It's a pencil."],['pencil','eraser']),["It's a pencil.","It's an eraser."]);
 assert.deepEqual(sentences(['Can you swim?','I can swim.'],['swim','dance']),['I can swim.','I can dance.']);
});
test('multiple target answers are selectable and unmatched expressions require an explicit teacher frame',()=>{
 assert.equal(speakingPatterns({...base,targetExpressions:['I can swim.','I like apples.'],vocabulary:['swim','apple']}).length,2);
 assert.equal(speakingDefaults({...base,targetExpressions:['Hello!'],vocabulary:['cat']}).frame,'{{단어}}');
});
test('custom question persists through validation without breaking old lesson records',()=>{
 const l={id:'x',createdAt:'now',updatedAt:'now',status:'draft',input:sampleIntake,blueprint:base,blueprintRevision:1};
 assert.ok(lessonSchema.safeParse(l).success);
 assert.equal(lessonSchema.parse({...l,classroom:{frame:'I can {{단어}}.',question:'Can you swim?',replacements:{}}}).classroom?.question,'Can you swim?');
});
