import {setTheme,themeIds,themes,useTheme} from './theme';
export function ThemePicker(){
 const id=useTheme();
 return <div className="theme-picker no-print" role="radiogroup" aria-label="자료 색 테마"><span>자료 색</span>{themeIds.map(t=><button key={t} role="radio" aria-checked={id===t} className={id===t?'on':''} onClick={()=>setTheme(t)} title={themes[t].name+' 테마'}><i style={{background:'#'+themes[t].dot}}/>{themes[t].name}</button>)}</div>;
}
