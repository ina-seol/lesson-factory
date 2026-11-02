import type {Extra} from '../model/extras';
export type SlideDeck=Extract<Extra,{kind:'slides'}>;
function wrap(line:string):string[]{
 if(Array.from(line).length<=38)return [line];
 const chars=Array.from(line);let cut=38;
 const space=chars.slice(0,39).lastIndexOf(' ');if(space>=18)cut=space;
 return [chars.slice(0,cut).join(''),...wrap(chars.slice(cut).join('').trimStart())];
}
export function slidePages(deck:SlideDeck){return deck.slides.flatMap(s=>{const lines=s.body.split('\n').flatMap(wrap);return Array.from({length:Math.ceil(lines.length/7)},(_,i)=>({...s,id:s.id+'-'+i,body:lines.slice(i*7,(i+1)*7).join('\n')}));});}
export async function buildPresentation(deck:SlideDeck){
 const {default:PptxGenJS}=await import('pptxgenjs');const pptx=new PptxGenJS();pptx.layout='LAYOUT_WIDE';pptx.author='Lesson Factory';pptx.subject='초등 영어 수업자료';pptx.title=deck.title;pptx.theme={headFontFace:'Malgun Gothic',bodyFontFace:'Malgun Gothic'};
 const pages=slidePages(deck);pages.forEach((item,i)=>{const slide=pptx.addSlide();slide.background={color:'F7F8F3'};
 slide.addText(item.title,{x:.65,y:.5,w:12,h:1.25,fontSize:32,bold:true,color:'28594C',margin:0,fit:'shrink'});
 slide.addText(item.body,{x:.65,y:2,w:12,h:4.6,fontSize:26,color:'203B34',margin:0,fit:'shrink',valign:'top'});
 slide.addText(`${i+1} / ${pages.length}`,{x:11.5,y:7,w:1.1,h:.25,fontSize:12,color:'526C63',align:'right',margin:0});slide.addNotes(item.notes);});return pptx;
}
export async function downloadPresentation(deck:SlideDeck){const pptx=await buildPresentation(deck);await pptx.writeFile({fileName:(deck.title.replace(/[\\/:*?"<>|]/g,'').slice(0,70)||'lesson')+'.pptx'});}
