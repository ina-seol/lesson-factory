/** 교과서 역할극 대본(영어·한글 뜻·한글 발음이 섞인 글)을 장면별 대사로 나눕니다. AI 없이 규칙으로 처리합니다. */
export type DialogueLine={speaker:string;en:string;ko:string;pron:string};
export type Scene={label:string;lines:DialogueLine[]};
const MARKER=/[①-⑳]/g,SPEAKER=/(?:^|\n|(?<=[.?!…”’'"\)]\s))([A-Za-z가-힣]+(?: [A-Za-z가-힣]+)?)[ \t]*:[ \t]*/g;
const circled=(c:string)=>c.charCodeAt(0)-0x2460+1;
function utterances(segment:string):{speaker:string;text:string}[]{
 const text=segment.split('\n').map(l=>l.trim()).filter(l=>l&&!/^\d{1,3}$/.test(l)).join('\n'),hits=[...text.matchAll(SPEAKER)],out:{speaker:string;text:string}[]=[];
 hits.forEach((m,i)=>{const start=m.index!+m[0].length,end=i+1<hits.length?hits[i+1].index!:text.length;out.push({speaker:m[1].trim(),text:text.slice(start,end).trim()});});
 return out;
}
function splitEnglishKorean(text:string){
 const runs=[...text.matchAll(/[A-Za-z][A-Za-z0-9’'‘.,!?\- ]*/g)];
 const en=runs.map(r=>r[0].trim()).filter(Boolean);
 const ko=runs.map((r,i)=>text.slice(r.index!+r[0].length,i+1<runs.length?runs[i+1].index!:text.length).replace(/\s+/g,' ').trim()).filter(Boolean);
 return {en:en.join(' '),ko:ko.join(' ')};
}
export function parseRoleplay(raw:string):Scene[]{
 const text=raw.replace(/\r/g,''),marks=[...text.matchAll(MARKER)];
 const groups=new Map<number,string[]>();
 if(marks.length){marks.forEach((m,i)=>{const n=circled(m[0]),body=text.slice(m.index!+1,i+1<marks.length?marks[i+1].index!:text.length);groups.set(n,[...(groups.get(n)||[]),body]);});}
 else{const all=utterances(text);for(let i=0;i<all.length;i+=4)groups.set(i/4+1,[all.slice(i,i+4).map(u=>u.speaker+': '+u.text).join('\n')]);}
 return [...groups.entries()].sort((a,b)=>a[0]-b[0]).map(([n,parts])=>({n,main:parts[0]||'',pron:parts[1]||''})).map(({n,main,pron})=>{
  const mainU=utterances(main),pronU=utterances(pron);
  const lines=mainU.map((u,i)=>{const {en,ko}=splitEnglishKorean(u.text),p=pronU.find((x,j)=>j===i&&x.speaker===u.speaker)||pronU.find(x=>x.speaker===u.speaker);return {speaker:u.speaker,en,ko,pron:p?p.text.replace(/\s+/g,' '):''};}).filter(l=>l.en);
  return {label:'장면 '+n,lines};
 }).filter(s=>s.lines.length);
}
export const serializeLines=(lines:DialogueLine[])=>lines.map(l=>[l.speaker,l.en,l.ko,l.pron].join('\t')).join('\n');
export const parseLines=(body:string):DialogueLine[]=>body.split('\n').filter(l=>l.trim()).map(l=>{const [speaker='',en='',ko='',pron='']=l.split('\t');return {speaker,en,ko,pron};});
