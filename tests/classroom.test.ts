import test from 'node:test';
import assert from 'node:assert/strict';
import {mockLesson,mockGame} from '../src/ai/mock';
import {sampleIntake} from '../src/model/schema';
import {recommendedSlideCount} from '../src/materials/lessonSlides';
import {mockExtra} from '../src/materials/mockExtra';
import {validateResponse} from '../src/ai/provider';
import {unknownVocabulary} from '../src/model/consistency';
import {arcadeItems,eligible,tilesFor,meaningChoices,award,normalize} from '../src/games/arcade';
const blueprint=mockLesson(sampleIntake);
test('full lesson deck keeps two actionable pages per activity and teacher support notes',()=>{
 const options={kind:'slides' as const,source:'vocabulary' as const,count:recommendedSlideCount(blueprint),format:'choice' as const};
 const deck=mockExtra(blueprint,options);validateResponse({action:'extra',blueprint,options},deck);
 assert.equal(deck.kind,'slides');if(deck.kind!=='slides')return;
 assert.equal(deck.slides.filter(s=>s.layout==='activity').length,blueprint.lessonFlow.length);
 assert.ok(deck.slides.filter(s=>s.layout==='activity').every(s=>s.body.includes('①')&&s.notes.includes('지원:')&&s.notes.includes('확인:')));
 assert.equal(deck.slides.filter(s=>s.layout==='word').length,blueprint.vocabulary.length);
 assert.deepEqual(unknownVocabulary(blueprint,deck),[]);
});
test('arcade uses reviewed content and distinguishes word and expression modes',()=>{
 const items=arcadeItems(mockGame(blueprint,'speed-quiz'));
 assert.ok(items.length>=6);assert.ok(eligible(items,'letters').every(x=>!x.english.includes(' ')));
 const sentence={id:'s',english:'What are you doing?',meaning:'무엇을 하고 있니?'};
 assert.equal(eligible([...items,sentence],'sentence').at(-1)?.id,'s');
 assert.equal(eligible([sentence],'letters').length,0);
 const tiles=tilesFor('letter','letters');assert.equal(new Set(tiles.map(t=>t.id)).size,6);assert.equal(tiles.sort((a,b)=>a.id-b.id).map(t=>t.text).join(''),'letter');
 const choices=meaningChoices(items[0],items);assert.equal(new Set(choices).size,choices.length);assert.ok(choices.includes(items[0].meaning));
 assert.equal(normalize('  DRAW  '),'draw');assert.deepEqual(award(true,8,false),{streak:9,points:200});assert.deepEqual(award(false,4,false),{streak:0,points:0});assert.equal(award(true,5,true).points,50);
});

test('speaking drills build hidden prompts with accurate editable substitutions',async()=>{
 const {speakingDefaults,makeSpeakingSlides}=await import('../src/materials/speaking');
 const d=speakingDefaults(blueprint),slides=makeSpeakingSlides(d.frame,d.rows,'test');
 assert.equal(slides.length,6);assert.equal(slides[0].body,"I'm ________.");assert.equal(slides[0].sub,"I'm drawing.");assert.equal(slides[2].sub,"I'm writing.");assert.equal(slides[4].sub,"I'm dancing.");
 assert.throws(()=>makeSpeakingSlides('No slot',d.rows,'x'));assert.throws(()=>makeSpeakingSlides('{{단어}} {{단어}}',d.rows,'x'));
 const custom=makeSpeakingSlides('I like {{단어}}.',[{word:'apple',cue:'사과',replacement:'apples',enabled:true}],'x');assert.equal(custom[0].sub,'I like apples.');
 const foreign={kind:'slides' as const,title:'test',slides:[{...slides[0],sub:'I am skiing.'}],usedVocabulary:[]};assert.ok(unknownVocabulary(blueprint,foreign).includes('skiing'));
});
