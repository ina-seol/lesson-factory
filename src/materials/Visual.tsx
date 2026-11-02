import type {SlideLayout} from '../model/extras';
export type SlideItem={layout?:SlideLayout;title:string;body:string;sub?:string;emoji?:string;image?:string;notes?:string};
export function Picture({emoji,image,className=''}:{emoji?:string;image?:string;className?:string}){
 if(image)return <img className={'picture '+className} src={image} alt=""/>;
 if(emoji)return <span className={'picture emoji '+className} aria-hidden="true">{emoji}</span>;
 return <span className={'picture empty '+className} aria-hidden="true"/>;
}
/** 16:9 슬라이드 한 장. 미리보기·발표 화면이 같은 컴포넌트를 쓰고 container 단위로 크기가 맞춰집니다. */
export function SlideView({item,revealed,index,total}:{item:SlideItem;revealed:boolean;index?:number;total?:number}){
 const layout=item.layout||'text',hasPicture=!!(item.emoji||item.image),hide=(layout==='word'||layout==='check')&&!revealed;
 return <section className={'slide-view layout-'+layout} aria-label={item.title}>
  {layout==='word'||layout==='check'?<><div className="sv-picture"><Picture emoji={item.emoji} image={item.image}/></div><div className="sv-text"><h1>{layout==='check'?item.title:item.title}</h1>{layout==='word'&&<p className={'sv-sub'+(hide?' hidden':'')}>{hide?'뜻 보기':item.sub}</p>}{layout==='check'&&<p className={'sv-sub'+(hide?' hidden':'')}>{hide?'정답 보기':item.sub}</p>}{layout==='word'&&item.body.trim()&&<p className="sv-body">{item.body}</p>}</div></>
  :<div className="sv-text">{layout!=='title'&&<h1>{item.title}</h1>}{layout==='title'&&<><h1>{item.title}</h1></>}{item.body.trim()&&<p className="sv-body">{item.body}</p>}{item.sub&&<p className="sv-sub">{item.sub}</p>}{hasPicture&&layout==='expression'&&<div className="sv-picture small"><Picture emoji={item.emoji} image={item.image}/></div>}</div>}
  {index!==undefined&&<span className="sv-count">{index+1} / {total}</span>}
 </section>;
}
