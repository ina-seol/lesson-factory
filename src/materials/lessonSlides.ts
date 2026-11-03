import type {Blueprint} from '../model/schema';
import type {Extra} from '../model/extras';
type Slide=Extract<Extra,{kind:'slides'}>['slides'][number];
export function recommendedSlideCount(b:Blueprint){return Math.min(40,4+new Set(b.vocabulary).size+b.targetExpressions.length+b.lessonFlow.length*2);}
/** Mock-only facilitation script. Live generation provides activity-specific directions. */
export function activitySlides(b:Blueprint):Slide[]{return b.lessonFlow.flatMap((a,i)=>{
 const grouping={'pair':'짝끼리 마주 앉아요.','group':'4명씩 모둠을 만들어요. 남은 친구는 가까운 모둠에 함께해요.','whole-class':'모두 화면을 보고 차례를 기다려요.','individual':'혼자 생각하고 답을 준비해요.'}[a.interaction];
 const expressions=b.targetExpressions.slice(0,2).join('\n');
 const notes=`활동: ${a.title} (${a.minutes}분)\n준비물: ${a.materials.join(', ')||'화면, 수업안의 단어·표현'}\n원래 수업안: ${a.description}\n시범: 교사가 한 학생과 먼저 1회 보여 준다. 듣는 학생에게 무엇을 해야 하는지 한국어로 되말하게 한다.\n진행: ${a.interaction==='group'?'모둠에서 말하는 사람, 듣는 사람, 차례 안내 역할을 정하고 매 라운드 교대한다.':'먼저 말하는 사람을 정하고 한 번씩 차례를 바꾼다.'} 전체 시간의 약 1/4은 시범, 1/2은 연습, 나머지는 확인에 쓴다.\n지원: 어려운 학생은 화면의 표현을 보며 말하고, 먼저 끝난 학생은 화면 없이 한 번 더 말한다.\n확인: ${b.assessment.focus} 정답 여부뿐 아니라 모든 학생이 한 번 이상 참여했는지 확인한다.\n전환: 교사의 손 신호에 멈추고 다음 활동을 준비한다.`;
 return [{id:`activity-${i}-rules`,layout:'activity',title:`활동 ${i+1} · 방법`,sub:`${a.minutes}분 · ${a.materials.join(', ')||'화면으로 함께해요'}`.slice(0,200),body:`① 준비: ${grouping}\n② 미션: ${a.description.replace(/Exit Ticket/g,'마무리 확인지')}\n③ 시범: 선생님과 친구의 한 번을 보고 따라 해요.`,notes:notes.slice(0,1200)},
 {id:`activity-${i}-practice`,layout:'practice',title:`활동 ${i+1} · 도전`,body:expressions,sub:'한 번씩 말하고 역할을 바꿔요. 끝나면 손 신호를 보내요.',notes:`활용 표현:\n${expressions}\n${notes}`.slice(0,1200)}] as Slide[];
});}
