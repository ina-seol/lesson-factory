import { requestSchema, type AIRequest } from '../model/schema';
import { validateResponse } from './provider';
import { policy } from '../prompts/shared';
import { lessonBlueprintPrompt } from '../prompts/lessonBlueprint';
import { worksheetPrompt } from '../prompts/worksheet';
import { assessmentPrompt } from '../prompts/assessment';
import { gameContentPrompt } from '../prompts/gameContent';
import { reviseActivityPrompt } from '../prompts/reviseActivity';
export const prompts:Record<AIRequest['action'],string>={lesson:lessonBlueprintPrompt,worksheet:worksheetPrompt,assessment:assessmentPrompt,game:gameContentPrompt,reviseActivity:reviseActivityPrompt,reviseQuestion:worksheetPrompt};
export function parseAIJson(raw:string){const stripped=raw.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');return JSON.parse(stripped);}
export async function generateValidated(r:AIRequest,complete:(messages:{role:string;content:string}[])=>Promise<string>){const messages=[{role:'system',content:policy+'\n'+prompts[r.action]},{role:'user',content:JSON.stringify(r)}];for(let attempt=0;attempt<2;attempt++){const raw=await complete(messages);try{return validateResponse(r,parseAIJson(raw));}catch(error){if(attempt===1)throw new Error('AI 응답 형식을 두 번 검증했지만 올바른 자료를 만들지 못했습니다. 다시 시도해 주세요.');messages.push({role:'assistant',content:raw.slice(0,40000)},{role:'user',content:'Repair your JSON. Required fields, exact type/count/duration must match. Validation: '+String(error).slice(0,1800)});}}throw new Error('생성 실패');}
export async function handleAI(request:Request,env:Record<string,string|undefined>,fetcher:typeof fetch=fetch){
 const headers={'Cache-Control':'no-store','Content-Type':'application/json'};
 const fail=(error:string,status:number)=>Response.json({error},{status,headers});
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return fail('허용되지 않은 요청입니다.',403);
 if(!env.AI_API_KEY)return fail('AI API가 아직 연결되지 않았습니다. 설정에서 Mock Mode를 선택하거나 서버 환경변수를 등록해 주세요.',503);
 let r:AIRequest;try{const raw=await request.text();if(raw.length>120000)return fail('입력 데이터가 너무 큽니다.',413);r=requestSchema.parse(JSON.parse(raw));}catch{return fail('수업 데이터 형식이 올바르지 않습니다. 입력을 확인해 주세요.',400);}
 const base=env.AI_BASE_URL||'https://api.groq.com/openai/v1';if(!base.startsWith('https://'))return fail('AI 서버 주소는 HTTPS여야 합니다.',503);
 try{const data=await generateValidated(r,async messages=>{const response=await fetcher(base.replace(/\/$/,'')+'/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${env.AI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:env.AI_MODEL||'llama-3.3-70b-versatile',messages,temperature:0.45,response_format:{type:'json_object'},max_tokens:6000}),signal:AbortSignal.timeout(45000)});if(!response.ok)throw new Error('provider_error');const value=await response.json() as {choices?:{message?:{content?:string}}[]};const content=value.choices?.[0]?.message?.content;if(!content)throw new Error('provider_empty');return content;});return Response.json({data},{headers});}catch(error){const message=error instanceof Error&&error.message.startsWith('AI 응답')?error.message:'AI 서버와 연결할 수 없거나 요청이 거절되었습니다. 설정과 네트워크를 확인한 뒤 다시 시도해 주세요.';return fail(message,502);}
}
