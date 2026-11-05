import {useState} from 'react';
import type {Extra} from '../model/extras';
type Card=Extract<Extra,{kind:'slides'}>['slides'][number];
export function SpeakingSession({cards,onExit,exitLabel='스튜디오로'}:{cards:Card[];onExit:()=>void;exitLabel?:string}){
 const [stage,setStage]=useState(0),[index,setIndex]=useState(0),[reveal,setReveal]=useState(false),[done,setDone]=useState(false);
 const card=cards[index],labels=['따라 말하기','바꿔 말하기','스스로 말하기'];
 function next(){setReveal(false);if(index+1<cards.length)setIndex(index+1);else if(stage<2){setIndex(0);setStage(stage+1);}else setDone(true);}
 return <section className="speaking-session"><header><button className="btn" onClick={onExit}>{exitLabel}</button><span>말하기 연습 · {labels[stage]}</span></header>{!card?<p>먼저 표현 바꿔 말하기 카드를 추가해 주세요.</p>:done?<div className="speaking-card"><h1>세 단계 연습 완료!</h1><p>{cards.length}개 표현을 세 번씩 말했어요.</p><button className="btn primary" onClick={()=>{setStage(0);setIndex(0);setDone(false);setReveal(false);}}>다시 연습</button></div>:<><progress aria-label="말하기 진행" value={stage*cards.length+index} max={cards.length*3}/><p>{stage+1}단계 · {index+1} / {cards.length} · 한 번씩 말한 뒤 짝과 역할을 바꿔요.</p><div className="speaking-card"><span className="game-picture" aria-hidden="true">{card.emoji}</span><h2>{card.title}</h2><p className="speaking-sentence">{stage===0||reveal?card.sub:stage===1?card.body:'힌트만 보고 완성 문장을 말해요.'}</p><div className="extra-actions">{stage>0&&<button className="btn" onClick={()=>setReveal(!reveal)}>{reveal?'예시 답 숨기기':'예시 답 보기'}</button>}<button className="btn primary" onClick={next}>말했어요 · {index+1<cards.length?'다음 단어':stage<2?'다음 단계':'연습 마치기'}</button></div></div><p>직접 말한 뒤 버튼을 눌러요. 음성 인식이나 자동 발음 채점은 사용하지 않습니다.</p></>}</section>;
}
