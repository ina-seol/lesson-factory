import { activitySchema, generatedBlueprintSchema, validatedGameSchema, questionSchema, sheetSchema, type AIRequest, type Intake, type Blueprint, type WorksheetOptions, type AssessmentOptions, type Game, type Activity, type Question, type Sheet } from '../model/schema';
import { mockGenerate } from './mock';
import { z } from 'zod';
const responseEnvelope = z.object({ data: z.unknown().optional(), error: z.string().optional() });
export function validateResponse(r:AIRequest,data:unknown):unknown{
 if(r.action==='lesson'){const b=generatedBlueprintSchema.parse(data);if(JSON.stringify(b.targetExpressions)!==JSON.stringify(r.input.targetExpressions)||JSON.stringify(b.vocabulary)!==JSON.stringify(r.input.vocabulary)||Object.entries(b.meta).some(([k,v])=>v!==r.input[k as keyof Intake]))throw new Error('AI가 수업 입력의 필수 조건을 변경했습니다.');return b;}
 if(r.action==='game'){const g=validatedGameSchema.parse(data);if(g.gameType!==r.gameType)throw new Error('게임 종류가 다릅니다.');return g;}
 if(r.action==='reviseActivity'){const a=activitySchema.parse(data);return {...a,id:r.activity.id,minutes:r.activity.minutes};}
 if(r.action==='reviseQuestion'){const q=questionSchema.parse(data);return {...q,id:r.question.id};}
 const s=sheetSchema.parse(data);const count=r.action==='worksheet'?r.options.count:r.options.kind==='Exit Ticket'?3:r.options.kind==='5문항 Quiz'?5:10;
 if(s.questions.length!==count||new Set(s.questions.map(q=>q.id)).size!==count)throw new Error('문항 수 또는 문항 ID가 올바르지 않습니다.');return s;
}
export interface AIProvider{generateLesson(input:Intake):Promise<Blueprint>;generateWorksheet(blueprint:Blueprint,options:WorksheetOptions):Promise<Sheet>;generateGame(blueprint:Blueprint,gameType:Game['gameType']):Promise<Game>;generateAssessment(blueprint:Blueprint,options:AssessmentOptions):Promise<Sheet>;reviseActivity(blueprint:Blueprint,activity:Activity,instruction:string):Promise<Activity>;reviseQuestion(blueprint:Blueprint,question:Question,instruction:string):Promise<Question>;}
export function createProvider(mode:'mock'|'live'):AIProvider{
 async function run<T>(r:AIRequest):Promise<T>{
  let data:unknown;if(mode==='mock'){await new Promise(res=>setTimeout(res,650));data=mockGenerate(r);}else{let response:Response;try{response=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(r),signal:AbortSignal.timeout(100000)});}catch{throw new Error('AI 서버와 연결할 수 없습니다. 입력 내용은 보존했습니다. 네트워크를 확인하고 다시 시도해 주세요.');}const parsed=responseEnvelope.safeParse(await response.json().catch(()=>null));if(!parsed.success)throw new Error('AI 서버 응답을 읽을 수 없습니다. 입력 내용은 보존했습니다.');const body=parsed.data;if(!response.ok)throw new Error(body.error||'AI 생성에 실패했습니다. 다시 시도해 주세요.');data=body.data;}return validateResponse(r,data) as T;
 }
 return {generateLesson:input=>run({action:'lesson',input}),generateWorksheet:(blueprint,options)=>run({action:'worksheet',blueprint,options}),generateGame:(blueprint,gameType)=>run({action:'game',blueprint,gameType}),generateAssessment:(blueprint,options)=>run({action:'assessment',blueprint,options}),reviseActivity:(blueprint,activity,instruction)=>run({action:'reviseActivity',blueprint,activity,instruction}),reviseQuestion:(blueprint,question,instruction)=>run({action:'reviseQuestion',blueprint,question,instruction})};
}
