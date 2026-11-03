import type {SlideLayout} from '../model/extras';
import {parseLines} from './script';
export type SlideItem={layout?:SlideLayout;title:string;body:string;sub?:string;emoji?:string;image?:string;meaningEmoji?:string;meaningImage?:string;notes?:string};
/** 긴 단어도 한 줄에 들어가도록 글자 수에 맞춰 줄인 크기(cqw). */
export const fitCqw=(text:string,max:number,room:number)=>Math.round(Math.min(max,room/(Math.max(1,Array.from(text).length)*.6))*100)/100;
export function Picture({emoji,image,className=''}:{emoji?:string;image?:string;className?:string}){
 if(image)return <img className={'picture '+className} src={image} alt=""/>;
 if(emoji)return <span className={'picture emoji '+className} aria-hidden="true">{emoji}</span>;
 return <span className={'picture empty '+className} aria-hidden="true"/>;
}
/** 16:9 슬라이드 한 장. 미리보기·발표 화면이 같은 컴포넌트를 쓰고 container 단위로 크기가 맞춰집니다. */
export function SlideView({item,revealed,index,total}:{item:SlideItem;revealed:boolean;index?:number;total?:number}){
 const layout=item.layout||'text',hasPicture=!!(item.emoji||item.image),hide=(layout==='word'||layout==='check')&&!revealed;
 return <section className={'slide-view layout-'+layout} aria-label={item.title}>
  {layout==='drill'?<div className="sv-text"><p className="sv-sub">힌트를 보고 같은 문장 틀로 말해요</p><h1>{item.title}</h1><p className="sv-body">{revealed?item.sub:item.body}</p><p className="sv-sub">{revealed?'예시 답 · 화면 없이 한 번 더 말해요':'말한 뒤 눌러서 예시 답 확인'}</p></div>:layout==='word'||layout==='check'?<><div className="sv-picture"><Picture emoji={item.emoji} image={item.image}/></div><div className="sv-text"><h1 style={layout==='word'?{fontSize:fitCqw(item.title,9,44)+'cqw',whiteSpace:'nowrap'}:undefined}>{item.title}</h1>{layout==='word'&&<div className="sv-meaning"><p className={'sv-sub'+(hide?' hidden':'')}>{hide?'뜻 보기':item.sub}</p>{!hide&&(item.meaningEmoji||item.meaningImage)&&<Picture className="meaning" emoji={item.meaningEmoji} image={item.meaningImage}/>}</div>}{layout==='check'&&<p className={'sv-sub'+(hide?' hidden':'')}>{hide?'정답 보기':item.sub}</p>}{layout==='word'&&item.body.trim()&&<p className="sv-body">{item.body}</p>}</div></>
  :layout==='dialogue'?<Dialogue title={item.title} body={item.body}/>:<div className="sv-text">{layout!=='title'&&<h1>{item.title}</h1>}{layout==='title'&&<><h1>{item.title}</h1></>}{item.body.trim()&&<p className="sv-body">{item.body}</p>}{item.sub&&<p className="sv-sub">{item.sub}</p>}{hasPicture&&layout==='expression'&&<div className="sv-picture small"><Picture emoji={item.emoji} image={item.image}/></div>}</div>}
  {index!==undefined&&<span className="sv-count">{index+1} / {total}</span>}
 </section>;
}
function Dialogue({title,body}:{title:string;body:string}){
 const lines=parseLines(body),scale=Math.min(1,5/Math.max(1,lines.length));
 return <div className="sv-dialogue" style={{['--s' as string]:scale}}><h1>{title}</h1><ol>{lines.map((l,i)=><li key={i}><b className="who">{l.speaker}</b><div><p className="en">{l.en}</p>{l.ko&&<p className="ko">{l.ko}</p>}{l.pron&&<p className="pron">{l.pron}</p>}</div></li>)}</ol></div>;
}
