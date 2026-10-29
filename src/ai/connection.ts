const endpointKey = 'lesson-factory-ai-endpoint';
let accessToken = '';
export function getConnection() {
 return {endpoint: typeof window === 'undefined' ? '' : localStorage.getItem(endpointKey) || '', accessToken};
}
export function setConnection(endpoint: string, token: string) {
 const clean=endpoint.trim();
 if(clean && (new URL(clean).protocol!=='https:' || new URL(clean).username || new URL(clean).password || new URL(clean).search || new URL(clean).hash)) throw new Error('쿼리나 비밀번호가 없는 HTTPS 서버 주소를 입력해 주세요.');
 localStorage.setItem(endpointKey,clean); accessToken=token.trim();
}
export function getAIRequestTarget():{url:string;headers:Record<string,string>} {
 const c=getConnection();
 if(c.endpoint) {
  if(!c.accessToken) throw new Error('설정에서 AI 서버 접속 암호를 입력해 주세요. 새로고침하면 암호를 다시 입력해야 합니다.');
  return {url:new URL('/api/ai',c.endpoint).href,headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.accessToken}};
 }
 if(typeof window!=='undefined'&&window.location.hostname.endsWith('.github.io')) throw new Error('설정에서 Groq 서버 주소와 접속 암호를 등록해 주세요.');
 return {url:'/api/ai',headers:{'Content-Type':'application/json'}};
}
