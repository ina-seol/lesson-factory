import {useEffect,useRef,useState} from 'react';
import type {Lesson} from '../model/schema';
import {classDeck,classRows} from './content';
import {speakingDefaults} from '../materials/speaking';
import {SpeakingSession} from '../materials/SpeakingSession';
import {SlideView} from '../materials/Visual';
import {downloadPresentation,slidePages,type SlideDeck} from '../materials/presentation';
import {ClassGames} from './ClassGames';
import {emojiFor} from '../materials/lexicon';
export function ClassroomStudio({lesson,onChange}:{lesson:Lesson;onChange:(l:Lesson)=>void}){
 const [running,setRunning]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const rows=classRows(lesson),frame=lesson.classroom?.frame??speakingDefaults(lesson.blueprint).frame;
 let deck:SlideDeck|undefined,issue='';try{deck=classDeck(lesson);}catch(e){issue=(e as Error).message;}
 function updateFrame(value:string){onChange({...lesson,classroom:{replacements:lesson.classroom?.replacements||{},frame:value}});}
 if(running&&deck)return <ClassSession lesson={lesson} deck={deck} onExit={()=>setRunning(false)}/>;
 return <section className="classroom-setup"><span className="eyebrow">READY FOR CLASS</span><h2>자료 준비에서 수업 진행까지</h2><p>단어 → 따라 말하기 → 바꿔 말하기 → 스스로 말하기 → 수업안 활동 → 게임 → 마무리 순으로 진행합니다. API 없이도 사용할 수 있어요.</p>
 <div className="classroom-guide"><strong>수업 전 준비</strong><p>문장 틀의 바꿀 자리에 {'{{단어}}'}를 넣고, 각 단어의 뜻과 문장에 들어갈 형태를 확인해 주세요. 한글 뜻은 4선 쓰기 학습지와 함께 저장됩니다.</p></div>
 <label>반복할 문장 틀<input maxLength={200} value={frame} onChange={e=>updateFrame(e.target.value)} placeholder="I'm {{단어}}."/></label>
 <div className="class-word-list">{rows.map(r=><div className="class-word-row" key={r.word}><strong>{r.word}</strong><label>한글 뜻<input aria-label={`${r.word} 수업 뜻`} maxLength={120} value={r.cue} onChange={e=>onChange({...lesson,handwriting:{includeExpressions:lesson.handwriting?.includeExpressions??true,meanings:{...lesson.handwriting?.meanings,[r.word]:e.target.value}}})}/></label><label>문장에 넣을 말<input aria-label={`${r.word} 활용형`} maxLength={120} value={r.replacement} onChange={e=>onChange({...lesson,classroom:{frame,replacements:{...lesson.classroom?.replacements,[r.word]:e.target.value}}})}/></label><p>{frame.replace('{{단어}}',r.replacement)}</p></div>)}</div>
 {!rows.length&&<p>수업안에 핵심 단어를 추가해 주세요.</p>}{issue&&<p role="status">{issue}</p>}<details><summary>활동 진행안 확인</summary>{lesson.blueprint.lessonFlow.map(a=><article key={a.id}><h3>{a.title} · {a.minutes}분</h3><p>{a.description}</p><p>준비물: {a.materials.join(', ')||'화면과 핵심 표현'}</p></article>)}<p>활동 제목·시간·설명은 수업안 탭에서 수정합니다. 전체 활동 시간: {lesson.blueprint.lessonFlow.reduce((n,a)=>n+a.minutes,0)}분. 단어·말하기·게임은 해당 활동 시간 안에서 사용하세요.</p></details>
 <div className="extra-actions"><button className="btn primary" disabled={!deck} onClick={()=>setRunning(true)}>수업 시작</button><button className="btn" disabled={!deck||busy} onClick={async()=>{if(!deck)return;setBusy(true);setError('');try{await downloadPresentation(deck);}catch{setError('PPT 저장에 실패했습니다. 다시 시도해 주세요.');}finally{setBusy(false);}}}>{busy?'PPT 준비 중…':'진행용 PPT 다운로드'}</button></div><p>다운로드에는 단어·말하기 문제와 예시 답·활동 방법·교사용 메모가 포함됩니다. 게임은 웹 화면에서 실행합니다. 기존 PPT 자료는 그대로 유지됩니다.</p>{error&&<p role="alert">{error}</p>}</section>;
}
function ClassSession({lesson,deck,onExit}:{lesson:Lesson;deck:SlideDeck;onExit:()=>void}){
 const [stage,setStage]=useState<'slides'|'speaking'|'game'>('slides'),[index,setIndex]=useState(0),[revealed,setRevealed]=useState(false),[error,setError]=useState('');
 const root=useRef<HTMLDivElement>(null),slides=slidePages(deck).filter(s=>s.layout!=='drill'),card=slides[index],drills=deck.slides.filter(s=>s.layout==='drill');
 const items=classRows(lesson).filter(r=>r.cue.trim()).map((r,i)=>({id:String(i),english:r.word,meaning:r.cue,emoji:emojiFor(r.word)}));
 const lastWord=classRows(lesson).length;
 function move(i:number){setIndex(Math.max(0,Math.min(slides.length-1,i)));setRevealed(false);}
 return <div className="classroom-screen" ref={root}><header><button className="btn" onClick={onExit}>준비 화면</button><span>{lesson.blueprint.meta.lessonTitle}</span><button className="btn" onClick={async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await root.current?.requestFullscreen();}catch{setError('전체화면을 사용할 수 없어요. 브라우저 전체화면을 사용해 주세요.');}}}>전체화면</button></header>{error&&<p role="status">{error}</p>}<nav aria-label="수업 진행 단계"><button className="btn" onClick={()=>{setStage('slides');move(0);}}>목표·단어</button><button className="btn" onClick={()=>setStage('speaking')}>3단계 말하기</button><button className="btn" onClick={()=>{setStage('slides');move(lastWord+1);}}>활동 방법</button><button className="btn" onClick={()=>setStage('game')}>게임</button><button className="btn" onClick={()=>{setStage('slides');move(slides.length-1);}}>마무리</button></nav>
 {stage==='speaking'?<SpeakingSession question={lesson.blueprint.targetExpressions.find(e=>e.includes('?'))} cards={drills} exitLabel="활동으로 계속" onExit={()=>{setStage('slides');move(lastWord+1);}}/>:stage==='game'?<ClassGames items={items} onExit={()=>{setStage('slides');move(slides.length-1);}}/>:<><SlideView item={card} revealed={revealed} index={index} total={slides.length}/><div className="class-controls"><button className="btn" disabled={index===0} onClick={()=>move(index-1)}>이전</button>{card.layout==='word'&&<button className="btn" onClick={()=>setRevealed(!revealed)}>{revealed?'뜻 숨기기':'뜻 공개'}</button>}<button className="btn primary" disabled={index===slides.length-1} onClick={()=>{if(index===lastWord)setStage('speaking');else if(index===slides.length-2)setStage('game');else move(index+1);}}>{index===lastWord?'말하기 연습으로':index===slides.length-2?'게임으로':'다음'}</button></div><details key={card.id}><summary>교사용 진행 메모</summary><p className="teacher-script">{card.notes}</p></details><ClassTimer key={card.id}/></>}
 </div>;
}
function ClassTimer(){
 const [seconds,setSeconds]=useState(60),[remaining,setRemaining]=useState(60),[deadline,setDeadline]=useState<number|null>(null);
 useEffect(()=>{if(deadline===null)return;const tick=()=>{const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));setRemaining(left);if(left===0)setDeadline(null);};tick();const timer=setInterval(tick,200);return()=>clearInterval(timer);},[deadline]);
 return <div className="class-timer"><label>활동 타이머<select disabled={deadline!==null} value={seconds} onChange={e=>{setSeconds(+e.target.value);setRemaining(+e.target.value);}}>{[30,60,120,180,300,600].map(n=><option key={n} value={n}>{n<60?n+'초':n/60+'분'}</option>)}</select></label><strong role="timer">{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</strong><button className="btn" disabled={remaining===0} onClick={()=>setDeadline(deadline===null?Date.now()+remaining*1000:null)}>{deadline===null?'시작 / 계속':'일시정지'}</button><button className="btn" onClick={()=>{setDeadline(null);setRemaining(seconds);}}>초기화</button>{remaining===0&&<span role="status">시간이 끝났어요. 손을 멈추고 화면을 봐요.</span>}</div>;
}
