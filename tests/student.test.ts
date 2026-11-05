import test from 'node:test';
import assert from 'node:assert/strict';
import {mockGame,mockLesson} from '../src/ai/mock';
import {sampleIntake} from '../src/model/schema';
import {encodeStudent,decodeStudent,gamePayload,speakingPayload} from '../src/sharing/payload';
import {roundItems} from '../src/games/arcade';
test('student links contain content only and exclude teacher notes and credentials',async()=>{
 const payload=gamePayload(mockGame(mockLesson(sampleIntake),'speed-quiz'));const privateData={...payload,accessToken:'secret-test',settings:{key:'private'}};
 const result=await decodeStudent(await encodeStudent(privateData));assert.deepEqual(result,payload);assert.ok(!JSON.stringify(result).includes('secret-test'));
 const speaking=speakingPayload('Practice',[{id:'1',title:'그리다',body:"I'm ________.",sub:"I'm drawing.",notes:'teacher-only-note'}]);assert.ok(!JSON.stringify(await decodeStudent(await encodeStudent(speaking))).includes('teacher-only-note'));
});
test('student decoder bounds links and decompressed data',async()=>{
 await assert.rejects(()=>decodeStudent('invalid*'));await assert.rejects(()=>decodeStudent('a'.repeat(12001)));
 const data=new Uint8Array(await new Response(new Blob(['x'.repeat(25000)]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());const token=btoa(String.fromCharCode(...data)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');await assert.rejects(()=>decodeStudent(token));
});
test('team rounds give equal turns, repeat only source cards and solo rounds remain bounded',()=>{
 const items=[{id:'a',english:'draw',meaning:'그리다'},{id:'b',english:'read',meaning:'읽다'}];const round=roundItems(items,{difficulty:'normal',teams:3,rounds:5});assert.equal(round.length,15);for(let team=0;team<3;team++)assert.equal(round.filter((_,i)=>i%3===team).length,5);assert.ok(round.every(x=>items.includes(x)));assert.equal(roundItems(items,{difficulty:'easy',teams:1,rounds:10}).length,2);assert.deepEqual(roundItems([],{difficulty:'normal',teams:3,rounds:5}),[]);
});
