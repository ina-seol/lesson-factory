import {useState} from 'react';
import {getConnection,setConnection} from '../ai/connection';
export function AIConnectionSettings(){
 const initial=getConnection();
 const [endpoint,setEndpoint]=useState(initial.endpoint),[token,setToken]=useState(initial.accessToken),[message,setMessage]=useState('');
 return <section className="editor-section"><h2>Groq 서버 연결</h2><p>서버 주소와 서버에 설정한 접속 암호를 입력하세요. Groq API 키는 여기에 입력하지 않습니다.</p><label className="field">AI 서버 주소<input type="url" placeholder="https://lesson-factory-api.example.workers.dev" value={endpoint} onChange={e=>setEndpoint(e.target.value)}/></label><label className="field">서버 접속 암호<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)}/></label><p>접속 암호는 현재 탭의 메모리에만 보관하며 새로고침하면 다시 입력해야 합니다.</p><button className="btn" onClick={()=>{try{setConnection(endpoint,token);setMessage('설정을 저장했습니다. 실제 AI 연결 모드에서 수업을 생성해 보세요.');}catch(e){setMessage(e instanceof Error?e.message:'설정을 확인해 주세요.');}}}>연결 설정 저장</button><p role="status">{message}</p></section>;
}
