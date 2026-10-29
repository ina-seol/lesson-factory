export type QuizState={index:number;score:number;attempted:boolean;solved:boolean;finished:boolean;wrong:number[]};
export const initialQuiz=():QuizState=>({index:0,score:0,attempted:false,solved:false,finished:false,wrong:[]});
export function chooseAnswer(s:QuizState,choice:number,answer:number):QuizState{if(s.solved||s.finished||s.wrong.includes(choice))return s;if(choice===answer)return {...s,solved:true,score:s.score+(s.attempted?0:1)};return {...s,attempted:true,wrong:[...s.wrong,choice]};}
export function nextQuestion(s:QuizState,count:number):QuizState{if(!s.solved)return s;if(s.index===count-1)return {...s,finished:true};return {...s,index:s.index+1,attempted:false,solved:false,wrong:[]};}
export function secondsRemaining(deadline:number,now:number){return Math.max(0,Math.ceil((deadline-now)/1000));}
export function matchPair(left:string,right:string,matched:string[]):{matched:string[];correct:boolean}{const correct=left===right;if(!correct||matched.includes(left))return {matched,correct:false};return {matched:[...matched,left],correct:true};}
