'use client';
import { useEffect,useRef,useState } from 'react';
import { emptyWorkspace,type Workspace } from '../model/schema';
import { readWorkspace,writeWorkspace,STORAGE_KEY } from '../storage/workspace';
export function useWorkspace(){
 const [data,setData]=useState<Workspace>(emptyWorkspace),[ready,setReady]=useState(false),[saveState,setSaveState]=useState('저장됨'),[warning,setWarning]=useState(''),[conflict,setConflict]=useState(false);
 const current=useRef(data),blocked=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 useEffect(()=>{const loaded=readWorkspace(localStorage);current.current=loaded.data;setData(loaded.data);setWarning(loaded.warning||'');setReady(true);const listener=(e:StorageEvent)=>{if(e.key===STORAGE_KEY){blocked.current=true;setConflict(true);}};window.addEventListener('storage',listener);return()=>{window.removeEventListener('storage',listener);clearTimeout(timer.current);};},[]);
 function update(fn:(d:Workspace)=>Workspace){const next=fn(current.current);current.current=next;setData(next);if(blocked.current){setSaveState('다른 탭과 충돌');return;}setSaveState('저장 중…');clearTimeout(timer.current);try{writeWorkspace(localStorage,next);timer.current=setTimeout(()=>setSaveState('저장됨'),350);}catch{setSaveState('저장 실패');setWarning('브라우저에 저장하지 못했습니다. 현재 화면의 작업은 유지됩니다. 지금 수업 백업을 다운로드한 뒤 저장을 다시 시도해 주세요.');}}
 function reload(){const loaded=readWorkspace(localStorage);current.current=loaded.data;setData(loaded.data);setWarning(loaded.warning||'');blocked.current=false;setConflict(false);setSaveState('저장됨');}
 function retry(){blocked.current=false;setConflict(false);setWarning('');update(d=>d);}
 return {data,ready,update,saveState,warning,conflict,reload,retry};
}
