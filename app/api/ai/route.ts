import {handleAI} from '../../../src/ai/server';
export async function POST(request:Request){return handleAI(request,process.env);}
