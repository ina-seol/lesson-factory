import type { AIRequest, Blueprint, Intake, Question, Sheet, Game, WorksheetOptions, AssessmentOptions } from '../model/schema';
export const meanings:Record<string,string>={draw:'그리다',read:'읽다',write:'쓰다',sing:'노래하다',dance:'춤추다',cook:'요리하다',jump:'뛰다',run:'달리다',walk:'걷다',swim:'수영하다',cat:'고양이',dog:'개',book:'책',pencil:'연필',apple:'사과',red:'빨간색',blue:'파란색',happy:'행복한',help:'돕다',play:'놀다'};
const meaning=(w:string)=>meanings[w.toLowerCase()]||`뜻 확인 필요 (${w})`;
export function mockLesson(i:Intake):Blueprint{
 const mins=[.125,.2,.3,.25].map(r=>Math.floor(i.duration*r));mins.push(i.duration-mins.reduce((a,b)=>a+b,0));
 const titles=['Action Guess','Listen & Practice','Ask Your Partner','Expression Challenge','Exit Ticket'];
 const phrases=i.targetExpressions.filter(Boolean);const vocabulary=i.vocabulary;
 return {meta:{grade:i.grade,subject:'English',lessonTitle:i.lessonTitle,duration:i.duration,studentCount:i.studentCount},objective:{ko:`“${phrases[0]}” 표현을 이해하고 상황에 맞게 친구와 말할 수 있다.`,studentFriendly:'오늘의 표현으로 친구와 묻고 답해 봅시다.'},targetExpressions:phrases,vocabulary,lessonFlow:titles.map((title,n)=>({id:`activity-${n+1}`,phase:(['Warm-up','Practice','Activity','Game','Wrap-up'] as const)[n],title,minutes:mins[n],description:[`교사가 핵심 표현 “${phrases[0]}”에 어울리는 행동이나 상황을 보여줍니다. 학생들은 뜻을 추측합니다.`,`핵심 표현을 듣고 따라 한 뒤, 짝과 역할을 바꾸어 연습합니다. ${i.focus.includes('쓰기')?'칠판의 도움말을 보고 한 문장을 씁니다.':'말하기 전에 생각할 시간을 줍니다.'}`,`짝과 번갈아 “${phrases.join(' / ')}”를 사용합니다. 교사는 ${i.studentCount}명의 참여를 살펴보고 짧게 피드백합니다.`,`모둠에서 한 명씩 행동이나 상황을 보여주고 친구가 핵심 표현으로 답합니다. 협력한 모둠을 함께 격려합니다.`,`학습목표에 맞는 Exit Ticket을 작성하고 스스로 할 수 있는 정도를 표시합니다.`][n],interaction:(['whole-class','pair','pair','group','individual'] as const)[n],materials:n===4?['Exit Ticket']:n===1?['칠판']:[]})),assessment:{focus:`“${phrases[0]}”를 상황에 맞게 이해하고 말할 수 있는가?`,method:'Exit Ticket + 말하기 관찰'}};
}
function baseQ(n:number,type:string):Question{return {id:`question-${n+1}`,type,prompt:'',context:'',choices:[],answer:'',teacherNote:'',usedVocabulary:[]};}
export function mockWorksheet(b:Blueprint,o:WorksheetOptions):Sheet{
 const words=b.vocabulary.length?b.vocabulary:b.targetExpressions;const exp=b.targetExpressions;
 const questions=Array.from({length:o.count},(_,n)=>{
 const type=o.types[n%o.types.length],w=words[n%words.length]||exp[0],sentence=exp[n%exp.length];const q=baseQ(n,type);q.usedVocabulary=b.vocabulary.includes(w)?[w]:[];
 if(type==='단어 연결'){q.prompt='알맞은 뜻을 찾아 연결하세요.';q.context=w;q.choices=[meaning(w),meaning(words[(n+1)%words.length]),meaning(words[(n+2)%words.length])].filter((v,i,a)=>a.indexOf(v)===i).reverse();q.answer=meaning(w);}
 else if(type==='빈칸 채우기'||type==='문장 완성'){const parts=sentence.split(' '),index=Math.max(0,parts.length-1);q.prompt=type==='빈칸 채우기'?'빈칸에 알맞은 말을 쓰세요.':'문장을 완성하세요.';q.context=parts.map((v,i)=>i===index?'________':v).join(' ');q.answer=parts[index];if(o.difficulty==='쉬움')q.choices=[q.answer];}
 else if(type==='문장 배열'){q.prompt='단어를 바르게 배열해 문장을 쓰세요.';q.context=sentence.split(' ').reverse().join(' / ');q.answer=sentence;}
 else if(type==='그림 보고 쓰기'){q.prompt='그림에 알맞은 단어를 쓰세요.';q.context=`[그림:${w}]`;q.answer=w;if(!['draw','read','write','sing','dance','cook'].includes(w))q.teacherNote='이 단어는 기본 그림이 없습니다. 인쇄 전에 그림을 직접 그리거나 문항을 바꾸세요.';}
 else if(type==='짧은 읽기'){q.prompt='글을 읽고 오늘의 핵심 표현을 찾아 쓰세요.';q.context=exp.join(' ');q.answer=sentence;}
 else {q.prompt='오늘 배운 표현을 사용해 한 문장을 쓰세요.';q.answer=sentence;q.teacherNote='예시 답안입니다. 학습목표에 맞는 다른 답도 인정합니다.';}
 if(!meanings[w]&&type==='단어 연결')q.teacherNote='Mock 사전에 없는 단어입니다. 교사가 뜻을 수정해 주세요.';
 return q;});return {title:b.meta.lessonTitle,instructions:o.difficulty==='쉬움'?'도움말을 보며 천천히 연습해 보세요.':o.difficulty==='도전'?'도움말 없이 스스로 표현해 보세요.':'오늘의 표현을 읽고, 생각하고, 써 보세요.',questions,usedVocabulary:b.vocabulary};
}
export function mockAssessment(b:Blueprint,o:AssessmentOptions):Sheet{
 const count=o.kind==='Exit Ticket'?3:o.kind==='5문항 Quiz'?5:10;
 const s=mockWorksheet(b,{count:count===3?5:count,difficulty:'보통',types:['문장 완성','문장 배열']});s.questions=s.questions.slice(0,count);s.title=o.kind;s.instructions=b.objective.studentFriendly;
 s.questions.forEach((q,n)=>{const area=o.areas[n%o.areas.length];q.teacherNote=`평가 영역: ${area}. `+q.teacherNote;if(area==='듣기'){q.prompt='선생님이 읽어 주는 표현을 듣고 쓰세요.';q.teacherNote+=`교사 낭독: ${b.targetExpressions[n%b.targetExpressions.length]}`;q.context='';q.answer=b.targetExpressions[n%b.targetExpressions.length];}if(area==='말하기'){q.prompt='오늘 배운 표현으로 짝과 묻고 답하세요.';q.teacherNote+='교사 관찰: 상황에 맞는 표현 사용과 상대의 말에 반응하는지 확인.';}});
 if(count===3)s.questions[2]={...baseQ(2,'자기평가'),prompt:'오늘 나는…',choices:['혼자 할 수 있어요','조금 도움을 받으면 할 수 있어요','더 연습하고 싶어요'],answer:'정답 없음',teacherNote:'자기평가는 정오 점수에 포함하지 않습니다.'};return s;
}
export function mockGame(b:Blueprint,type:Game['gameType']):Game{
 const words=b.vocabulary.length?b.vocabulary:b.targetExpressions;
 if(type==='matching')return {gameType:type,title:'Word Partners',pairs:words.slice(0,8).map((w,n)=>({id:`pair-${n}`,left:w,right:meaning(w)})),usedVocabulary:b.vocabulary};
 if(type==='speed-quiz')return {gameType:type,title:'60 Second Challenge',cards:words.map((w,n)=>({id:`card-${n}`,prompt:meaning(w),answer:w})),usedVocabulary:b.vocabulary};
 const fallback=['한 번 더 생각해 보세요','짝과 다시 확인해 보세요','뜻을 다시 살펴보세요'];
 return {gameType:type,title:'Expression Challenge',questions:words.slice(0,8).map((w,n)=>{const correct=meaning(w);const others=[...words.filter(x=>x!==w).map(meaning),...fallback].filter((v,i,a)=>v!==correct&&a.indexOf(v)===i).slice(0,3);const pos=n%4;others.splice(pos,0,correct);return {id:`quiz-${n}`,question:`“${w}”의 알맞은 뜻은 무엇일까요?`,choices:others,answerIndex:pos,usedVocabulary:b.vocabulary.includes(w)?[w]:[]};}),usedVocabulary:b.vocabulary};
}
export function mockGenerate(r:AIRequest):unknown{
 switch(r.action){case'lesson':return mockLesson(r.input);case'worksheet':return mockWorksheet(r.blueprint,r.options);case'assessment':return mockAssessment(r.blueprint,r.options);case'game':return mockGame(r.blueprint,r.gameType);case'reviseActivity':return {...r.activity,title:'Move & Share',interaction:'group',description:`모둠에서 한 명이 행동을 보여주면 친구들이 “${r.blueprint.targetExpressions[0]}”를 사용해 묻고 답합니다. 역할을 번갈아 맡습니다.\n교사 요청 메모: ${r.instruction}`};case'reviseQuestion':return {...r.question,prompt:'오늘 배운 핵심 표현으로 문장을 완성하세요.',context:r.blueprint.targetExpressions[0].replace(/\S+$/,'________'),answer:r.blueprint.targetExpressions[0].split(' ').at(-1),choices:[],teacherNote:`교사 요청 메모: ${r.instruction}`};}
}
