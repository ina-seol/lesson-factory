import type {Blueprint} from '../model/schema';
import type {Extra} from '../model/extras';
import {emojiFor,lookup} from './lexicon';
export const slot='{{단어}}';
const progressive:Record<string,string>={draw:'drawing',read:'reading',write:'writing',sing:'singing',dance:'dancing',cook:'cooking',run:'running',swim:'swimming',jump:'jumping',walk:'walking',play:'playing',help:'helping',eat:'eating',drink:'drinking',sleep:'sleeping',study:'studying',listen:'listening',watch:'watching',ride:'riding',make:'making',sit:'sitting',stand:'standing',clap:'clapping',go:'going',come:'coming'};
export type SpeakingRow={word:string;cue:string;replacement:string;enabled:boolean};
// Infer only a visible span from a unit expression; never attach one verb's object to another verb.
const plural:Record<string,string>={apple:'apples',banana:'bananas',grape:'grapes',strawberry:'strawberries',orange:'oranges',peach:'peaches',egg:'eggs',cookie:'cookies',sandwich:'sandwiches',cat:'cats',dog:'dogs'};
export function speakingPatterns(b:Blueprint){
 const question=b.targetExpressions.find(e=>e.trim().endsWith('?'))||'';
 return b.targetExpressions.filter(e=>!e.trim().endsWith('?')).flatMap(expression=>{
  const text=expression.trim();
  for(const word of [...b.vocabulary].sort((a,b)=>b.length-a.length)){
   const key=word.trim().toLowerCase();
   const forms=[progressive[key],plural[key],key].filter(Boolean);
   for(const form of forms){
    const start=text.toLowerCase().indexOf(form);
    if(start<0||/[a-z]/i.test(text[start-1]||'')||/[a-z]/i.test(text[start+form.length]||''))continue;
    let prefix=text.slice(0,start),tail=text.slice(start+form.length),kind:'plain'|'continuous'|'article'|'plural'='plain';
    let exemplar=form;
    if(form===progressive[key]){kind='continuous';exemplar=text.slice(start).replace(/[.!]$/,'');tail=text.match(/[.!]$/)?.[0]||'';}
    else if(/\b(?:a|an) $/i.test(prefix)){kind='article';prefix=prefix.replace(/(?:a|an) $/i,'');exemplar=text.slice(start).replace(/[.!]$/,'');}
    else if(form===plural[key])kind='plural';
    const frame=prefix+slot+tail;
    const rows=b.vocabulary.map(w=>{const k=w.trim().toLowerCase();let replacement=w;
     if(kind==='continuous')replacement=k===key?exemplar:(progressive[k]||w);
     if(kind==='article')replacement=/^(a|an|the) /i.test(w)?w:(/^[aeiou]/i.test(w)?'an ':'a ')+w;
     if(kind==='plural')replacement=plural[k]||w;
     return {word:w,cue:lookup(w)?.ko||w,replacement,enabled:true};
    });
    const position=b.targetExpressions.indexOf(expression);
    const pairedQuestion=b.targetExpressions.slice(0,position).reverse().find(e=>e.trim().endsWith('?'))||question;
    return [{expression,question:pairedQuestion,frame,rows}];
   }
  }
  return [];
 });
}
export function speakingDefaults(b:Blueprint){
 return speakingPatterns(b)[0]||{expression:'',question:b.targetExpressions.find(e=>e.includes('?'))||'',frame:slot,rows:b.vocabulary.map(word=>({word,cue:lookup(word)?.ko||word,replacement:word,enabled:true}))};
}
export function makeSpeakingSlides(frame:string,rows:SpeakingRow[],idPrefix:string):Extract<Extra,{kind:'slides'}>['slides']{
 if(frame.split(slot).length!==2)throw new Error('문장 틀에 {{단어}}를 정확히 한 번 넣어 주세요.');
 const selected=rows.filter(r=>r.enabled);if(!selected.length)throw new Error('연습할 단어를 한 개 이상 선택해 주세요.');
 return selected.map((r,i)=>{if(!r.replacement.trim()||!r.cue.trim())throw new Error('선택한 단어의 힌트와 바꿔 넣을 말을 채워 주세요.');const answer=frame.replace(slot,r.replacement.trim());if(answer.length>200)throw new Error('완성 문장은 200자 이내로 줄여 주세요.');return {id:`${idPrefix}-${i}`,layout:'drill' as const,title:r.cue.slice(0,100),body:frame.replace(slot,'________'),sub:answer,emoji:emojiFor(r.word),notes:`바꿔 말하기\n문장 틀: ${frame}\n바꿀 말: ${r.replacement}\n예시 답: ${answer}\n1. 힌트를 보고 3~5초 동안 혼자 생각한다.\n2. 모두 함께 말한 뒤 짝에게 한 번씩 말한다.\n3. 화면을 눌러 예시 답을 확인한다.\n4. 다음 단어로 넘어가 같은 문장 틀을 반복한다.\n지원: 문법·관사·단복수와 동사 형태를 수업 전에 확인한다. 정답 공개 후에는 화면 없이 한 번 더 말해 본다.`};});
}
