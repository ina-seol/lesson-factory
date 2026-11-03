import {activitySlides} from './lessonSlides';
import type {Blueprint} from '../model/schema';
import type {Extra,ExtraOptions,SlideLayout} from '../model/extras';
import {emojiFor,lookup} from './lexicon';
const sentences:Record<string,string>={'What are you doing?':'너는 무엇을 하고 있니?',"I'm drawing a picture.":'나는 그림을 그리고 있어.'};
const interaction={'whole-class':'모두 함께','pair':'짝 활동','group':'모둠 활동','individual':'혼자서'} as const;
type Item={layout:SlideLayout;title:string;body:string;notes:string;sub?:string;emoji?:string;rank:number};
const clean=<T extends object>(x:T):T=>Object.fromEntries(Object.entries(x).filter(([,v])=>v!==undefined)) as T;
export function mockExtra(b:Blueprint,o:ExtraOptions):Extra{
 const words=[...new Set(b.vocabulary)],source=[...new Set(o.source==='expressions'?b.targetExpressions:words)];
 const meaning=(w:string)=>sentences[w]||lookup(w)?.ko||`뜻을 직접 입력해 주세요 (${w})`;
 if(o.kind==='flashcards')return {kind:'flashcards',title:'핵심 표현 카드',cards:source.slice(0,o.count).map((w,i)=>clean({id:'card-'+i,front:w,back:meaning(w),emoji:emojiFor(w)})),usedVocabulary:words};
 if(o.kind==='slides'){

 const items:Item[]=[
  {layout:'title',title:b.meta.lessonTitle,body:'',sub:`초등 ${b.meta.grade}학년 영어`,notes:b.objective.ko,rank:0},
  {layout:'objective',title:'오늘의 학습 목표',body:b.objective.studentFriendly,notes:b.objective.ko,rank:1},

  ...words.map((w,i):Item=>({layout:'word',title:w,body:'',sub:meaning(w),emoji:emojiFor(w),notes:`${i+1}/${words.length} 그림을 먼저 보여 주고 영어로 말하게 한 뒤, 뜻을 눌러 확인합니다.`,rank:2})),
  ...b.targetExpressions.map((e):Item=>({layout:'expression',title:'오늘의 표현',body:e,sub:sentences[e]||'',emoji:emojiFor(e),notes:'교사가 먼저 읽고 학생이 따라 읽습니다. 억양과 강세를 함께 연습하세요.',rank:1})),
  {layout:'practice',title:'짝과 말해 보기',body:b.targetExpressions.slice(0,2).join('\n'),sub:'가위바위보로 순서를 정하고 역할을 바꿔요.',notes:'2~3분 동안 짝 대화를 연습하게 하고 돌아다니며 발음을 확인합니다.',rank:2},
  ...activitySlides(b).map(s=>({...s,layout:s.layout!,rank:0})),
  {layout:'wrapup',title:'오늘의 확인',body:b.objective.studentFriendly,sub:'오늘 배운 표현으로 짝에게 말해 보세요.',notes:b.assessment.focus,rank:0}];
 const checks=words.map((w,i):Item=>({layout:'check',title:'이 그림은 무엇일까요?',body:'',sub:w,emoji:emojiFor(w),notes:`정답: ${w} (${meaning(w)})`,rank:4} as Item));
 while(items.length<o.count&&checks.length){const at=items.findIndex(x=>x.layout==='wrapup');items.splice(at<0?items.length:at,0,checks.shift()!);}
 while(items.length>o.count){let drop=0;items.forEach((x,i)=>{if(x.rank>=items[drop].rank)drop=i;});items.splice(drop,1);}
 const slides=Array.from({length:o.count},(_,i)=>{const x=items[Math.min(i,items.length-1)];return clean({id:'slide-'+i,title:x.title,body:x.body||(x.layout==='check'||x.layout==='title'||x.layout==='word'?' ':'내용을 입력해 주세요.'),notes:x.notes,layout:x.layout,sub:x.sub||undefined,emoji:x.emoji});});
 return {kind:'slides',title:b.meta.lessonTitle,slides:slides.map(s=>({...s,body:s.body.trim()})),usedVocabulary:words};}
 return {kind:'wordquiz',title:'오늘의 단어 퀴즈',format:o.format,questions:words.slice(0,o.count).map((w,i)=>{const answer=o.format==='spelling'?w:meaning(w),choices=o.format==='choice'?[answer,...words.filter(v=>v!==w).map(meaning).filter((v,j,a)=>v!==answer&&a.indexOf(v)===j)].slice(0,4):[];if(choices.length)choices.push(...choices.splice(0,i%4));return {id:'word-'+i,prompt:o.format==='spelling'?meaning(w):w,answer,choices};}),usedVocabulary:words};
}
