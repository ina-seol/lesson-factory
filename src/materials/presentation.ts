import type {Extra} from '../model/extras';
import type {SlideItem} from './Visual';
import {getTheme} from './theme';
export type SlideDeck=Extract<Extra,{kind:'slides'}>;
export type CardDeck=Extract<Extra,{kind:'flashcards'}>;
function wrap(line:string):string[]{
 if(Array.from(line).length<=38)return [line];
 const chars=Array.from(line);let cut=38;
 const space=chars.slice(0,39).lastIndexOf(' ');if(space>=18)cut=space;
 return [chars.slice(0,cut).join(''),...wrap(chars.slice(cut).join('').trimStart())];
}
export function slidePages(deck:SlideDeck){return deck.slides.flatMap(s=>{const lines=s.body.split('\n').flatMap(wrap);return Array.from({length:Math.max(1,Math.ceil(lines.length/7))},(_,i)=>({...s,id:s.id+'-'+i,body:lines.slice(i*7,(i+1)*7).join('\n')}));});}
/** 플래시카드를 PPT처럼 보여 줄 슬라이드 목록: 그림+영어 → 뜻 공개. */
export function cardPages(deck:CardDeck):SlideItem[]{return deck.cards.map(c=>({layout:'word' as const,title:c.front,body:'',sub:c.back,emoji:c.emoji,image:c.image,meaningEmoji:c.meaningEmoji,meaningImage:c.meaningImage}));}
let C={green:'2B7658',ink:'24413A',cream:'F2FAF5',mint:'D8F1E2',line:'BFE3CF',muted:'5F746B',accent:'C2603E',white:'FFFFFF',dot:'8FD3B0'};
function loadPalette(){const t=getTheme();C={green:t.primary,ink:t.ink,cream:t.bg,mint:t.soft,line:t.line,muted:t.ink,accent:t.accent,white:'FFFFFF',dot:t.dot};}
function bubbles(slide:Slide,soft:string){slide.addShape('ellipse',{x:10.6,y:-1.3,w:4,h:4,fill:{color:soft},line:{color:soft,width:0}});slide.addShape('ellipse',{x:-.8,y:6.2,w:2.6,h:2.6,fill:{color:soft},line:{color:soft,width:0}});}
const FONT='Malgun Gothic';
type Pptx=InstanceType<typeof import('pptxgenjs').default>;
type Slide=ReturnType<Pptx['addSlide']>;
function picture(slide:Slide,item:SlideItem,x:number,y:number,w:number,h:number){
 if(item.image){slide.addImage({data:item.image,x,y,w,h,sizing:{type:'contain',w,h}});return;}
 if(item.emoji)slide.addText(item.emoji,{x,y,w,h,fontSize:Math.round(Math.min(w,h)*62),align:'center',valign:'middle',margin:0,fontFace:'Segoe UI Emoji'});
}
function footer(slide:Slide,deck:string,n:number,total:number,dark=false){
 slide.addText(deck,{x:.65,y:7,w:8,h:.25,fontSize:11,color:dark?'BFD3C9':C.muted,margin:0,fontFace:FONT});
 slide.addText(`${n} / ${total}`,{x:11.5,y:7,w:1.2,h:.25,fontSize:11,color:dark?'BFD3C9':C.muted,align:'right',margin:0,fontFace:FONT});
}
function draw(pptx:Pptx,item:SlideItem&{notes?:string},n:number,total:number,deck:string,reveal:boolean){
 const slide=pptx.addSlide(),layout=item.layout||'text',hasPic=!!(item.emoji||item.image);
 const title=(color=C.green)=>slide.addText(item.title,{x:.9,y:.6,w:11.5,h:1,fontSize:34,bold:true,color,margin:0,fit:'shrink',fontFace:FONT});
 if(layout==='title'){
  slide.background={color:C.mint};bubbles(slide,C.cream);slide.addShape('roundRect',{x:.9,y:2.5,w:1.1,h:.14,rectRadius:.07,fill:{color:C.accent},line:{color:C.accent,width:0}});
  slide.addText(item.title,{x:.9,y:2.8,w:11.5,h:1.9,fontSize:54,bold:true,color:C.green,margin:0,fit:'shrink',valign:'top',fontFace:FONT});
  if(item.sub)slide.addText(item.sub,{x:.9,y:4.9,w:11,h:.6,fontSize:24,color:C.ink,margin:0,fontFace:FONT});
  footer(slide,'Lesson Factory',n,total);
 }else if(layout==='word'||layout==='check'){
  slide.background={color:C.cream};bubbles(slide,C.mint);
  slide.addShape('roundRect',{x:.9,y:.9,w:5.6,h:5.6,fill:{color:C.white},line:{color:C.line,width:3},rectRadius:.4});
  picture(slide,item,1.2,1.2,5,5);
  const word=layout==='check'?'?':item.title;
  slide.addText(word,{x:7.1,y:1.9,w:5.6,h:1.6,fontSize:layout==='check'?96:Math.max(24,Math.min(68,Math.floor(660/Math.max(1,Array.from(word).length)))),wrap:false,bold:true,color:C.green,margin:0,fit:'shrink',valign:'middle',fontFace:FONT});
  if(layout==='word'&&reveal&&(item.meaningEmoji||item.meaningImage))picture(slide,{...item,emoji:item.meaningEmoji,image:item.meaningImage},11.3,3.6,1.3,1.3);
  if(layout==='word'&&item.sub&&reveal)slide.addText(item.sub,{x:7.1,y:3.7,w:(item.meaningEmoji||item.meaningImage)?4.1:5.6,h:1.1,fontSize:40,bold:true,color:C.accent,margin:0,fit:'shrink',valign:'top',fontFace:FONT});
  if(layout==='check')slide.addText(item.title,{x:7.1,y:3.7,w:5.6,h:1.2,fontSize:28,color:C.ink,margin:0,fontFace:FONT});
  if(item.body.trim())slide.addText(item.body,{x:7.1,y:5.3,w:5.6,h:.7,fontSize:20,color:C.muted,margin:0,fontFace:FONT});
  footer(slide,deck,n,total);
 }else if(layout==='expression'){
  slide.background={color:C.mint};bubbles(slide,C.cream);slide.addText(item.title,{x:.9,y:.7,w:6,h:.6,fontSize:22,bold:true,color:C.accent,margin:0,fontFace:FONT});
  slide.addText(item.body,{x:.9,y:1.9,w:hasPic?8:11.5,h:3,fontSize:52,bold:true,color:C.green,margin:0,fit:'shrink',valign:'middle',fontFace:FONT});
  if(item.sub)slide.addText(item.sub,{x:.9,y:5.1,w:11,h:.8,fontSize:28,color:C.ink,margin:0,fontFace:FONT});
  if(hasPic)picture(slide,item,9.4,1.9,3,3);
  footer(slide,deck,n,total);
 }else if(layout==='activity'||layout==='practice'){
  slide.background={color:C.cream};slide.addShape('rect',{x:0,y:0,w:.35,h:7.5,fill:{color:C.dot},line:{color:C.dot,width:0}});
  title();
  slide.addText(item.body,{x:.9,y:1.9,w:11.5,h:3.6,fontSize:layout==='practice'?44:30,bold:layout==='practice',color:C.ink,margin:0,fit:'shrink',valign:'top',fontFace:FONT});
  if(item.sub)slide.addText(item.sub,{x:.9,y:5.8,w:11.5,h:.7,fontSize:22,color:C.accent,bold:true,margin:0,fontFace:FONT});
  footer(slide,deck,n,total);
 }else{
  slide.background={color:layout==='wrapup'?C.mint:C.cream};bubbles(slide,layout==='wrapup'?C.cream:C.mint);title();
  slide.addText(item.body,{x:.9,y:2,w:11.5,h:3.8,fontSize:32,color:C.ink,margin:0,fit:'shrink',valign:'top',fontFace:FONT});
  if(item.sub)slide.addText(item.sub,{x:.9,y:5.9,w:11.5,h:.7,fontSize:22,color:C.accent,bold:true,margin:0,fontFace:FONT});
  footer(slide,deck,n,total);
 }
 slide.addNotes(item.notes||'');
}
export async function buildPresentation(deck:SlideDeck|CardDeck){
 loadPalette();
 const {default:PptxGenJS}=await import('pptxgenjs');const pptx=new PptxGenJS();pptx.layout='LAYOUT_WIDE';pptx.author='Lesson Factory';pptx.subject='초등 영어 수업자료';pptx.title=deck.title;pptx.theme={headFontFace:FONT,bodyFontFace:FONT};
 if(deck.kind==='slides'){const pages=slidePages(deck);pages.forEach((item,i)=>draw(pptx,item,i+1,pages.length,deck.title,true));}
 else{const cards=cardPages(deck),total=cards.length*2;cards.forEach((c,i)=>{const notes='그림을 보고 영어로 말하게 한 뒤 다음 장에서 뜻을 확인합니다.';draw(pptx,{...c,notes},i*2+1,total,deck.title,false);draw(pptx,{...c,notes:'뜻을 함께 읽어 보세요.'},i*2+2,total,deck.title,true);});}
 return pptx;
}
export async function downloadPresentation(deck:SlideDeck|CardDeck){const pptx=await buildPresentation(deck);await pptx.writeFile({fileName:(deck.title.replace(/[\/:*?"<>|]/g,'').slice(0,70)||'lesson')+'.pptx'});}
