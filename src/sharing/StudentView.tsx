import {useEffect,useState} from 'react';
import {decodeStudent,type StudentPayload} from './payload';
import {GamePlayer} from '../games/GamePlayer';
import {SpeakingSession} from '../materials/SpeakingSession';
export function StudentView({token}:{token:string}){
 const [data,setData]=useState<StudentPayload|null>(null),[error,setError]=useState(''),[started,setStarted]=useState(false);
 useEffect(()=>{let active=true;setData(null);setError('');setStarted(false);decodeStudent(token).then(x=>{if(active)setData(x);}).catch(()=>{if(active)setError('연습 링크를 열 수 없습니다. 선생님께 새 링크를 요청해 주세요.');});return()=>{active=false;};},[token]);
 if(error)return <main className="student-start"><h1>링크를 확인해 주세요</h1><p>{error}</p></main>;
 if(!data)return <p role="status">연습을 불러오고 있어요.</p>;
 if(started)return data.kind==='game'?<GamePlayer game={data.game} exitLabel="시작 화면" onExit={()=>setStarted(false)}/>:<SpeakingSession cards={data.cards.map(c=>({...c,notes:''}))} exitLabel="시작 화면" onExit={()=>setStarted(false)}/>;
 return <main className="student-start"><span className="eyebrow">LESSON FACTORY · PRACTICE</span><h1>{data.kind==='game'?data.game.title:data.title}</h1><p>이름이나 로그인 없이 연습할 수 있어요. 결과는 선생님께 전송되지 않습니다.</p><button className="btn primary" onClick={()=>setStarted(true)}>연습 시작</button></main>;
}
