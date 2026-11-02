// 초등 영어 기본 어휘: 한국어 뜻과 그림 이모지. 사전에 없는 단어는 교사가 직접 입력합니다.
const raw=`draw|그리다|🎨;read|읽다|📖;write|쓰다|✏️;sing|노래하다|🎤;dance|춤추다|💃;cook|요리하다|🍳;jump|뛰다|🦘;run|달리다|🏃;walk|걷다|🚶;swim|수영하다|🏊;cat|고양이|🐱;dog|개|🐶;book|책|📚;pencil|연필|✏️;apple|사과|🍎;red|빨간색|🔴;blue|파란색|🔵;happy|행복한|😊;help|돕다|🤝;play|놀다|🎮;
yellow|노란색|🟡;green|초록색|🟢;orange|주황색|🟠;purple|보라색|🟣;pink|분홍색|🌸;black|검은색|⚫;white|흰색|⚪;brown|갈색|🟤;
bird|새|🐦;fish|물고기|🐟;rabbit|토끼|🐰;monkey|원숭이|🐵;elephant|코끼리|🐘;lion|사자|🦁;tiger|호랑이|🐯;bear|곰|🐻;horse|말|🐴;cow|소|🐮;pig|돼지|🐷;duck|오리|🦆;mouse|쥐|🐭;snake|뱀|🐍;frog|개구리|🐸;panda|판다|🐼;giraffe|기린|🦒;zebra|얼룩말|🦓;penguin|펭귄|🐧;
banana|바나나|🍌;grape|포도|🍇;grapes|포도|🍇;strawberry|딸기|🍓;watermelon|수박|🍉;orange juice|오렌지 주스|🧃;lemon|레몬|🍋;peach|복숭아|🍑;pizza|피자|🍕;hamburger|햄버거|🍔;chicken|닭고기|🍗;bread|빵|🍞;milk|우유|🥛;egg|달걀|🥚;rice|밥|🍚;cake|케이크|🍰;cookie|쿠키|🍪;ice cream|아이스크림|🍦;salad|샐러드|🥗;soup|수프|🍲;spaghetti|스파게티|🍝;sandwich|샌드위치|🥪;water|물|💧;juice|주스|🧃;carrot|당근|🥕;tomato|토마토|🍅;potato|감자|🥔;
bag|가방|🎒;desk|책상|🪑;chair|의자|🪑;ruler|자|📏;eraser|지우개|🧽;scissors|가위|✂️;glue|풀|🧴;crayon|크레용|🖍️;notebook|공책|📓;pen|펜|🖊️;computer|컴퓨터|💻;clock|시계|🕐;door|문|🚪;window|창문|🪟;board|칠판|🧑‍🏫;umbrella|우산|☂️;ball|공|⚽;doll|인형|🧸;robot|로봇|🤖;kite|연|🪁;bike|자전거|🚲;
mom|엄마|👩;dad|아빠|👨;mother|어머니|👩;father|아버지|👨;sister|누나, 언니, 여동생|👧;brother|형, 오빠, 남동생|👦;grandmother|할머니|👵;grandfather|할아버지|👴;baby|아기|👶;friend|친구|🧑‍🤝‍🧑;teacher|선생님|🧑‍🏫;student|학생|🧑‍🎓;family|가족|👨‍👩‍👧‍👦;doctor|의사|🧑‍⚕️;nurse|간호사|👩‍⚕️;firefighter|소방관|🧑‍🚒;police officer|경찰관|👮;farmer|농부|🧑‍🌾;singer|가수|🎤;chef|요리사|🧑‍🍳;pilot|조종사|🧑‍✈️;
sunny|화창한|☀️;rainy|비 오는|🌧️;cloudy|흐린|☁️;windy|바람 부는|💨;snowy|눈 오는|❄️;hot|더운|🥵;cold|추운|🥶;warm|따뜻한|🌤️;cool|시원한|😎;weather|날씨|🌦️;sun|해|☀️;moon|달|🌙;star|별|⭐;rain|비|🌧️;snow|눈|☃️;
sad|슬픈|😢;angry|화난|😠;hungry|배고픈|😋;thirsty|목마른|🥤;tired|피곤한|😴;sleepy|졸린|😪;scared|무서운|😨;excited|신나는|🤩;sick|아픈|🤒;surprised|놀란|😲;bored|지루한|😑;
head|머리|🗣️;eye|눈|👁️;eyes|눈|👀;nose|코|👃;mouth|입|👄;ear|귀|👂;hand|손|✋;arm|팔|💪;leg|다리|🦵;foot|발|🦶;face|얼굴|🙂;hair|머리카락|💇;
eat|먹다|🍽️;drink|마시다|🥤;sleep|자다|😴;study|공부하다|📝;listen|듣다|👂;look|보다|👀;watch|보다, 지켜보다|📺;open|열다|📂;close|닫다|🚪;wash|씻다|🧼;brush|닦다|🪥;ride|타다|🚴;fly|날다|🕊️;climb|오르다|🧗;catch|잡다|🧤;throw|던지다|🤾;kick|차다|🦵;clap|박수 치다|👏;stand|서다|🧍;sit|앉다|🪑;wake up|일어나다|⏰;go|가다|➡️;come|오다|⬅️;make|만들다|🛠️;buy|사다|🛒;
soccer|축구|⚽;baseball|야구|⚾;basketball|농구|🏀;tennis|테니스|🎾;badminton|배드민턴|🏸;volleyball|배구|🏐;table tennis|탁구|🏓;swimming|수영|🏊;skiing|스키|⛷️;music|음악|🎵;art|미술|🎨;math|수학|➕;science|과학|🔬;english|영어|🔤;pe|체육|🤸;
school|학교|🏫;home|집|🏠;house|집|🏠;park|공원|🌳;library|도서관|📚;hospital|병원|🏥;store|가게|🏪;market|시장|🛒;zoo|동물원|🦓;museum|박물관|🏛️;restaurant|식당|🍽️;bank|은행|🏦;playground|놀이터|🛝;classroom|교실|🏫;bus|버스|🚌;car|자동차|🚗;train|기차|🚆;plane|비행기|✈️;ship|배|🚢;subway|지하철|🚇;
tree|나무|🌳;flower|꽃|🌸;mountain|산|⛰️;river|강|🏞️;sea|바다|🌊;beach|해변|🏖️;sky|하늘|🌤️;
big|큰|🐘;small|작은|🐜;tall|키가 큰|🦒;short|키가 작은|🐣;long|긴|📏;fast|빠른|🐆;slow|느린|🐢;new|새로운|🆕;old|오래된|🕰️;
one|하나|1️⃣;two|둘|2️⃣;three|셋|3️⃣;four|넷|4️⃣;five|다섯|5️⃣;six|여섯|6️⃣;seven|일곱|7️⃣;eight|여덟|8️⃣;nine|아홉|9️⃣;ten|열|🔟;
birthday|생일|🎂;present|선물|🎁;gift|선물|🎁;christmas|크리스마스|🎄;party|파티|🎉;holiday|휴일|🏖️;`;
export type Entry={ko:string;emoji:string};
export const lexicon:Record<string,Entry>=Object.fromEntries(raw.split(';').map(s=>s.trim()).filter(Boolean).map(s=>{const [w,ko,emoji]=s.split('|');return [w.trim().toLowerCase(),{ko,emoji}];}));
const norm=(w:string)=>w.trim().toLowerCase().replace(/[’]/g,"'");
export function lookup(word:string):Entry|undefined{
 const w=norm(word);if(lexicon[w])return lexicon[w];
 const singular=w.replace(/(es|s)$/,'');if(singular!==w&&lexicon[singular])return lexicon[singular];
 return undefined;
}
/** 단어·표현에 어울리는 이모지. 문장이면 포함된 단어에서 찾습니다. */
export function emojiFor(text:string):string|undefined{
 const hit=lookup(text);if(hit)return hit.emoji;
 for(const t of norm(text).match(/[a-z]+/g)||[]){const e=lookup(t);if(e&&t.length>2)return e.emoji;}
 return undefined;
}
