import type {Blueprint} from '../model/schema';
import type {Extra} from '../model/extras';
import {emojiFor,lookup} from './lexicon';
export const slot='{{단어}}';
const progressive:Record<string,string>={draw:'drawing',read:'reading',write:'writing',sing:'singing',dance:'dancing',cook:'cooking',run:'running',swim:'swimming',jump:'jumping',walk:'walking',play:'playing',help:'helping'};
export type SpeakingRow={word:string;cue:string;replacement:string;enabled:boolean};
export function speakingDefaults(b:Blueprint){
 const continuous=b.targetExpressions.some(e=>/^I['’]m\s+\w+ing\b/i.test(e));
 return {frame:continuous?`I'm ${slot}.`:(b.targetExpressions[0]||''),rows:b.vocabulary.slice(0,20).map(word=>({word,cue:lookup(word)?.ko||word,replacement:continuous?(progressive[word.toLowerCase()]||word):word,enabled:true}))};
}
export function makeSpeakingSlides(frame:string,rows:SpeakingRow[],idPrefix:string):Extract<Extra,{kind:'slides'}>['slides']{
 if(frame.split(slot).length!==2)throw new Error('문장 틀에 {{단어}}를 정확히 한 번 넣어 주세요.');
 const selected=rows.filter(r=>r.enabled);if(!selected.length)throw new Error('연습할 단어를 한 개 이상 선택해 주세요.');
 return selected.map((r,i)=>{if(!r.replacement.trim()||!r.cue.trim())throw new Error('선택한 단어의 힌트와 바꿔 넣을 말을 채워 주세요.');const answer=frame.replace(slot,r.replacement.trim());if(answer.length>200)throw new Error('완성 문장은 200자 이내로 줄여 주세요.');return {id:`${idPrefix}-${i}`,layout:'drill' as const,title:r.cue.slice(0,100),body:frame.replace(slot,'________'),sub:answer,emoji:emojiFor(r.word),notes:`바꿔 말하기\n문장 틀: ${frame}\n바꿀 말: ${r.replacement}\n예시 답: ${answer}\n1. 힌트를 보고 3~5초 동안 혼자 생각한다.\n2. 모두 함께 말한 뒤 짝에게 한 번씩 말한다.\n3. 화면을 눌러 예시 답을 확인한다.\n4. 다음 단어로 넘어가 같은 문장 틀을 반복한다.\n지원: 문법·관사·단복수와 동사 형태를 수업 전에 확인한다. 정답 공개 후에는 화면 없이 한 번 더 말해 본다.`};});
}
