import type {Lesson} from '../model/schema';
import {writingEntries} from '../materials/HandwritingWorksheet';
import {speakingDefaults,makeSpeakingSlides} from '../materials/speaking';
import {emojiFor} from '../materials/lexicon';
import {activitySlides} from '../materials/lessonSlides';
import type {SlideDeck} from '../materials/presentation';
export function classRows(lesson:Lesson){const defaults=speakingDefaults(lesson.blueprint);return writingEntries(lesson,'words').map(e=>({word:e.english,cue:e.meaning,replacement:lesson.classroom?.replacements[e.english]??defaults.rows.find(r=>r.word===e.english)?.replacement??e.english,enabled:true}));}
export function classDeck(lesson:Lesson):SlideDeck{
 const b=lesson.blueprint,rows=classRows(lesson),frame=lesson.classroom?.frame??speakingDefaults(b).frame;
 const drills=makeSpeakingSlides(frame,rows,'class-drill');
 return {kind:'slides',title:b.meta.lessonTitle,usedVocabulary:b.vocabulary,slides:[
 {id:'class-goal',layout:'objective',title:'오늘의 목표',body:b.objective.studentFriendly,sub:b.targetExpressions.join(' / ').slice(0,200),notes:'오늘의 목표를 읽고 수업이 끝나면 무엇을 할 수 있는지 함께 확인합니다.'},
 ...rows.map((r,i)=>({id:`class-word-${i}`,layout:'word' as const,title:r.word,body:'',sub:r.cue,emoji:emojiFor(r.word),notes:'뜻을 먼저 추측하고 공개합니다. 전체가 한 번 말하고 짝에게 한 번 더 말합니다.'})),
 ...drills,...activitySlides(b).map((s,i)=>{const a=b.lessonFlow[Math.floor(i/2)];return i%2===0?{...s,title:`${a.title} · 방법`.slice(0,100),body:`${a.description}\n${s.body}`} : s;}),
 {id:'class-exit',layout:'wrapup',title:'오늘 나는 할 수 있어요',body:'① 단어 하나를 골라 뜻을 말해요.\n② 오늘의 표현으로 짝과 묻고 답해요.\n③ 혼자 가능 / 도움 필요 / 더 연습 중에서 골라요.',notes:`평가 기준: ${b.assessment.focus}\n각 학생의 참여를 확인하고 도움이 필요한 표현을 다음 시간에 다시 연습합니다.`}
 ]};
}
