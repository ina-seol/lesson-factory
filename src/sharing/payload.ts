import {z} from 'zod';
import {validatedGameSchema,type Game} from '../model/schema';
import type {Extra} from '../model/extras';
const card=z.object({id:z.string().max(240),title:z.string().min(1).max(100),body:z.string().max(4000),sub:z.string().min(1).max(200),emoji:z.string().max(16).optional()});
const schema=z.discriminatedUnion('kind',[z.object({version:z.literal(1),kind:z.literal('game'),game:validatedGameSchema}),z.object({version:z.literal(1),kind:z.literal('speaking'),title:z.string().max(240),cards:z.array(card).min(1).max(40)})]);
export type StudentPayload=z.infer<typeof schema>;
export const gamePayload=(game:Game):StudentPayload=>({version:1,kind:'game',game});
export const speakingPayload=(title:string,cards:Extract<Extra,{kind:'slides'}>['slides']):StudentPayload=>({version:1,kind:'speaking',title,cards:cards.map(c=>({id:c.id,title:c.title,body:c.body,sub:c.sub||'',emoji:c.emoji}))});
export async function encodeStudent(payload:StudentPayload){
 const bytes=new TextEncoder().encode(JSON.stringify(schema.parse(payload)));if(bytes.length>24000)throw new Error('공유할 내용이 너무 많아요. 카드나 설명을 줄여 주세요.');
 const data=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());
 const token=btoa(String.fromCharCode(...data)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');if(token.length>12000)throw new Error('공유 링크가 너무 길어요. 내용을 줄여 주세요.');return token;
}
export async function decodeStudent(token:string):Promise<StudentPayload>{
 if(!token||token.length>12000||!/^[A-Za-z0-9_-]+$/.test(token))throw new Error('올바르지 않은 학생용 링크입니다.');
 const bytes=Uint8Array.from(atob(token.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate')).getReader();let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>24000)throw new Error('공유 자료 크기를 초과했습니다.');chunks.push(r.value);}}finally{await reader.cancel();}
 const all=new Uint8Array(size);let offset=0;for(const c of chunks){all.set(c,offset);offset+=c.length;}return schema.parse(JSON.parse(new TextDecoder().decode(all)));
}
