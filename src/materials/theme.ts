import {useSyncExternalStore} from 'react';
/** 수업 자료(카드·PPT·학습지·게임)에 공통으로 쓰는 파스텔 테마. 선택은 이 브라우저에만 저장합니다. */
export const themes={
 mint:{name:'민트',bg:'F2FAF5',soft:'D8F1E2',primary:'2B7658',accent:'C2603E',ink:'24413A',line:'BFE3CF',dot:'8FD3B0'},
 peach:{name:'복숭아',bg:'FFF6F0',soft:'FFE1D1',primary:'B04E33',accent:'2F7F78',ink:'4A3029',line:'F6CBB5',dot:'FFB394'},
 sky:{name:'하늘',bg:'F1F8FF',soft:'D6EAFC',primary:'255F9C',accent:'B8486A',ink:'233A52',line:'B9D7F2',dot:'8EC1F0'},
 lavender:{name:'라벤더',bg:'F8F5FF',soft:'E6DEFB',primary:'62459F',accent:'A5487F',ink:'34294F',line:'D3C8F2',dot:'B9A6F0'},
 lemon:{name:'레몬',bg:'FFFBEA',soft:'FFF0A6',primary:'775A00',accent:'2F7A57',ink:'45391A',line:'F1E08A',dot:'FFD84D'}
} as const;
export type ThemeId=keyof typeof themes;
export const themeIds=Object.keys(themes) as ThemeId[];
const KEY='lesson-factory.theme.v1',listeners=new Set<()=>void>();
let current:ThemeId='mint';
try{const saved=localStorage.getItem(KEY);if(saved&&saved in themes)current=saved as ThemeId;}catch{/* 저장소를 쓸 수 없으면 기본 테마 */}
export function applyTheme(id:ThemeId=current){
 if(typeof document==='undefined')return;const t=themes[id],s=document.documentElement.style;
 for(const k of ['bg','soft','primary','accent','ink','line','dot'] as const)s.setProperty('--t-'+k,'#'+t[k]);
 document.documentElement.dataset.theme=id;
}
export function setTheme(id:ThemeId){current=id;try{localStorage.setItem(KEY,id);}catch{/* 무시 */}applyTheme(id);listeners.forEach(l=>l());}
export const getTheme=()=>themes[current];
export function useTheme(){return useSyncExternalStore(cb=>{listeners.add(cb);return()=>listeners.delete(cb);},()=>current,()=>'mint' as ThemeId);}
applyTheme();
