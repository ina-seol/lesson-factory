import type {Lesson} from '../model/schema';
import {lookup} from './lexicon';
export type WritingEntry={english:string;meaning:string};
export function writingEntries(lesson:Lesson,kind:'words'|'expressions'):WritingEntry[]{
 const source=kind==='words'?lesson.blueprint.vocabulary:lesson.blueprint.targetExpressions;
 return [...new Set(source.map(s=>s.trim()).filter(Boolean))].map(english=>({english,meaning:lesson.handwriting?.meanings[english]??lesson.flashcards?.data.cards.find(c=>c.front===english)?.back??lookup(english)?.ko??''}));
}
export function writingPages(words:WritingEntry[],expressions:WritingEntry[]){
 const pages:{kind:'words'|'expressions';entries:WritingEntry[];start:number}[]=[];
 for(let i=0;i<words.length;i+=6)pages.push({kind:'words',entries:words.slice(i,i+6),start:i});
 for(let i=0;i<expressions.length;i+=3)pages.push({kind:'expressions',entries:expressions.slice(i,i+3),start:i});return pages;
}
export function FourLine({text='',wide=false}:{text?:string;wide?:boolean}){
 const width=wide?650:300;const estimated=Array.from(text).reduce((n,c)=>n+(/[ilIjtfr.,' ]/.test(c)?9:/[MWmw]/.test(c)?27:18),0);const fit=estimated>width-16;
 return <svg className="four-line" viewBox={`0 0 ${width} 44`} preserveAspectRatio="none" role="img" aria-label={text?`${text} 따라쓰기`:'빈 영어 4선 쓰기 칸'}>
 {[4,16,28,40].map((y,i)=><line key={y} x1="0" x2={width} y1={y} y2={y} stroke={i===2?'#707070':'#a0a0a0'} strokeWidth={i===2?1:.65} strokeDasharray={i===1?'2 2':undefined}/>)}
 {text&&<text x="8" y="28" fontFamily="'Times New Roman', 'Liberation Serif', serif" fontSize="30" fill="#aaa" textLength={fit?width-16:undefined} lengthAdjust={fit?'spacingAndGlyphs':undefined}>{text}</text>}
 </svg>;
}
export function HandwritingWorksheet({lesson,onChange}:{lesson:Lesson;onChange:(l:Lesson)=>void}){
 const words=writingEntries(lesson,'words'),expressions=writingEntries(lesson,'expressions');const includeExpressions=lesson.handwriting?.includeExpressions??true;
 const pages=writingPages(words,includeExpressions?expressions:[]);
 function meaning(english:string,value:string){onChange({...lesson,handwriting:{includeExpressions,meanings:{...lesson.handwriting?.meanings,[english]:value}}});}
 return <section className="handwriting-studio"><div className="no-print handwriting-controls"><h2>영어 4선 따라쓰기 학습지</h2><p>회색 글씨로 한 번 따라 쓰고, 아래 빈 칸에 세 번 더 써요. 단어는 두 열, 주요 표현은 넓은 한 줄로 인쇄됩니다.</p><label><input type="checkbox" checked={includeExpressions} onChange={e=>onChange({...lesson,handwriting:{meanings:lesson.handwriting?.meanings||{},includeExpressions:e.target.checked}})}/> 주요 표현 쓰기도 포함</label><details><summary>한글 뜻 입력 / 수정</summary><p>뜻을 모르는 항목은 비워 둡니다. 입력한 뜻은 수업과 함께 자동 저장돼요. 영어는 수업안에서 수정할 수 있어요.</p>{[...words,...expressions].map((e,i)=><label className="writing-meaning" key={i}><span>{e.english}</span><input aria-label={`${e.english} 한글 뜻`} value={e.meaning} maxLength={120} onChange={x=>meaning(e.english,x.target.value)}/></label>)}</details><button className="btn primary" disabled={!pages.length} onClick={()=>window.print()}>4선 학습지 인쇄 / PDF 저장</button><p className="small">A4 세로 · 배율 100% · 브라우저 머리글/바닥글 끄기를 권장합니다. 보조선은 배경 그래픽 없이도 인쇄됩니다.</p></div>
 {!pages.length?<p>수업안에 핵심 단어나 표현을 입력해 주세요.</p>:pages.map((page,p)=><article className="paper handwriting-paper" key={p}><header className="handwriting-header"><span>ENGLISH PORTFOLIO · {lesson.blueprint.meta.grade}학년</span><h2>{lesson.blueprint.meta.lessonTitle}</h2><p>학년 ______ 반 ______ 번호 ______ 이름 ____________________</p></header><h3 className="handwriting-section">{page.kind==='words'?'1. New Words':'2. Key Expressions'} <small>따라쓰기 1번 + 스스로 쓰기 3번</small></h3><div className={'handwriting-grid '+page.kind}>{page.entries.map((entry,i)=><section className="handwriting-entry" key={entry.english}><div className="handwriting-label"><b>{page.start+i+1}</b><span>{entry.meaning||'뜻: ____________________'}</span></div><FourLine text={entry.english} wide={page.kind==='expressions'}/>{[0,1,2].map(n=><FourLine key={n} wide={page.kind==='expressions'}/>)}</section>)}</div><footer className="handwriting-footer">천천히, 바르게 써 보세요.<span>{p+1} / {pages.length}</span></footer></article>)}
 </section>;
}
