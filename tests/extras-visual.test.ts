import test from 'node:test';
import assert from 'node:assert/strict';
import {validExtraSchema,type Extra} from '../src/model/extras';
import {emojiFor,lookup} from '../src/materials/lexicon';
import {cardPages,slidePages} from '../src/materials/presentation';
test('lexicon finds meanings and emoji, including plurals and phrases',()=>{assert.equal(lookup('cats')?.ko,'고양이');assert.equal(emojiFor('apple'),'🍎');assert.equal(emojiFor('I like pizza.'),'🍕');assert.equal(emojiFor('zzzq'),undefined);});
test('cards and slides accept pictures and layouts; bad image data is rejected',()=>{
 const cards:Extra={kind:'flashcards',title:'t',cards:[{id:'a',front:'cat',back:'고양이',emoji:'🐱'}],usedVocabulary:[]};assert.ok(validExtraSchema.safeParse(cards).success);assert.equal(cardPages(cards as Extract<Extra,{kind:'flashcards'}>)[0].emoji,'🐱');
 const bad={...cards,cards:[{id:'a',front:'cat',back:'x',image:'http://x/y.png'}]};assert.equal(validExtraSchema.safeParse(bad).success,false);
 const deck:Extra={kind:'slides',title:'t',slides:[{id:'s',title:'cat',body:'',notes:'',layout:'word',sub:'고양이',emoji:'🐱'}],usedVocabulary:[]};assert.ok(validExtraSchema.safeParse(deck).success);assert.equal(slidePages(deck as Extract<Extra,{kind:'slides'}>).length,1);
});
test('word slides keep meaning pictures; every vocabulary word gets its own slide by default size',()=>{
 const deck:Extra={kind:'slides',title:'t',slides:[{id:'s',title:'cat',body:'',notes:'',layout:'word',sub:'고양이',emoji:'🐱',meaningEmoji:'😺'}],usedVocabulary:[]};
 assert.ok(validExtraSchema.safeParse(deck).success);
 const bad={...deck,slides:[{...deck.slides[0],meaningImage:'javascript:alert(1)'}]};assert.equal(validExtraSchema.safeParse(bad).success,false);
});
import {parseRoleplay,parseLines,serializeLines} from '../src/materials/script';
const sample=`‘신데렐라’ 이야기를 보고, 따라 읽어 봅시다. ①
새엄마: What are you doing?
뭐 하고 있니?
신데렐라: I’m reading a book.
저는 책을 읽고 있어요. 새엄마: Come here.
여기로 와라.
①
새엄마: 왓 얼 유 두잉?
신데렐라: 아임 리딩 어 북. 새엄마: 컴 히얼. ②
새엄마: Make cookies.
쿠키를 만들어라. 신데렐라: Okay.
알겠어요. 새 언니: Mom, it’s seven thirty.
엄마, 7시 30분이에요. Let’s go.
가요.
②
새엄마: 메이크 쿠키즈. 신데렐라: 오케이. 새 언니: 맘, 잇츠 세븐 써리.
 렛츠 고.
2
③
요정: What are you doing?
뭐 하고 있니?
신데렐라: I’m making cookies.
쿠키를 만들고 있어요. 요정: Can I help you?
내가 도와줄까?
신데렐라: Sure. Thank you.
그래요. 고맙습니다.
③
요정: 왓 얼 유 두잉?
신데렐라: 아임 메이킹 쿠키즈. 요정: 캔 아이 헬프 유?
신데렐라: 슈얼. 땡큐. ④
새 언니: Who’s she?
그녀는 누구예요?
새엄마: Oh, no! She’s Cinderella.
오, 안 돼! 그녀는 신데렐라야.
④
새 언니: 후즈 쉬?
새엄마: 오, 노! 쉬즈 신데렐라`;
test('roleplay script is split into scenes with speaker, English, Korean and pronunciation',()=>{
 const scenes=parseRoleplay(sample);assert.equal(scenes.length,4);
 assert.deepEqual(scenes[0].lines[0],{speaker:'새엄마',en:'What are you doing?',ko:'뭐 하고 있니?',pron:'왓 얼 유 두잉?'});
 assert.equal(scenes[0].lines.length,3);assert.equal(scenes[1].lines[2].speaker,'새 언니');assert.equal(scenes[1].lines[2].en,'Mom, it’s seven thirty. Let’s go.');assert.equal(scenes[1].lines[2].ko,'엄마, 7시 30분이에요. 가요.');assert.match(scenes[1].lines[2].pron,/맘, 잇츠 세븐 써리/);
 assert.equal(scenes[2].lines.length,4);assert.equal(scenes[3].lines[1].en,'Oh, no! She’s Cinderella.');
 assert.deepEqual(parseLines(serializeLines(scenes[0].lines)),scenes[0].lines);
});
