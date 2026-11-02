import type {Blueprint} from '../model/schema';
import type {Extra,ExtraOptions} from '../model/extras';
const meanings:Record<string,string>={draw:'그리다',read:'읽다',write:'쓰다',sing:'노래하다',dance:'춤추다',cook:'요리하다',jump:'뛰다',run:'달리다',walk:'걷다',swim:'수영하다',cat:'고양이',dog:'개',book:'책',pencil:'연필',apple:'사과',red:'빨간색',blue:'파란색',happy:'행복한',help:'돕다',play:'놀다','What are you doing?':'너는 무엇을 하고 있니?',"I'm drawing a picture.":'나는 그림을 그리고 있어.'};
export function mockExtra(b:Blueprint,o:ExtraOptions):Extra{
 const words=[...new Set(b.vocabulary)],source=[...new Set(o.source==='expressions'?b.targetExpressions:words)];
 const meaning=(w:string)=>meanings[w]||`뜻을 직접 입력해 주세요 (${w})`;
 if(o.kind==='flashcards')return {kind:'flashcards',title:'핵심 표현 카드',cards:source.slice(0,o.count).map((w,i)=>({id:'card-'+i,front:w,back:meaning(w)})),usedVocabulary:words};
 if(o.kind==='slides'){
 const content=[{title:'오늘의 수업',body:b.meta.lessonTitle,notes:b.objective.ko},{title:'학습 목표',body:b.objective.studentFriendly,notes:b.objective.ko},{title:'핵심 단어',body:words.join('\n')||b.targetExpressions[0],notes:'뜻을 확인하고 함께 읽어 보세요.'},{title:'핵심 표현',body:b.targetExpressions.join('\n'),notes:'역할을 바꾸어 연습해 보세요.'},...b.lessonFlow.filter(a=>a.phase!=='Wrap-up').map(a=>({title:'활동 안내',body:a.description,notes:`${a.minutes}분 / ${a.interaction}`}))];
 const slides=Array.from({length:o.count},(_,i)=>({id:'slide-'+i,...(i===o.count-1?{title:'오늘의 확인',body:b.objective.studentFriendly,notes:b.assessment.focus}:content[Math.min(i,content.length-1)])}));
 return {kind:'slides',title:b.meta.lessonTitle,slides,usedVocabulary:words};}
 return {kind:'wordquiz',title:'오늘의 단어 퀴즈',format:o.format,questions:words.slice(0,o.count).map((w,i)=>{const answer=o.format==='spelling'?w:meaning(w),choices=o.format==='choice'?[answer,...words.filter(v=>v!==w).map(meaning).filter((v,j,a)=>v!==answer&&a.indexOf(v)===j)].slice(0,4):[];if(choices.length)choices.push(...choices.splice(0,i%4));return {id:'word-'+i,prompt:o.format==='spelling'?meaning(w):w,answer,choices};}),usedVocabulary:words};
}
