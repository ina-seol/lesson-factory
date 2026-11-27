import {useState} from 'react';
import type {Extra} from '../model/extras';
type Card=Extract<Extra,{kind:'slides'}>['slides'][number];
export function SpeakingSession({cards,onExit,exitLabel='스튜디오로',question}:{cards:Card[];onExit:()=>void;exitLabel?:string;question?:string}){
 const [stage,setStage]=useState(0),[index,setIndex]=useState(0),[reveal,setReveal]=useState(false),[done,setDone]=useState(false);
 const card=cards[index],labels=['함께 따라 말하기','단어 바꿔 말하기','짝과 묻고 답하기'];
 function next(){setReveal(false);if(index+1<cards.length)setIndex(index+1);else if(stage<2){setIndex(0);setStage(stage+1);}else setDone(true);}
 function selectStage(n:number){setStage(n);setIndex(0);setReveal(false);setDone(false);}
 const [before,after]=card?.body.split('________')||[];
 const answer=card?.sub||'',replacement=after!==undefined&&answer.startsWith(before)&&answer.endsWith(after)?answer.slice(before.length,after.length?-after.length:undefined):answer;
 return <section className="speaking-session"><header><button className="btn" onClick={onExit}>{exitLabel}</button><span className="eyebrow">{'{ SPEAK · SWAP · REPEAT }'}</span></header>
 <nav className="drill-stages" aria-label="말하기 연습 단계">{labels.map((label,n)=><button className="btn" aria-pressed={stage===n} onClick={()=>selectStage(n)} key={label}>{String(n+1).padStart(2,'0')} · {label}</button>)}</nav>
 {!card?<p>먼저 표현 바꿔 말하기 카드를 추가해 주세요.</p>:done?<div className="speaking-card"><h1>이번 연습을 마쳤어요.</h1><p>이제 화면 없이 단어를 골라 짝과 한 번 더 말해요.</p><button className="btn primary" onClick={()=>selectStage(0)}>다시 연습</button><button className="btn" onClick={onExit}>{exitLabel}</button></div>:<>
 <progress aria-label="말하기 진행" value={stage*cards.length+index} max={cards.length*3}/><p className="drill-instruction">{stage===0?'선생님을 듣고, 다 같이 완성 문장을 말해요.':stage===1?'색칠된 말만 바꿔 넣어 같은 문장을 말해요.':'A가 묻고 B가 답해요. 다음 단어에서는 역할을 바꿔요.'}</p>
 <div className="speaking-card"><span className="drill-count">{String(index+1).padStart(2,'0')} / {String(cards.length).padStart(2,'0')}</span><span className="game-picture" aria-hidden="true">{card.emoji}</span><h2>{card.title}</h2>
 {question&&<p className="speaking-question"><span>A</span> {question}</p>}
 <p className="speaking-sentence">{stage===0||reveal?<>{before}<mark>{replacement}</mark>{after}</>:stage===1?<mark>{replacement}</mark>:'B · 완성 문장으로 답해요.'}</p>
 {stage===1&&!reveal&&<p className="drill-frame">문장 틀 · {card.body}</p>}
 <div className="extra-actions"><button className="btn" disabled={index===0} onClick={()=>{setIndex(index-1);setReveal(false);}}>이전 단어</button>{stage===2&&<button className="btn" onClick={()=>setReveal(!reveal)}>{reveal?'예시 답 숨기기':'예시 답 보기'}</button>}<button className="btn primary" onClick={next}>{index+1<cards.length?'다음 단어 →':stage<2?'다음 단계 →':'연습 마치기'}</button></div></div>
 <p>직접 말한 뒤 다음으로 넘어가요. 음성은 녹음하거나 채점하지 않습니다.</p></>}</section>;
}
