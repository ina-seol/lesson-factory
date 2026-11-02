const connectionKey='lesson-factory-ai-connection.v1';
const legacyEndpointKey='lesson-factory-ai-endpoint';
let memory={endpoint:'',accessToken:''};
export function getConnection(){
 if(typeof window==='undefined')return memory;
 try{const raw=localStorage.getItem(connectionKey);if(raw){const parsed=JSON.parse(raw);if(typeof parsed.endpoint==='string'&&typeof parsed.accessToken==='string')return memory={endpoint:parsed.endpoint,accessToken:parsed.accessToken};}return {...memory,endpoint:memory.endpoint||localStorage.getItem(legacyEndpointKey)||''};}catch{return memory;}
}
export function setConnection(endpoint:string,token:string){
 const clean=endpoint.trim(),accessToken=token.trim();
 if(clean){let url:URL;try{url=new URL(clean);}catch{throw new Error('올바른 HTTPS 서버 주소를 입력해 주세요.');}if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw new Error('쿼리나 비밀번호가 없는 HTTPS 서버 주소를 입력해 주세요.');if(!accessToken)throw new Error('서버 접속 암호를 입력해 주세요.');}
 const next={endpoint:clean,accessToken:clean?accessToken:''};
 try{localStorage.setItem(connectionKey,JSON.stringify(next));}catch{throw new Error('브라우저가 연결 설정 저장을 허용하지 않았습니다. 브라우저 저장 권한을 확인해 주세요.');}memory=next;
}
export function clearConnection(){localStorage.removeItem(connectionKey);localStorage.removeItem(legacyEndpointKey);memory={endpoint:'',accessToken:''};}
export function getAIRequestTarget():{url:string;headers:Record<string,string>}{
 const c=getConnection();if(c.endpoint){if(!c.accessToken)throw new Error('설정에서 AI 서버 접속 암호를 입력하고 연결 설정을 저장해 주세요.');return {url:new URL('/api/ai',c.endpoint).href,headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.accessToken}};}
 if(typeof window!=='undefined'&&window.location.hostname.endsWith('.github.io'))throw new Error('설정에서 Groq 서버 주소와 접속 암호를 등록해 주세요.');return {url:'/api/ai',headers:{'Content-Type':'application/json'}};
}
