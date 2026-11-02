import {useState} from 'react';
import {getConnection,setConnection,clearConnection} from '../ai/connection';
export function AIConnectionSettings(){
 const initial=getConnection();
 const [endpoint,setEndpoint]=useState(initial.endpoint),[token,setToken]=useState(initial.accessToken),[message,setMessage]=useState('');
 return <section className="editor-section"><h2>Groq 서버 연결</h2><p>서버 주소와 서버에 설정한 접속 암호를 입력하세요. Groq API 키는 여기에 입력하지 않습니다.</p><label className="field">AI 서버 주소<input type="url" placeholder="https://lesson-factory-api.example.workers.dev" value={endpoint} onChange={e=>setEndpoint(e.target.value)}/></label><label className="field">서버 접속 암호<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)}/></label><p>이 브라우저에 접속 암호를 저장해 다음에도 연결을 유지합니다. 개인 기기에서 사용하세요. Groq API 키와 연결 설정은 수업 백업에 포함되지 않습니다.</p><button className="btn" onClick={()=>{try{setConnection(endpoint,token);setMessage('연결 설정을 저장했습니다. 새로고침 후에도 유지됩니다. 실제 AI 모드에서 생성하면 연결을 확인할 수 있습니다.');}catch(e){setMessage(e instanceof Error?e.message:'설정을 확인해 주세요.');}}}>연결 설정 저장</button><button className="btn" onClick={()=>{try{clearConnection();setEndpoint('');setToken('');setMessage('이 브라우저에 저장된 연결을 삭제했습니다.');}catch{setMessage('연결 설정을 삭제하지 못했습니다. 브라우저 저장 권한을 확인해 주세요.');}}}>저장된 연결 삭제</button><p role="status">{message}</p></section>;
}
