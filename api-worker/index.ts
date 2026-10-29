import {handleAI} from '../src/ai/server';
type Env={AI_API_KEY?:string;AI_MODEL?:string;APP_ACCESS_TOKEN?:string;ALLOWED_ORIGIN?:string};
export async function gateway(request:Request,env:Env,fetcher:typeof fetch=fetch):Promise<Response>{
 const allowed=env.ALLOWED_ORIGIN||'https://ina-seol.github.io';
 const origin=request.headers.get('Origin');
 const cors={'Access-Control-Allow-Origin':allowed,'Vary':'Origin','Cache-Control':'no-store'};
 const error=(message:string,status:number)=>Response.json({error:message},{status,headers:cors});
 if(origin!==allowed)return error('허용되지 않은 출처입니다.',403);
 if(new URL(request.url).pathname!=='/api/ai')return error('요청 경로를 확인해 주세요.',404);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'}});
 if(request.method!=='POST')return error('POST 요청만 지원합니다.',405);
 if(!env.APP_ACCESS_TOKEN||env.APP_ACCESS_TOKEN.length<24)return error('서버 접속 암호가 아직 설정되지 않았습니다.',503);
 if(request.headers.get('Authorization')!=='Bearer '+env.APP_ACCESS_TOKEN)return error('서버 접속 암호를 확인해 주세요.',401);
 // Only authenticated calls reach the provider. Groq keys never leave the Worker.
 const headers=new Headers(request.headers);headers.delete('origin');headers.delete('authorization');
 const response=await handleAI(new Request(request,{headers}),{AI_API_KEY:env.AI_API_KEY,AI_MODEL:env.AI_MODEL,AI_BASE_URL:'https://api.groq.com/openai/v1'},fetcher);
 const resultHeaders=new Headers(response.headers);for(const [key,value] of Object.entries(cors))resultHeaders.set(key,value);
 return new Response(response.body,{status:response.status,headers:resultHeaders});
}
export default {fetch(request:Request,env:Env){return gateway(request,env);}};
