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
