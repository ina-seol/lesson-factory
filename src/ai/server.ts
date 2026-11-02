import {extraPrompt} from '../prompts/extra';
import { requestSchema, type AIRequest } from '../model/schema';
import { validateResponse } from './provider';
import { policy } from '../prompts/shared';
import { lessonBlueprintPrompt } from '../prompts/lessonBlueprint';
import { worksheetPrompt } from '../prompts/worksheet';
import { assessmentPrompt } from '../prompts/assessment';
import { gameContentPrompt } from '../prompts/gameContent';
import { reviseActivityPrompt } from '../prompts/reviseActivity';
export const prompts:Record<AIRequest['action'],string>={extra:extraPrompt,lesson:lessonBlueprintPrompt,worksheet:worksheetPrompt,assessment:assessmentPrompt,game:gameContentPrompt,reviseActivity:reviseActivityPrompt,reviseQuestion:worksheetPrompt};
class ProviderError extends Error {}
function providerFailure(status:number) {
 const messages:Record<number,string>={
  400:'Groq가 생성 요청 형식을 거절했습니다 (400). 모델과 요청 옵션을 확인해야 합니다.',
  401:'Groq API 키 인증에 실패했습니다 (401). Cloudflare의 AI_API_KEY를 확인해 주세요.',
  403:'Groq가 이 키 또는 모델의 접근을 허용하지 않았습니다 (403). Groq 계정의 권한을 확인해 주세요.',
  404:'Groq 모델 또는 API 경로를 찾을 수 없습니다 (404). AI_MODEL 설정을 확인해 주세요.',
  413:'Groq 요청 크기 제한을 초과했습니다 (413). 입력 내용을 줄여 주세요.',
  429:'Groq 사용량 또는 요청 속도 제한에 도달했습니다 (429). 잠시 후 다시 시도하거나 Groq 계정의 사용 한도를 확인해 주세요.'
 };
 return new ProviderError(messages[status] || (status>=500 ? 'Groq 서버에서 일시적인 오류가 발생했습니다 ('+status+'). 잠시 후 다시 시도해 주세요.' : 'Groq가 요청을 거절했습니다 (HTTP '+status+').'));
}
export function parseAIJson(raw:string){const stripped=raw.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');return JSON.parse(stripped);}
export async function generateValidated(r:AIRequest,complete:(messages:{role:string;content:string}[])=>Promise<string>){const messages=[{role:'system',content:policy+'\n'+prompts[r.action]},{role:'user',content:JSON.stringify(r)}];for(let attempt=0;attempt<2;attempt++){const raw=await complete(messages);try{return validateResponse(r,parseAIJson(raw));}catch(error){if(attempt===1)throw new Error('AI 응답 형식을 두 번 검증했지만 올바른 자료를 만들지 못했습니다. 다시 시도해 주세요.');messages.push({role:'assistant',content:raw.slice(0,40000)},{role:'user',content:'Repair your JSON. Required fields, exact type/count/duration must match. Validation: '+String(error).slice(0,1800)});}}throw new Error('생성 실패');}
export async function handleAI(request:Request,env:Record<string,string|undefined>,fetcher:typeof fetch=fetch){
 const headers={'Cache-Control':'no-store','Content-Type':'application/json'};
 const fail=(error:string,status:number)=>Response.json({error},{status,headers});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return fail('허용되지 않은 요청입니다.',403);
 if(!env.AI_API_KEY)return fail('AI API가 아직 연결되지 않았습니다. 설정에서 Mock Mode를 선택하거나 서버 환경변수를 등록해 주세요.',503);
 let r:AIRequest;try{const raw=await request.text();if(raw.length>120000)return fail('입력 데이터가 너무 큽니다.',413);r=requestSchema.parse(JSON.parse(raw));}catch{return fail('수업 데이터 형식이 올바르지 않습니다. 입력을 확인해 주세요.',400);}
 const base=env.AI_BASE_URL||'https://api.groq.com/openai/v1';if(!base.startsWith('https://'))return fail('AI 서버 주소는 HTTPS여야 합니다.',503);
 try{const data=await generateValidated(r,async messages=>{const response=await fetcher(base.replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${env.AI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:env.AI_MODEL||'openai/gpt-oss-120b',messages,temperature:0.45,response_format:{type:'json_object'},max_tokens:6000}),signal:AbortSignal.timeout(45000)});if(!response.ok)throw providerFailure(response.status);const value=await response.json() as {choices?:{message?:{content?:string}}[]};const content=value.choices?.[0]?.message?.content;if(!content)throw new ProviderError('Groq가 빈 응답을 반환했습니다. 다시 시도해 주세요.');return content;});return Response.json({data},{headers});}catch(error){const message=error instanceof ProviderError || (error instanceof Error&&error.message.startsWith('AI 응답'))?error.message:error instanceof Error && (error.name==='TimeoutError'||error.name==='AbortError')?'Groq 응답 대기시간 45초를 초과했습니다. 잠시 후 다시 시도해 주세요.':'AI 서버와 연결할 수 없거나 요청이 거절되었습니다. 설정과 네트워크를 확인한 뒤 다시 시도해 주세요.';return fail(message,502);}
}
