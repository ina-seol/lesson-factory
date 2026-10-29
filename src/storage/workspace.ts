import { emptyWorkspace, workspaceSchema, type Workspace } from '../model/schema';
import { createId } from '../model/id';
export const STORAGE_KEY='lesson-factory.workspace.v1';
export const PREVIOUS_KEY=STORAGE_KEY+'.previous';
export type StoragePort=Pick<Storage,'getItem'|'setItem'>;
export function readWorkspace(storage:StoragePort):{data:Workspace;warning?:string}{
 try{const raw=storage.getItem(STORAGE_KEY);if(!raw)return {data:emptyWorkspace()};return {data:workspaceSchema.parse(JSON.parse(raw))};}
 catch{try{const previous=storage.getItem(PREVIOUS_KEY);if(previous)return {data:workspaceSchema.parse(JSON.parse(previous)),warning:'저장 데이터에 문제가 있어 이전 저장본을 복구했습니다. 수업 백업을 받아 주세요.'};}catch{/* keep corrupt storage untouched */}return {data:emptyWorkspace(),warning:'저장 데이터를 읽지 못했습니다. 원본은 보존되어 있습니다. 백업 파일을 불러오거나 저장을 다시 시도해 주세요.'};}
}
export function writeWorkspace(storage:StoragePort,data:Workspace){const valid=workspaceSchema.parse(data);const previous=storage.getItem(STORAGE_KEY);if(previous){const parsed=workspaceSchema.safeParse(JSON.parse(previous));if(parsed.success)storage.setItem(PREVIOUS_KEY,previous);}storage.setItem(STORAGE_KEY,JSON.stringify(valid));}
export function parseBackup(raw:string){if(raw.length>10_000_000)throw new Error('백업 파일은 10MB 이하만 불러올 수 있습니다.');return workspaceSchema.parse(JSON.parse(raw));}
export function mergeBackup(current:Workspace,incoming:Workspace,id=()=>createId()):Workspace{return {...current,lessons:[...incoming.lessons.map(l=>({...l,id:id(),updatedAt:new Date().toISOString()})),...current.lessons],preferences:incoming.preferences};}
export function downloadBackup(data:Workspace){const blob=new Blob([JSON.stringify(workspaceSchema.parse(data),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='lesson-factory-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
