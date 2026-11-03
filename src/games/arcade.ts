import type {Game} from '../model/schema';
export type ArcadeItem={id:string;english:string;meaning:string;emoji?:string};
export type ArcadeMode='meaning'|'spelling'|'letters'|'sentence';
export const normalize=(v:string)=>v.normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
export function shuffle<T>(items:readonly T[]):T[]{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function arcadeItems(g:Game):ArcadeItem[]{
 const items=g.gameType==='matching'?g.pairs.map(p=>({id:p.id,english:p.left,meaning:p.right,emoji:p.emoji})):g.gameType==='speed-quiz'?g.cards.map(c=>({id:c.id,english:c.answer,meaning:c.prompt,emoji:c.emoji})):[];
 return items.filter((x,i,a)=>/[a-z]/i.test(x.english)&&/[가-힣]/.test(x.meaning)&&!x.meaning.includes('뜻 확인 필요')&&a.findIndex(v=>normalize(v.english)===normalize(x.english))===i);
}
export function eligible(items:ArcadeItem[],mode:ArcadeMode){return items.filter(i=>mode==='sentence'?i.english.trim().split(/\s+/).length>1:mode==='letters'?/^[a-z]{2,16}$/i.test(i.english):true);}
export function tilesFor(answer:string,mode:ArcadeMode){return shuffle((mode==='sentence'?answer.trim().split(/\s+/):Array.from(answer)).map((text,id)=>({text,id})));}
export function meaningChoices(item:ArcadeItem,items:ArcadeItem[]){return shuffle([item.meaning,...shuffle([...new Set(items.map(x=>x.meaning).filter(x=>x!==item.meaning))]).slice(0,3)]);}
export function award(correct:boolean,streak:number,hinted:boolean){const next=correct?streak+1:0;return {streak:next,points:correct?(hinted?50:100+Math.min(next-1,4)*25):0};}
