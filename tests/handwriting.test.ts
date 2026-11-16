import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FourLine,HandwritingWorksheet,writingEntries,writingPages} from '../src/materials/HandwritingWorksheet';
import {sampleIntake,emptyWorkspace,type Lesson} from '../src/model/schema';
import {mockLesson} from '../src/ai/mock';
import {parseBackup} from '../src/storage/workspace';
const lesson:Lesson={id:'writing',createdAt:'now',updatedAt:'now',status:'draft',input:sampleIntake,blueprint:mockLesson(sampleIntake),blueprintRevision:1};
test('writing portfolio has a trace row and three blank four-rule rows for each source item',()=>{
 const html=renderToStaticMarkup(createElement(HandwritingWorksheet,{lesson,onChange:()=>{}}));
 assert.equal((html.match(/class="four-line"/g)||[]).length,32);assert.equal((html.match(/<line /g)||[]).length,128);assert.equal((html.match(/<text /g)||[]).length,8);assert.ok(html.includes('draw'));assert.ok(html.includes('Key Expressions'));
 const escaped=renderToStaticMarkup(createElement(FourLine,{text:'<script>alert(1)</script>'}));assert.ok(!escaped.includes('<script>'));assert.ok(escaped.includes('&lt;script&gt;'));
});
test('writing pages preserve order and paginate words six per page and expressions three',()=>{
 const entries=Array.from({length:19},(_,i)=>({english:`word${i}`,meaning:''}));const pages=writingPages(entries,entries.slice(0,4));assert.deepEqual(pages.map(p=>p.entries.length),[6,6,6,1,3,1]);assert.deepEqual(pages.filter(p=>p.kind==='words').flatMap(p=>p.entries),entries);assert.deepEqual(writingPages([],[]),[]);
});
test('meanings and expression preference survive backup while old lessons stay compatible',()=>{
 const w=emptyWorkspace();w.lessons=[lesson];assert.equal(parseBackup(JSON.stringify(w)).lessons.length,1);
 const edited={...lesson,handwriting:{meanings:{draw:'그림을 그리다'},includeExpressions:false}};w.lessons=[edited];const restored=parseBackup(JSON.stringify(w)).lessons[0];assert.equal(writingEntries(restored,'words')[0].meaning,'그림을 그리다');assert.equal(restored.handwriting?.includeExpressions,false);
 const html=renderToStaticMarkup(createElement(HandwritingWorksheet,{lesson:restored,onChange:()=>{}}));assert.ok(!html.includes('2. Key Expressions'));assert.equal((html.match(/class="four-line"/g)||[]).length,24);
});
