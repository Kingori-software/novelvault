/* =====================================================================
   NOVEL VAULT — script.js  (FIXED)
   ===================================================================== */

window.__novelVaultLoaded = true;   // ← diagnostic flag

/* ----------------------------- Constants ----------------------------- */
const CREDENTIALS = { name: 'StoryBloom', password: 'LoveNovels##01' };

const KEY_AUTH  = 'novelVault.auth';
const KEY_DATA  = 'novelVault.novels';
const KEY_THEME = 'novelVault.theme';
const KEY_PREFS = 'novelVault.readerPrefs';

const FONT_MAP = {
  georgia:    "'Georgia', 'Times New Roman', serif",
  palatino:   "'Palatino Linotype', 'Book Antiqua', Palatino, 'Crimson Pro', serif",
  times:      "'Times New Roman', Times, serif",
  crimson:    "'Crimson Pro', Georgia, serif",
  baskerville:"'Libre Baskerville', Georgia, serif",
  inter:      "'Inter', system-ui, sans-serif",
  verdana:    "Verdana, Geneva, sans-serif",
  courier:    "'Courier Prime', 'Courier New', monospace",
  caveat:     "'Caveat', 'Comic Sans MS', cursive",
  italic:     "'Georgia', serif"
};

const QUOTES = [
  '“A reader lives a thousand lives before he dies.” — George R.R. Martin',
  '“There is no friend as loyal as a book.” — Ernest Hemingway',
  '“Books are a uniquely portable magic.” — Stephen King',
  '“I cannot live without books.” — Thomas Jefferson',
  '“We read to know we are not alone.” — C.S. Lewis',
  '“A room without books is like a body without a soul.” — Cicero',
  '“So many books, so little time.” — Frank Zappa',
  '“Words are our most inexhaustible source of magic.” — J.K. Rowling',
  '“Until I feared I would lose it, I never loved to read. One does not love breathing.” — Harper Lee',
  '“Reading is a conversation. All books talk. But a good book listens as well.” — Mark Haddon'
];

/* ------------------------------- State ------------------------------- */
let novels = [];
let currentNovelId = null;
let currentChapterIndex = 0;
let editingNovelId = null;
let pendingCover = '';
let prefs = { font: 'georgia', size: 19, theme: 'sepia' };

/* --- pagination / page-flip state --- */
let currentPageIndex = 0;
let currentPages = [];
let isTurning = false;

const CHARS_PER_PAGE = 1400;
const KEY_POSITION = 'novelVault.position';
/* ------------------------------ Helpers ------------------------------ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.prototype.slice.call(document.querySelectorAll(sel));

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => (
  { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
));

const uid = () => 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

function initials(title) {
  return String(title || '?')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0] ? w[0].toUpperCase() : '')
    .join('') || '?';
}

function safeGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch (e) { return fallback; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}

/* =====================================================================
   ✅ GLOBAL LOGIN HANDLER  — called by inline onsubmit in index.html
   ===================================================================== */
window.handleLogin = function (event) {
  try {
    if (event) event.preventDefault();

    const nameEl = document.getElementById('loginName');
    const passEl = document.getElementById('loginPass');
    const errEl  = document.getElementById('loginError');
    const cardEl = document.querySelector('.login-card');
    if (!nameEl || !passEl) return false;

    const name = nameEl.value.trim();
    const pass = passEl.value;

    const nameOk = name.toLowerCase() === CREDENTIALS.name.toLowerCase();
    const passOk = pass === CREDENTIALS.password;

    if (nameOk && passOk) {
      if (errEl) errEl.textContent = '';
      safeSet(KEY_AUTH, true);
      if (cardEl) {
        cardEl.style.transition = 'transform .45s ease, opacity .45s ease';
        cardEl.style.transform  = 'scale(.94)';
        cardEl.style.opacity    = '0';
      }
      setTimeout(showApp, 380);
    } else {
      if (errEl) errEl.textContent = 'Incorrect name or password. Try again.';
      if (cardEl) {
        cardEl.classList.remove('shake');
        void cardEl.offsetWidth;
        cardEl.classList.add('shake');
      }
      passEl.value = '';
      passEl.focus();
    }
  } catch (e) {
    console.error('handleLogin error:', e);
  }
  return false;
};

/* =====================================================================
   ✅ GLOBAL PASSWORD-VISIBILITY TOGGLE — inline onclick in index.html
   ===================================================================== */
window.handleEyeClick = function (event) {
  try {
    if (event) event.preventDefault();
    const passEl = document.getElementById('loginPass');
    const eyeEl  = document.getElementById('togglePass');
    if (!passEl || !eyeEl) return false;
    passEl.type = (passEl.type === 'password') ? 'text' : 'password';
    eyeEl.textContent = (passEl.type === 'password') ? '👁' : '🙈';
  } catch (e) {
    console.error('handleEyeClick error:', e);
  }
  return false;
};

/* =====================================================================
   SEED DATA — the story (unchanged)
   ===================================================================== */
const CHAPTER_ONE_TEXT = `The first person to notice Emilio was missing was not a person.

It was his bank account.

At 8:17 on a Tuesday morning, his phone vibrated against the wooden table beside his bed. A notification appeared on the screen.

Your current balance: $1.43.

Emilio stared at it for several seconds.

Not because he was surprised. Surprise required expectations, and he had gradually trained himself not to expect much from life.

He turned the phone face down.

The apartment was quiet. Not peaceful, just quiet. There was a difference. Peace suggested that something good had happened. Quiet simply meant that nothing was happening at all.

A small patch of sunlight slipped through the gap between his curtains, illuminating the dust floating above his bed. An empty coffee cup sat beside an unopened electricity bill. His laptop was open on the table, displaying the same job application page he had been staring at for nearly an hour the previous night.

He was twenty-four years old.

At twenty-four, some people were buying houses, getting married, travelling, building businesses, and posting photographs of their achievements online.

Emilio was calculating whether he could afford breakfast.

He reached for his phone again.

A message from his mother.

Have you eaten?

He looked at the message, then at the empty coffee cup.

Yes, Mom.

He sent it.

There was no reason to worry her. She had enough problems of her own.

He got out of bed, walked to the kitchen, and opened the refrigerator. There was half a bottle of water, some old bread, and a container of food he had been saving for later.

He closed it.

The electricity bill was still on the table.

$850.

He had already received two reminders.

The third would probably arrive soon.

He returned to his laptop and opened his email.

Another rejection.

Thank you for your interest in the position. After careful consideration, we have decided to move forward with other candidates.

He read it twice.

Then he closed the email.

It was becoming difficult to distinguish one rejection from another. Different companies, different names, different polite sentences. The message was always the same.

You are not what we are looking for.

He had started the year with a different attitude.

In January, he had written three words on a piece of paper and stuck them above his desk.

THIS IS MY YEAR.

He remembered writing them with the confidence of someone who believed that determination was enough to change the direction of a life.

It was now October.

The paper was still there.

He looked at it for a moment, then turned away.

His phone vibrated again.

A notification from social media.

Someone he had attended university with had posted a photograph beside a new car. Another had announced a promotion. A third was celebrating the opening of a business.

Emilio scrolled through the posts without liking any of them.

He was not angry with those people.

At least, that was what he told himself.

He simply wondered what they had discovered about life that he had somehow missed.

Was it intelligence? Luck? Connections? Confidence?

Or was there something fundamentally wrong with him?

He closed the application.

By noon, he had applied for two more jobs, eaten the remaining bread, and received another reminder about his outstanding bill.

At three, he decided to leave the apartment.

He did not have anywhere important to go. He simply could not bear the feeling of being trapped inside a room that seemed to be shrinking around him.

The city was busy.

Cars moved through the streets. People hurried past shop windows, spoke into phones, and carried bags filled with things Emilio could not afford.

He walked without a destination.

At one point, he stopped outside a restaurant.

Through the glass, he could see people laughing around tables. A man in a dark jacket was discussing something with his colleagues. A woman was showing photographs on her phone. A waiter moved between the tables with the confidence of someone who knew exactly where he belonged.

Emilio watched them.

For a moment, he imagined sitting there.

Not necessarily with friends. Not necessarily celebrating anything.

Just sitting somewhere without calculating the price of everything he ordered.

He looked down at his shoes.

The left one had begun separating slightly at the sole.

He continued walking.

There was something particularly exhausting about being poor that people rarely discussed. It was not simply the absence of money. It was the constant awareness of it.

Every decision became a calculation.

Every invitation became a question.

Every opportunity came with a price he could not afford.

And every time someone asked what he was doing with his life, he had to construct an answer that sounded better than the truth.

He reached a small public square and sat on a bench.

His phone displayed another notification.

A message from an old university acquaintance.

Hey man, long time. How have you been?

Emilio looked at it.

He considered replying honestly.

Not well.

I'm struggling.

I don't know what I'm doing anymore.

Instead, he locked the screen.

He was tired of pretending.

But he was even more tired of explaining.

A few minutes later, his phone rang.

Unknown number.

He watched it vibrate.

He almost ignored it.

Then, for reasons he could not explain, he answered.

"Hello?"

There was a brief silence.

Then a man's voice.

"Emilio?"

The voice was calm. Not particularly deep, not especially warm. It was the kind of voice that did not need to compete for attention.

"Yes. Who is this?"

"My name is Vale."

Emilio waited.

"I'm calling because I believe you may be interested in an opportunity."

Emilio almost laughed.

"An opportunity?"

"Yes."

"What kind?"

"The kind that could change your circumstances."

There was something about the way the man spoke that made Emilio uncomfortable. He did not sound like a salesman. He did not sound desperate to convince him of anything.

He sounded as though he already knew what Emilio would say.

"How did you get my number?"

"Through a professional contact."

"Which contact?"

"Someone who believes you have potential."

Emilio leaned back against the bench.

"That's interesting. Because most people seem to disagree."

A short pause.

"People are often poor judges of potential, Emilio."

Emilio looked toward the street.

"Okay. What exactly are you offering?"

"I would prefer to explain in person."

"Why?"

"Because certain opportunities are difficult to communicate over the telephone."

Emilio rubbed his forehead.

"Is this some kind of investment scheme?"

"No."

"Recruitment?"

"Not exactly."

"Then what?"

"An arrangement."

The word sounded strangely deliberate.

Emilio was silent.

The man continued.

"I would like to meet you tomorrow at six in the evening. I will send you an address. You can listen to what I have to say, ask whatever questions you wish, and decide whether it interests you."

"And if I'm not interested?"

"Then you leave."

"Just like that?"

"Just like that."

Emilio considered ending the call.

Something about the conversation felt wrong. Perhaps it was the secrecy. Perhaps it was the fact that a stranger had called him with an offer that sounded too vague to be legitimate.

But then another thought entered his mind.

What if it was real?

What if this was one of those rare moments when something unexpected happened to someone who had spent years expecting nothing?

"What is the company called?" he asked.

"The organization is known as the Directorate."

Emilio frowned.

"The Directorate?"

"Yes."

"Never heard of it."

"That is understandable."

The man gave him an address.

Emilio opened his notes application and typed it down.

"Tomorrow. Six o'clock."

"Correct."

There was another pause.

Then Vale added something that made Emilio sit a little straighter.

"I would appreciate it if you did not discuss this meeting with anyone before we speak."

"Why?"

"I prefer to explain opportunities without unnecessary interference."

"That sounds suspicious."

"Your instincts are worth listening to, Emilio. If you feel uncomfortable, decline the invitation."

The response was so calm that Emilio did not know what to say.

The man was not trying to persuade him.

He was giving him permission to walk away.

"Fine," Emilio said. "I'll think about it."

"Of course."

"Goodbye."

"Until tomorrow, Emilio."

The call ended.

Emilio stared at the screen.

He checked the number.

No name. No company identification. No photograph.

Just a number.

He searched for the Directorate online.

The results were disappointing.

There were several organizations with similar names, none of which appeared to have any connection to the address Vale had given him.

He searched the address.

It belonged to a commercial building in the business district. Nothing unusual.

He found a website for a consulting firm operating from the same building. Its website was simple, professional, and almost aggressively ordinary.

There were three directors listed.

No Mr. Vale.

Emilio searched the man's name.

Nothing useful appeared.

He closed the browser.

"Probably a scam," he muttered.

But he did not delete the address.

That evening, he returned to his apartment.

He ate the remaining food in the refrigerator, washed his plate, and sat at his desk.

The room was dark except for the light from his laptop.

He opened his email again.

Nothing.

He checked his bank account.

$1.43.

He checked the job applications.

Nothing.

He checked his messages.

Nothing.

For a moment, he wondered whether his entire life had become a series of waiting rooms.

Waiting for someone to call.

Waiting for someone to respond.

Waiting for something to happen.

He opened his phone gallery.

He was not sure why.

He scrolled through old photographs, most of them forgotten. Pictures from university. Screenshots. Random images. Photographs of places he had visited years earlier.

Then he stopped.

A photograph from five years ago.

He was nineteen.

He stood outside a university building with two friends. They were smiling at the camera, their arms resting on one another's shoulders.

Emilio remembered that day.

It had been one of those ordinary afternoons that seemed unimportant at the time. They had finished an examination and decided to take photographs before going home.

He zoomed in.

There was something in the background.

A man.

He stood inside the entrance of the building, slightly behind the group.

Tall. Dressed in a dark suit.

His face was difficult to make out because of the shadows.

Emilio zoomed in further.

The man was not looking at the camera.

He was looking directly at Emilio.

Emilio frowned.

He did not remember anyone standing there.

He studied the man's wrist.

A simple silver watch.

Black face.

Something about it looked familiar.

He could not explain why.

He lowered the phone and looked at the photograph again.

Five years.

The man had been standing there five years ago.

Emilio opened the photograph's details.

The date was correct.

He checked the location.

Correct.

He zoomed in again.

The man's face remained hidden.

Then his phone vibrated.

A message.

Unknown number.

Emilio opened it.

Please bring that photograph tomorrow.

He stopped breathing for a moment.

He looked at the message.

Then at the photograph.

Then back at the message.

He immediately called the number.

It did not connect.

He tried again.

Nothing.

He returned to the message and typed:

Who is this?

The message showed as delivered.

No reply.

He stood up.

For several seconds, he simply stared at the photograph.

Then he heard something.

Three knocks.

Not from the door.

From the window.

Emilio froze.

His apartment was on the second floor.

He slowly turned toward the window.

Three more knocks.

Tap.

Tap.

Tap.

He approached carefully.

The curtains were drawn. He pulled them aside.

There was nobody outside.

Below, the street was empty.

He looked down at the pavement, then toward the neighbouring buildings.

Nothing.

He was about to step away when he noticed something on the glass.

The window had begun to fog.

It was not particularly cold inside, and the apartment was not humid enough to explain the condensation.

But there it was.

A thin layer of moisture spreading across the glass.

Then, slowly, letters began to appear.

One by one.

TOMORROW.

Emilio stepped backward.

His heart was beating so hard that he could feel it in his throat.

He stared at the word.

He blinked.

The letters remained.

He turned on the lights.

The room looked exactly as it had a moment earlier.

His laptop.

His table.

The empty cup.

The unpaid bill.

Nothing had changed.

Except the window.

He approached it again.

The condensation was beginning to disappear.

He touched the glass.

Cold.

He looked outside once more.

The street remained empty.

He pulled the curtains shut.

Then he returned to his phone.

The photograph was gone.

He opened the gallery.

Nothing.

He searched the album.

Nothing.

He checked the recently deleted folder.

Nothing.

He searched the entire device.

The photograph had disappeared.

His stomach tightened.

He opened the messaging application again.

The unknown number was still there.

The message was still there.

Please bring that photograph tomorrow.

He stared at it.

Then he heard another sound.

A soft vibration.

It came from the table.

His laptop screen had turned on.

Emilio walked toward it.

A new notification appeared.

He did not recognize the application.

It was a photograph.

The same photograph he had just lost.

He opened it.

The image appeared on the screen.

He was standing between his two friends outside the university building.

But something was different.

The man in the doorway was gone.

Emilio leaned closer.

The entrance was empty.

He looked at the photograph again.

Then at the original printed photograph lying beneath a pile of papers on his desk.

He picked it up.

The man was still there.

He was certain of it.

He checked the back of the printed photograph.

There was writing.

A sentence.

His hands began to tremble.

The handwriting was familiar.

Too familiar.

He knew the shape of the letters. The way the capital letters leaned slightly to the right. The unusual way the letter 'R' was formed.

It was his handwriting.

The sentence read:

IF HE ASKS YOU WHAT YOU WANT, LIE.

Emilio stared at it.

He had never written those words.

He had never seen them before.

He turned the photograph over again.

Nothing.

He checked the back once more, as though the sentence might disappear if he looked at it long enough.

It did not.

He sat down slowly.

For the first time that evening, he considered calling his mother.

He considered calling one of his old friends.

He considered calling the police.

But what would he tell them?

That a man had called him about an opportunity?

That a photograph from five years ago had disappeared from his phone?

That someone had written a warning in his handwriting?

That something had knocked on his second-floor window?

He imagined the questions.

He imagined their faces.

He imagined explaining the entire thing and watching them slowly conclude that he was losing his mind.

He put the photograph down.

His phone vibrated again.

Another message.

Same unknown number.

Tomorrow. Six o'clock. Do not be late.

Emilio did not respond.

He looked toward the window.

The curtains were still closed.

He did not sleep that night.

At 4:12 in the morning, he opened his laptop and searched for the Directorate again.

He found the consulting firm's website.

Three directors.

Three photographs.

Three professional biographies.

He studied each one.

Nothing unusual.

Then he noticed something.

The website had a section titled OUR HISTORY.

He clicked it.

A short paragraph appeared.

The firm had been established several years earlier by a group of private investors. It specialized in strategic development, private advisory services, and long-term institutional partnerships.

There was a photograph beneath the paragraph.

A group of men standing in front of a building.

Emilio enlarged it.

There were six people.

Five were clearly visible.

The sixth stood slightly behind the others.

Tall.

Dark suit.

Silver watch.

Black face.

Emilio stopped moving.

He looked at the man's face.

The photograph was clearer than the one from his university days.

He could see the man's features now.

He was not smiling.

He was looking directly at the camera.

Emilio felt a cold sensation move through his chest.

He checked the photograph's date.

It had been taken three years ago.

He looked at the man's wrist.

The watch was identical.

He returned to the website's list of directors.

There were still only three names.

The man in the photograph was not among them.

Emilio closed the laptop.

He sat in the darkness until morning.

At 5:30, he took a shower.

At 5:45, he changed into the best clothes he owned.

At 5:52, he stood in front of the mirror.

He looked ordinary.

Tired.

A little thinner than he remembered.

He looked like a man who had spent too much time waiting for his life to begin.

He took the printed photograph and slipped it into his jacket.

Then he checked his phone.

No new messages.

He locked the apartment and stepped outside.

The address was about twenty minutes away.

He could still turn around.

He could go home, delete the number, and pretend none of this had happened.

He could return to the same apartment, the same unpaid bills, the same applications, the same life.

He could remain exactly where he was.

The thought should have comforted him.

It did not.

At 5:58, Emilio reached the building.

It was an ordinary commercial property.

Glass doors.

A reception desk.

A security guard reading something on his phone.

Nothing about it suggested anything unusual.

Emilio checked the address again.

Correct.

He entered.

The security guard looked up.

"Good evening."

"Good evening. I'm here to see someone."

"Name?"

"Mr. Vale."

The guard looked at his screen.

Then he looked at Emilio.

For a moment, his expression changed.

Not surprise.

Recognition.

He picked up a telephone.

"He's here."

A pause.

"Yes."

He put the receiver down.

"Third floor. Room 307."

Emilio nodded.

"Thank you."

He walked toward the elevator.

As the doors closed, he noticed a small security camera above the reception desk.

Its red light was blinking.

He watched it until the doors met.

The elevator began moving.

Third floor.

The doors opened.

A quiet corridor stretched ahead of him.

There were several offices, most of them dark.

At the far end was a door.

307.

Emilio walked toward it.

He stopped outside.

He could hear nothing.

He looked at his watch.

5:59.

He raised his hand and knocked.

Once.

Twice.

The door opened before he could knock a third time.

A man stood on the other side.

Tall.

Dark suit.

Silver watch.

Black face.

Emilio recognized him immediately.

The man from the photograph.

The man who had stood in the background five years earlier.

The man who had disappeared from his phone.

The man who had been watching him before Emilio even knew he existed.

He looked exactly the same.

Not older.

Not younger.

Exactly the same.

His expression was calm.

Almost welcoming.

"Emilio," he said.

Emilio could not speak.

The man stepped aside.

"Please. Come in."

Emilio remained where he was.

The man glanced briefly at the photograph in Emilio's hand.

Then he smiled.

Not warmly.

Not cruelly.

As though something had finally arrived exactly when it was expected.

"You're right on time."

Emilio looked at the man's watch.

6:00.

He had not noticed the minute changing.

The man extended his hand.

"Mr. Vale."

Emilio did not take it.

Vale did not seem offended.

Instead, he looked at Emilio for a moment, studying him with an expression that was difficult to interpret.

Then he asked a question.

"Tell me, Emilio. What is it that you want?"

The question was simple.

Too simple.

Emilio had imagined this meeting a dozen times during the night. He had prepared questions. He had prepared accusations. He had even prepared to walk away.

But now, standing in front of the man from the photograph, he could not remember a single one.

He looked at the office behind Vale.

A large desk.

Two chairs.

A glass of water.

A folder bearing his name.

His full name.

Emilio stared at it.

Vale noticed.

"Please," he said. "Sit down."

Emilio stepped inside.

The door closed behind him.

And somewhere, in a place he could not see, a clock began ticking.`;
const CHAPTER_TWO_TEXT = `
PART ONE
THE MAN BEHIND THE DOOR

The first thing Emilio noticed about Mr. Vale's office was that there were no photographs.

No family portraits. No holiday pictures. No framed certificates or photographs of important people shaking hands.

Nothing personal.

The office was immaculate, almost unnaturally so. A large wooden desk stood near the window. Two leather chairs faced each other across a small table. On the desk sat a glass of water, a silver pen, and a thin black folder.

Emilio's name was written on it.

Not his first name.

His full name.

He looked at it for a moment before taking the chair Vale had offered him.

"Water?" Vale asked.

"No, thank you."

"Of course."

Vale sat opposite him.

For several seconds, neither spoke.

Emilio studied the man.

He looked to be somewhere in his late forties, perhaps early fifties. His hair was neatly arranged, his suit expensive without being particularly noticeable. There was nothing theatrical about him.

He looked like someone who might own several buildings, attend private meetings, and have lunch with people whose names appeared in newspapers.

That was what made him frightening.

He looked ordinary.

Emilio glanced at his wrist.

The silver watch.

The black face.

He remembered the photograph from university.

"Have we met before?" Emilio asked.

Vale adjusted his cuff.

"Not formally."

"That's not what I asked."

A faint smile appeared on Vale's face.

"No. I suppose it isn't."

Emilio leaned forward.

"You were in a photograph I took five years ago."

"I know."

The answer came without hesitation.

Emilio felt his stomach tighten.

"You know?"

"Yes."

"How?"

Vale opened the black folder.

"Before we discuss that, I'd like to understand something."

"No. I think we're going to discuss that first."

Vale looked up.

For the first time, his expression changed slightly.

Not irritation.

Interest.

"Very well."

He closed the folder.

"Ask."

Emilio hesitated.

"Who are you?"

"I told you. Vale."

"That's a name. Not an answer."

"An answer is only useful when the question is precise."

"Then let me be precise. Who are you, and why have you been watching me?"

Vale considered him.

Then he placed both hands on the desk.

"Emilio, I have not been watching you in the way you imagine."

"How am I imagining it?"

"You believe someone has been following your movements. Observing your private life. Watching you through windows and photographs."

"Hasn't someone?"

"Not exactly."

Emilio almost laughed.

"You're going to have to do better than that."

Vale nodded slowly.

"Fair enough."

He opened the folder again.

Inside were several sheets of paper.

Emilio recognized the first photograph immediately.

It was the university photograph.

The same one he had found on his phone the previous night.

Except this version was printed in colour and appeared sharper.

Vale slid it across the desk.

"Do you remember this day?"

"Yes."

"Tell me about it."

Emilio looked at the photograph.

"I was nineteen. We had just finished an examination. I was with two friends."

"Names?"

"Why?"

"I'm interested in your memory of the event."

Emilio looked at him suspiciously.

"Daniel and Marcus."

"And what happened after the photograph was taken?"

"We went for food."

"Where?"

"I don't remember."

"Did you enjoy yourself?"

Emilio frowned.

"What kind of question is that?"

"A simple one."

"I suppose."

Vale watched him.

"You suppose?"

Emilio looked down at the photograph again.

He remembered the building. He remembered the examination. He remembered Daniel complaining about the questions.

But the rest of the afternoon was strangely indistinct.

"I don't remember everything," he admitted.

"Most people don't."

Vale picked up the photograph and returned it to the folder.

"Memory is an unreliable witness."

Emilio stared at him.

"Are you going to explain why you have this?"

"In time."

"That seems to be your favourite answer."

"It is often the most honest one."

Vale turned another page.

A document appeared.

Emilio's employment history.

His education.

Previous applications.

A record of the jobs he had applied for over the past several months.

His outstanding debts.

His current bank balance.

Emilio stopped breathing for a moment.

"Where did you get this?"

Vale did not look up.

"Public records. Professional databases. Information supplied by third parties. Some details were independently verified."

"My bank balance?"

"Financial information can be obtained through several legitimate and less legitimate channels."

"Are you threatening me?"

"No."

"Then why show me this?"

"Because I want you to understand that I did not call you randomly."

Vale turned the document toward him.

At the bottom was a small line.

CURRENT FINANCIAL POSITION: CRITICAL.

Emilio stared at the words.

"That's unnecessary."

"Is it inaccurate?"

Emilio said nothing.

Vale closed the folder.

"I know about the applications. I know about the unpaid bills. I know you have been trying to find stable employment for months. I know you have considered borrowing money from people you would rather not ask."

Emilio's jaw tightened.

"And I know you have begun to believe that your life is passing you by."

The room became very quiet.

Emilio looked away.

Vale continued.

"You are not particularly unusual, Emilio. There are thousands of people in your position. Some are more intelligent than you. Some are more talented. Some are considerably more desperate."

"Then why me?"

"Because you are still dissatisfied."

Emilio frowned.

"Everyone is dissatisfied."

"Not everyone."

Vale leaned back.

"Some people become comfortable with their limitations. They learn to negotiate with disappointment. They lower their expectations until disappointment no longer feels like failure."

He paused.

"You have not done that yet."

Emilio looked at the folder.

"How do you know?"

"Because you are sitting here."

The answer irritated him.

"You called me."

"And you came."

Vale let the words settle.

Then he glanced at the photograph once more.

"Tell me something, Emilio. When you look at that picture, what do you see?"

"My friends and me."

"No. Look more carefully."

Emilio examined it.

"I don't understand."

"What do you see when you look at yourself?"

Emilio studied his younger face.

He looked happier.

Not necessarily successful. Not wealthy. Not even particularly confident.

But there was something in his expression that he could no longer recognize.

"I see a younger version of myself."

"Exactly."

Vale folded his hands.

"And what happened to him?"

Emilio looked up.

"I grew up."

Vale smiled faintly.

"Perhaps."

For the first time since entering the building, Emilio felt that the conversation was moving somewhere he did not want it to go.

He stood.

"I think I've heard enough."

Vale did not attempt to stop him.

"Of course."

Emilio picked up his jacket.

Then Vale spoke again.

"You came here because you wanted your life to change."

Emilio stopped.

Vale looked at him.

"I would encourage you not to confuse discomfort with danger. Sometimes the truth is uncomfortable because it describes something we have spent years avoiding."

Emilio turned around.

"And what truth is that?"

Vale glanced at the folder.

"That you are not afraid of failing."

He paused.

"You are afraid that you might remain exactly as you are."

Emilio said nothing.

Vale opened the folder once more.

"Please sit down, Emilio."

This time, Emilio did.

PART TWO
WHAT HE REALLY WANTED

Vale poured himself a glass of water.

He did not drink it.

Instead, he placed it carefully beside the folder and looked at Emilio.

"Let's begin again."

Emilio settled into the chair.

"Begin what?"

"The conversation."

Vale removed a sheet of paper from the folder.

There were no logos, no company letterhead, and no official markings. Just a series of questions.

"Imagine," Vale began, "that tomorrow morning you woke up and your circumstances had changed."

Emilio watched him.

"How changed?"

"Completely."

"Meaning?"

"You had money. A stable career. A comfortable home. People respected you. Your financial problems were gone."

Emilio gave a small, humourless laugh.

"That sounds nice."

"Would it be enough?"

"Yes."

Vale tilted his head.

"Would it?"

"Obviously."

"Interesting."

He wrote something on the paper.

Emilio leaned forward.

"What?"

"Nothing important."

"Then why write it?"

Vale placed the pen down.

"Because people rarely want only what they say they want."

Emilio looked at him.

"What does that mean?"

"Suppose I gave you a million dollars tomorrow. What would happen?"

"I'd pay my debts."

"And after that?"

"Get somewhere better to live. Buy a decent car. Invest some of it."

"And after that?"

Emilio paused.

"I'd build something."

"What?"

"I don't know. A business, maybe."

"Why?"

Emilio looked irritated.

"Because I don't want to spend my entire life struggling."

Vale nodded.

"That's reasonable."

He waited.

Emilio expected another question.

Instead, Vale said something unexpected.

"You want people to notice you."

Emilio looked at him.

"What?"

"You want to walk into a room and not feel invisible. You want people to listen when you speak. You want your opinions to carry weight. You want the people who dismissed you to discover that they were wrong."

Emilio looked away.

Vale continued.

"You want to be invited into places you currently stand outside. You want to stop explaining yourself. You want to stop pretending that rejection does not hurt."

"You're making assumptions."

"Am I?"

"Yes."

"Then correct me."

Emilio opened his mouth.

Nothing came out.

Vale waited.

The silence was becoming uncomfortable.

Finally, Emilio spoke.

"Maybe I just want a normal life."

"Perhaps."

"A good job. Enough money. A place of my own. The ability to help my family without worrying about how much it costs."

"Those are admirable things."

"Then what's the problem?"

"Nothing."

Vale smiled.

"Except that you haven't told me what you really want."

Emilio stared at him.

For a moment, he thought about the message written on the back of the photograph.

IF HE ASKS YOU WHAT YOU WANT, LIE.

He had nearly forgotten about it.

Now the sentence returned with uncomfortable clarity.

He shifted in his chair.

"I want to be successful."

Vale nodded.

"Better."

"I want people to respect me."

"Better still."

"I want to become someone."

Vale's expression remained unchanged.

Then he said:

"Someone."

The word sounded different in his voice.

As though he were testing its weight.

Emilio looked at him.

"Yes."

"Do you believe you are nobody?"

Emilio gave a quiet laugh.

"Look around."

Vale did.

The office remained silent.

"That is not an answer."

"Then yes."

Vale leaned forward.

"Why?"

Emilio looked at the floor.

"Because nothing I do seems to matter."

"To whom?"

"Anyone."

"Your mother?"

Emilio looked up sharply.

"Leave my mother out of this."

Vale raised one hand slightly.

"My apologies."

Emilio stared at him.

"How do you know about her?"

"She is mentioned in your personal records."

"That's not what I asked."

Vale did not answer immediately.

Then he closed the folder.

"Your mother believes you are capable of more than you currently demonstrate."

Emilio said nothing.

"She worries about you," Vale continued. "She asks whether you have eaten. Whether you are sleeping. Whether you are managing."

Emilio looked toward the window.

"She doesn't need to worry."

"Does she know that?"

"No."

"Why?"

"Because I don't tell her everything."

"Why not?"

Emilio rubbed his palms together.

"Because I don't want her thinking she failed."

Vale watched him.

There was no sympathy in his expression, but there was something else.

Recognition.

"Do you know what I find interesting about you, Emilio?"

"No."

"You have spent a considerable amount of time convincing yourself that nobody sees you."

He paused.

"Yet you spend an extraordinary amount of effort hiding how badly you are doing from the few people who actually care."

Emilio felt something tighten in his chest.

"Can we get back to the opportunity?"

"Certainly."

Vale moved the folder aside.

"I want to show you something."

He reached beneath the desk and produced a thin black tablet.

He placed it on the table and turned the screen toward Emilio.

A photograph appeared.

A man standing outside a modern office building.

He looked to be in his early thirties, dressed in a dark suit, smiling beside a woman and a young child.

Emilio recognized the building.

He had seen it in the city.

"Who is that?"

"Someone who was once in a position similar to yours."

Vale swiped.

Another photograph.

The same man, several years earlier.

He looked younger. His clothes were ordinary. His expression was tired.

A second photograph showed him sitting in a small apartment.

A third showed him receiving an award.

"His name is Adrian," Vale explained. "Five years ago, he was unemployed, heavily indebted, and living in a rented room. His professional prospects were limited. He had little influence and almost no meaningful connections."

Emilio looked at the photographs.

"What happened?"

"He made a decision."

"What decision?"

"One that changed his circumstances."

"Was he involved with the Directorate?"

Vale smiled.

"Eventually."

Emilio looked up.

"Eventually?"

"Yes."

Vale swiped again.

A photograph appeared of Adrian at a formal event, standing beside several influential people.

"Today, he oversees operations across three major markets. His investments are substantial. His professional reputation is excellent."

"How much does he make?"

Vale mentioned a figure.

Emilio stared.

It was more money than he had ever imagined earning in a year.

"That's impossible."

"Is it?"

Emilio examined the photograph again.

The man looked ordinary.

That was the strange part.

He did not look like someone who had discovered a secret way to become wealthy.

He looked like someone who had simply been given opportunities Emilio had never received.

"How did he do it?"

Vale locked the tablet.

"That is what we are here to discuss."

Emilio leaned forward.

"Then discuss it."

Vale looked directly at him.

"Before I do, I need you to understand something."

"What?"

"Success does not always make a person happier."

Emilio frowned.

"That's easy to say when you have money."

Vale did not react.

"Money can remove certain problems. It can purchase comfort, security, influence, and access. It can change the way people treat you."

He paused.

"But it cannot guarantee that you will recognize the person who eventually receives those things."

Emilio looked at him.

"What does that mean?"

Vale picked up the silver pen.

"It means that every meaningful transformation has a cost."

He placed the pen on the desk.

"And you should never agree to pay a price before understanding what is being purchased."

Emilio stared at him.

For the first time, he wondered whether the warning was genuine.

Or whether it was simply another way of making the offer sound more valuable.

"Are you saying this opportunity comes with a price?"

Vale smiled.

"Everything does, Emilio."

Then he opened the black folder again.

PART THREE
THE PEOPLE WHO BECOME IMPORTANT

Vale removed three sheets of paper from the folder.

He arranged them neatly on the table.

"These are not contracts," he said. "They are examples."

Emilio looked at the documents.

Each contained a name, a photograph, and a short description.

"Who are these people?"

"Individuals who entered arrangements with our organization."

"How many?"

"Many."

"How many is many?"

Vale ignored the question.

He pointed to the first photograph.

A woman in her early forties stood beside a group of people at what appeared to be a business conference.

"Clara. She was a junior administrator when we first encountered her. Today, she is a senior executive in a multinational organization."

He moved to the second photograph.

A man with grey hair stood in front of a large house.

"Thomas. He had spent most of his adult life working in positions that offered little advancement. He now owns several businesses."

The third photograph showed a younger man.

"Julian. He was a talented engineer whose career had stalled. He now advises companies on infrastructure development."

Emilio examined the photographs.

"What did they have to do?"

"That depends on the arrangement."

"Meaning?"

"Different people require different outcomes."

Emilio frowned.

"You're being deliberately vague."

"Yes."

The honesty surprised him.

Vale continued.

"We do not offer a universal solution. We identify a person's circumstances, ambitions, capabilities, and limitations. Then we determine whether an arrangement is appropriate."

"Appropriate for whom?"

"For both parties."

Emilio leaned back.

"You're making this sound like some kind of business partnership."

"In certain respects, it is."

"Then why all the secrecy?"

Vale folded his hands.

"Because not everyone understands what they are seeing."

"That sounds convenient."

"It often is."

Emilio looked at the photographs again.

"Do these people know each other?"

"Some do."

"Have they met?"

"Yes."

"Can I speak to them?"

"Not at this stage."

"Why?"

"Because you are not yet a participant."

Emilio frowned.

"Participant?"

Vale smiled slightly.

"A poor choice of words, perhaps."

He collected the photographs.

Emilio watched him place them back into the folder.

"Let me ask you something," Emilio said.

"Please."

"If these people were so successful, why would they need your organization?"

Vale considered the question.

"That is a very good question."

He paused.

"Why does a successful company employ consultants? Why does a wealthy individual maintain advisors? Why does a powerful institution continue to seek influence?"

"Because they want more."

"Exactly."

Vale looked at him.

"Success does not eliminate ambition. It changes its scale."

Emilio nodded slowly.

He could understand that.

He had spent years imagining what life would be like if he had enough money.

But the more he imagined, the more things he wanted.

A better apartment.

A car.

A business.

A respectable wardrobe.

A name people recognized.

Perhaps even a position where other people waited for his approval.

He wondered whether there was a point at which wanting more stopped being ambition and became something else.

"Do you work for these people?" Emilio asked.

Vale looked at him.

"Sometimes."

"Who do you answer to?"

"The Directorate."

"And who runs it?"

Vale's expression did not change.

"That is not a question you need to concern yourself with today."

Emilio shook his head.

"You're asking me to trust an organization whose leadership I cannot identify."

"No."

Vale's answer was immediate.

"I'm asking you to evaluate an opportunity."

"Without knowing who's behind it."

"You are free to decline."

The same response again.

Vale never begged.

He never raised his voice.

He never appeared offended by Emilio's suspicion.

It was almost as though the possibility of rejection had already been accounted for.

Emilio looked at the clock.

6:43.

He had been there for forty-three minutes.

He thought about the apartment waiting for him.

The unpaid bill.

The empty refrigerator.

The rejection email.

He thought about his mother's message.

Have you eaten?

Then he looked at the photographs again.

"How does it work?"

Vale remained still.

"How does what work?"

"The arrangement."

Vale opened a drawer and removed a small black envelope.

He placed it on the desk.

Emilio stared at it.

"What's that?"

"An invitation."

"To what?"

"An assessment."

Emilio did not touch it.

Vale explained.

"The Directorate does not accept everyone who expresses interest. There are certain considerations. We evaluate whether an individual is suitable for the opportunities we facilitate."

"And what happens if I qualify?"

"Then we discuss the terms."

"And if I don't?"

"Then you leave."

"With nothing?"

"With your life exactly as it was before you arrived."

Emilio looked at the envelope.

It was unmarked.

No company logo.

No address.

Nothing.

He reached toward it, then stopped.

"What happens to the people who accept?"

Vale watched him carefully.

"They receive what they agreed to receive."

"That's not an answer."

"It is the only answer I can give you at this stage."

Emilio picked up the envelope.

It was surprisingly heavy.

He opened it.

Inside was a single card.

On it were five words.

THE FIRST PAYMENT IS ATTENTION.

Emilio read the sentence twice.

"What does this mean?"

Vale did not answer.

He looked at the card for a moment, then at Emilio.

"An interesting phrase, isn't it?"

"Did you write it?"

"No."

"Who did?"

"Someone who understood the cost of being noticed."

Emilio turned the card over.

Blank.

He placed it on the table.

"You're telling me I have to pay something?"

"Not today."

"Then when?"

"When you understand what is being offered."

Vale stood.

The meeting was apparently over.

Emilio looked at him.

"That's it?"

"For today."

"You called me here, showed me photographs, told me almost nothing, and now you're sending me away?"

Vale smiled.

"I have told you quite a lot."

"You've told me nothing useful."

"Perhaps you were expecting something different."

Emilio stood as well.

"Maybe I was expecting an actual opportunity."

Vale moved toward the door.

"Opportunities are rarely presented in the form people expect."

He opened it.

Emilio stepped into the corridor.

Before he could leave, Vale spoke again.

"One more thing."

Emilio turned.

"Yes?"

"Do not mistake the absence of attention for the absence of value."

Emilio frowned.

Vale continued.

"Some people spend their entire lives trying to become visible. They eventually discover that being seen is not the same as being understood."

He paused.

"And being important is not the same as being loved."

Emilio stared at him.

For a brief moment, Vale's face seemed almost tired.

Then the expression disappeared.

"Have a pleasant evening."

The door closed.

Emilio stood alone in the corridor.

He looked down at the black envelope in his hand.

He had expected to leave with answers.

Instead, he had acquired more questions.

He entered the elevator and pressed the ground-floor button.

As the doors began closing, he noticed something.

A small security camera was mounted in the upper corner.

Its lens was directed toward him.

He watched it.

The red light was not blinking.

It was steady.

For a moment, he thought he saw a reflection in the glass.

A second person standing behind him.

Tall.

Dressed in a dark suit.

Emilio spun around.

The elevator was empty.

The doors closed.

When he reached the ground floor, the security guard was no longer at the reception desk.

The building seemed quieter than before.

He walked outside.

The city continued as though nothing had happened.

Cars moved.

People laughed.

Traffic lights changed.

Emilio stood on the pavement holding the black envelope.

He took out his phone.

There was a message from his mother.

Don't stay out too late. Hope you're okay.

He stared at it.

Then he looked at the envelope.

For the first time in a long while, someone had made him feel that his life might contain something beyond disappointment.

He hated himself for how much that feeling mattered.

He put the envelope inside his jacket and began walking home.

PART FOUR
THE FIRST WARNING

Emilio returned to his apartment shortly after eight.

He locked the door behind him and placed the black envelope on the table.

For several minutes, he did nothing.

He simply stood there, looking at it.

The apartment felt different.

Not physically.

The furniture was the same. The unpaid bill was still on the table. The refrigerator was still nearly empty.

But something had changed.

He had spent the afternoon with a man who knew more about his life than most people he had known for years.

A man who spoke about success as though it were something that could be arranged.

A man who had appeared in a photograph taken five years earlier.

Emilio removed his jacket.

He took out the printed photograph and placed it beside the envelope.

He studied the man standing in the doorway.

Then he looked at the black card.

THE FIRST PAYMENT IS ATTENTION.

He turned it over.

Nothing.

He examined the edges.

Nothing.

He placed it down.

His phone vibrated.

A notification from his email.

He opened it.

It was an automated message from one of the companies he had applied to earlier that week.

Thank you for your application. Unfortunately, we will not be progressing with your candidacy.

He stared at it.

Then he laughed.

Not because it was funny.

Because the timing felt almost insulting.

He closed the email and walked to the kitchen.

He opened the refrigerator.

The same half bottle of water.

The same empty shelves.

He stood there for a moment, then closed it.

He returned to the table.

The envelope was still there.

He picked up his phone and searched for the number that had called him.

Nothing.

He searched for Vale again.

Nothing useful.

He tried searching for the Directorate using different phrases.

Private advisory group.

Strategic development organization.

Institutional investment network.

Nothing.

The website he had found earlier was still accessible, but the photograph of the six men was gone.

He refreshed the page.

The photograph did not return.

He opened the browser history and searched for the page.

It was there.

He clicked it.

A message appeared.

PAGE NOT FOUND.

Emilio leaned back.

"Of course."

He closed the browser.

For several minutes, he sat in silence.

Then he noticed the envelope.

It was open.

He was certain he had left it closed.

He reached for it.

Inside was the same card.

But there was something else.

A second sheet of paper.

He removed it carefully.

It was a printed page containing a short paragraph.

No heading.

No signature.

Just a few lines.

YOU HAVE SPENT YEARS ASKING TO BE GIVEN A CHANCE.

YOU HAVE BEEN GIVEN ONE.

THE QUESTION IS WHETHER YOU ARE PREPARED TO BE SEEN.

Emilio read it twice.

He looked at the envelope.

There was no opening through which another person could have placed the paper without him noticing.

He checked the door.

Still locked.

He checked the windows.

Closed.

He returned to the table.

A strange thought entered his mind.

What if the message was not meant for him?

What if someone else had placed it there?

He looked at the handwriting.

It was printed.

Perfectly ordinary.

But the sentence seemed strangely familiar.

He turned the paper over.

At the bottom was a date.

Tomorrow.

And beneath it:

11:00 A.M.

He stared at the time.

He had not agreed to another meeting.

He picked up his phone and dialled the unknown number.

This time, it rang.

Once.

Twice.

Then Vale answered.

"Good evening, Emilio."

Emilio's grip tightened.

"How did this get here?"

A pause.

"What are you referring to?"

"The paper. The envelope."

"Ah."

Vale sounded almost amused.

"Did you find it?"

"Don't do that."

"Do what?"

"Speak as though you know exactly what I'm talking about."

Another pause.

Then Vale said:

"I believe you have received an invitation."

"An invitation to what?"

"Tomorrow's assessment."

"I didn't agree to that."

"You are not obligated to attend."

"Then why send it?"

"Because you may wish to reconsider."

Emilio looked at the paper.

"How did it get into my apartment?"

Vale was silent.

"Mr. Vale?"

"Yes?"

"How?"

"Emilio, there are questions whose answers are more useful when understood in the correct order."

"That's convenient."

"Perhaps."

Emilio walked toward the window.

"Listen. I don't know what kind of organization you're running, but I don't appreciate people entering my apartment."

"I understand."

"Do you?"

"Yes."

"Then promise me it won't happen again."

Vale did not answer immediately.

Finally, he said:

"No one entered your apartment."

Emilio looked at the locked door.

"Then how did this get here?"

"That is something you may wish to consider."

The call ended.

Emilio stood motionless.

He looked at his phone.

Then at the envelope.

He wanted to throw it away.

He wanted to tear it into pieces, place it in the rubbish, and forget that he had ever met the man.

Instead, he sat down.

He opened the black card again.

THE FIRST PAYMENT IS ATTENTION.

He wondered what it meant.

Attention from whom?

Attention to what?

Was this some kind of psychological experiment?

A recruitment strategy?

A wealthy group playing games with people who had nothing?

The possibilities were endless.

He opened his laptop and searched for the phrase.

Nothing meaningful appeared.

He tried another search.

Nothing.

Then, almost without thinking, he searched for Adrian.

The man Vale had shown him.

He found a professional profile.

The photograph was different, but the face was unmistakable.

Adrian was now listed as the managing director of a company with offices in several cities.

Emilio opened the company's website.

There were photographs of offices, employees, and business events.

He scrolled through them.

Then he found an interview.

The headline read:

FROM FAILURE TO INFLUENCE: HOW ADRIAN BUILT AN UNLIKELY CAREER.

Emilio clicked.

The article described Adrian's earlier struggles.

His debts.

His failed business.

His unsuccessful applications.

Then, suddenly, his career had changed.

A new position.

A new company.

A series of extraordinary opportunities.

He had never publicly explained how the transformation happened.

The article included one quotation:

"At some point, you have to stop asking why nobody believes in you and start deciding what you're willing to do to make them believe."

Emilio read it again.

He opened Adrian's professional profile and sent him a message.

Hello. I came across your story and would appreciate some advice. I understand you once worked with an organization called the Directorate. Could you tell me more about your experience?

He hesitated.

Then he sent it.

A few seconds later, the message showed as delivered.

Emilio waited.

Nothing.

He closed the laptop.

It was almost midnight.

He went to bed, but sleep did not come easily.

He kept thinking about the meeting.

About Vale.

About the photographs.

About the offer.

And most importantly, about the possibility that tomorrow could be different.

At 2:36 A.M., his phone lit up.

A new message.

Emilio reached for it.

The sender was Adrian.

He opened it.

For several seconds, he did not understand what he was reading.

Then he sat upright.

The message contained only one sentence.

"Whatever they offer you, don't let them make you feel grateful."

Emilio read it again.

Then a second message appeared.

"Especially if they tell you that you were chosen."

He stared at the screen.

His fingers hovered above the keyboard.

He typed:

Why? What happened to you?

The message showed as delivered.

No reply.

He waited.

A minute passed.

Then another.

He checked Adrian's profile.

The account was still active.

He returned to the conversation.

A final message appeared.

"Forget I contacted you."

Emilio frowned.

He began typing again.

But before he could send anything, the conversation disappeared.

Not deleted from his side.

Gone.

He refreshed the application.

Nothing.

He searched for Adrian's profile.

It was still there.

But the message history was empty.

Emilio placed the phone on the mattress.

He looked at the ceiling.

The room was dark.

For a long time, he did not move.

Then he remembered something.

The photograph.

He reached toward the table and picked it up.

The man in the doorway was still there.

The silver watch.

The black face.

The same expressionless figure.

Emilio turned the photograph over.

IF HE ASKS YOU WHAT YOU WANT, LIE.

He read the sentence again.

Then he looked at the black envelope.

Tomorrow.

11:00 A.M.

He had not agreed to attend.

He had not even told Vale that he would consider it.

But as the minutes passed, another thought began to take shape.

Perhaps Adrian was warning him because the opportunity was dangerous.

Perhaps Vale was dangerous.

Perhaps the entire organization was dangerous.

But what if the warning itself was part of the arrangement?

What if someone wanted him to become frightened enough to walk away?

He thought about his bank balance.

$1.43.

He thought about the unpaid $850 bill.

He thought about the applications that never received replies.

He thought about the people he had watched through restaurant windows.

He thought about the man he had once been.

And then he thought about the possibility of becoming someone else.

Someone respected.

Someone powerful.

Someone whose calls were answered.

Someone who never had to lie to his mother about whether he had eaten.

He knew there was something wrong with the entire situation.

He knew it.

But knowing something was wrong had never been enough to make him walk away from everything he wanted.

At 3:18 A.M., he finally made a decision.

He would attend the assessment.

Not because he trusted Vale.

Not because he believed in the Directorate.

But because he wanted to know what they were offering.

And because, somewhere beneath the fear, there was a feeling he had not experienced in years.

Hope.

He placed the photograph inside the black envelope.

Then he turned off the light.

Across the city, in an office on the third floor of a building that did not appear on several public directories, Mr. Vale sat alone at his desk.

A telephone rested beside his hand.

He listened to a voice coming through the receiver.

"He's interested."

Vale looked at a photograph lying on the desk.

Emilio.

Nineteen years old.

Standing outside a university building.

The same photograph.

"Naturally," Vale replied.

The voice on the telephone continued.

"There's a concern."

Vale looked toward the window.

"What concern?"

"He received a message from Adrian."

For the first time that evening, Vale's expression changed.

Only slightly.

"Did he read it?"

"Yes."

Vale remained silent.

Then he asked:

"Did Adrian say anything else?"

"No."

Vale looked down at his watch.

The silver case reflected the light.

"Interesting."

He closed the folder.

"Keep an eye on him."

The voice hesitated.

"And Adrian?"

Vale looked at the photograph again.

"Adrian has forgotten what happens when people interfere with an unfinished arrangement."

He ended the call.

Then he opened a drawer.

Inside were dozens of black folders.

Each bore a name.

Some were old.

Some were recent.

Some had dates stretching back decades.

He searched through them until he found one.

EMILIO.

He opened it.

The first page contained a photograph of Emilio as a child.

The second contained his educational history.

The third contained information about his family.

Vale turned to the final page.

There was a handwritten note.

It was old.

The ink had faded slightly.

But the words remained clear.

DO NOT APPROACH THE BOY.

Vale studied the sentence for a moment.

Then he closed the folder.

He placed it beneath the others.

And for the first time that night, he looked genuinely displeased.

END OF CHAPTER TWO 

NEXT:
CHAPTER THREE — MR. VALE`;

// ==========================================
// THE LAST ROSE OF ASHFORD
// ==========================================

const ASHFORD_CHAPTER_ONE = `UNAVAILABLE KINDLY WAIT FOR ADMIN TO ADD
`;

const ASHFORD_CHAPTER_TWO = `UNAVAILABLE KINDLY WAIT FOR ADMIN TO ADD`;

const ASHFORD_CHAPTER_THREE = `
UNAVAILABLE KINDLY WAIT FOR ADMIN TO ADD
`;

function seedNovels() {
  return [

    // NOVEL ONE
    {
      id: uid(),
      title: "THE DEVIL DOESN'T BARGAIN",
      cover: '',
      createdAt: Date.now(),
      chapters: [
        {
          title: 'Chapter One — A Man Nobody Remembered',
          content: CHAPTER_ONE_TEXT
        },
        {
          title: 'Chapter Two — The Cost of Being Nobody',
          content: CHAPTER_TWO_TEXT
        }
      ]
    },

    // NOVEL TWO
    
{
  id: uid(),
  title: "THE LAST ROSE OF ASHFORD",
  cover: '',
  createdAt: Date.now(),

  chapters: [
    {
      title: 'Chapter One',
      content: ASHFORD_CHAPTER_ONE
    },
    {
      title: 'Chapter Two',
      content: ASHFORD_CHAPTER_TWO
    },
    {
      title: 'Chapter Three',
      content: ASHFORD_CHAPTER_THREE
    }
  ]
},

    // NOVEL THREE
    {
      id: uid(),
      title: "THE LIGHTKEEPER",
      cover: '',
      createdAt: Date.now(),
      chapters: [
        {
          title: 'Chapter One — The Last Light',
          content: LIGHTKEEPER_CHAPTER_ONE
        },
        {
          title: 'Chapter Two — Morning',
          content: LIGHTKEEPER_CHAPTER_TWO
        }
      ]
    }

  ];
}


/* =====================================================================
   BOOT  (robust — survives if one step fails)
   ===================================================================== */
function init() {
  try { loadTheme(); }  catch (e) { console.error('loadTheme:', e); }
  try { loadPrefs(); }  catch (e) { console.error('loadPrefs:', e); }
  try { buildQuotes(); }catch (e) { console.error('buildQuotes:', e); }
  try { loadNovels(); } catch (e) { console.error('loadNovels:', e); }
  try { bindEvents(); } catch (e) { console.error('bindEvents:', e); }

  if (safeGet(KEY_AUTH, false) === true) {
    showApp();
  } else {
    const ls = document.getElementById('loginScreen');
    const ap = document.getElementById('app');
    if (ls) ls.classList.remove('hidden');
    if (ap) ap.classList.add('hidden');
    setTimeout(() => {
      const n = document.getElementById('loginName');
      if (n) n.focus();
    }, 400);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* =====================================================================
   THEME
   ===================================================================== */
function loadTheme() {
  const saved = safeGet(KEY_THEME, 'dark');
  document.body.classList.toggle('dark', saved === 'dark');
  const t = $('#themeToggle');
  if (t) t.textContent = saved === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  safeSet(KEY_THEME, isDark ? 'dark' : 'light');
  const t = $('#themeToggle');
  if (t) t.textContent = isDark ? '🌙' : '☀️';
}

/* =====================================================================
   QUOTES
   ===================================================================== */
function buildQuotes() {
  const track = $('#quotesTrack');
  if (!track) return;
  const html = QUOTES.map(q => `<span>${esc(q)}</span>`).join('');
  track.innerHTML = html + html;
}

/* =====================================================================
   APP SHOW / LOGOUT
   ===================================================================== */
function showApp() {
  const ls = document.getElementById('loginScreen');
  const ap = document.getElementById('app');
  if (ls) ls.classList.add('hidden');
  if (ap) ap.classList.remove('hidden');
  renderLibrary();
}

function logout() {
  localStorage.removeItem(KEY_AUTH);
  location.reload();
}

/* =====================================================================
   NOVEL STORAGE
   ===================================================================== */

function loadNovels() {
  const stored = safeGet(KEY_DATA, null);

  // Keep previously saved novels available
  novels = Array.isArray(stored) ? stored : [];

  try {
    const sourceNovels = seedNovels();

    if (!Array.isArray(sourceNovels)) {
      throw new Error('seedNovels() did not return an array.');
    }

    sourceNovels.forEach(sourceNovel => {
      const existingNovel = novels.find(
        n => n.title === sourceNovel.title
      );

      if (existingNovel) {
        existingNovel.chapters = sourceNovel.chapters;
      } else {
        novels.push(sourceNovel);
      }
    });

    persist();

  } catch (error) {
    console.error('Novel synchronization failed:', error);

    // If there was no previous library, show the error
    if (!novels.length) {
      throw error;
    }
  }
}
function persist() {
  const ok = safeSet(KEY_DATA, novels);
  if (!ok) {
    alert('Storage is full! Try using smaller cover images or image links instead of uploads.');
  }
}

function getNovel(id) { return novels.find(n => n.id === id); }

/* =====================================================================
   LIBRARY RENDER
   ===================================================================== */
function renderLibrary() {
  const grid = $('#bookGrid');
  const empty = $('#emptyState');
  if (!grid) return;
  grid.innerHTML = '';

  const count = $('#shelfCount');
  if (count) {
    count.textContent = novels.length === 0
      ? 'No novels yet'
      : novels.length + ' novel' + (novels.length > 1 ? 's' : '') + ' on your shelf';
  }

  if (empty) empty.classList.toggle('hidden', novels.length !== 0);

  novels.forEach((n, i) => {
    const card = document.createElement('article');
    card.className = 'book-card';
    card.dataset.id = n.id;
    card.style.animationDelay = (i * 55) + 'ms';

    const coverHTML = n.cover
      ? '<img src="' + esc(n.cover) + '" alt="' + esc(n.title) + ' cover">'
      : '<div class="ph-cover" style="--h:' + hashStr(n.title) + '"><span>' + esc(initials(n.title)) + '</span></div>';

    card.innerHTML =
      '<div class="book-cover">' + coverHTML + '</div>' +
      '<div class="book-info">' +
        '<h3 class="book-title" data-role="title">' + esc(n.title) + '</h3>' +
        '<span class="chapter-count">' + n.chapters.length + ' chapter' + (n.chapters.length !== 1 ? 's' : '') + '</span>' +
      '</div>' +
      '<div class="card-tools">' +
        '<button data-act="rename" title="Rename book">✎</button>' +
        '<button data-act="edit"   title="Edit novel & chapters">⚙</button>' +
        '<button data-act="delete" title="Delete novel">🗑</button>' +
      '</div>';

    grid.appendChild(card);
  });

}

/* =====================================================================
   CARD INTERACTIONS
   ===================================================================== */
function bindGridEvents() {
  const grid = $('#bookGrid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.book-card');
    if (!card) return;
    const id = card.dataset.id;
    const btn = e.target.closest('button[data-act]');
    const titleEl = e.target.closest('[data-role="title"]');

    if (btn) {
      e.stopPropagation();
      const act = btn.dataset.act;
      if (act === 'edit')   openModal(id);
      if (act === 'delete') deleteNovel(id);
      if (act === 'rename') startRename(titleEl);
      return;
    }

    if (titleEl && titleEl.isContentEditable) return;
    openReader(id);
  });

  grid.addEventListener('keydown', (e) => {
    const t = e.target.closest('[data-role="title"]');
    if (!t || !t.isContentEditable) return;
    if (e.key === 'Enter') { e.preventDefault(); t.blur(); }
    if (e.key === 'Escape') { t.textContent = t.dataset.original; t.blur(); }
  });

  grid.addEventListener('focusout', (e) => {
    const t = e.target.closest('[data-role="title"]');
    if (!t || !t.isContentEditable) return;
    commitRename(t);
  });
}

function startRename(titleEl) {
  if (!titleEl) return;
  titleEl.dataset.original = titleEl.textContent;
  titleEl.contentEditable = 'true';
  titleEl.focus();
  const range = document.createRange();
  range.selectNodeContents(titleEl);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function commitRename(titleEl) {
  titleEl.contentEditable = 'false';
  const card = titleEl.closest('.book-card');
  const n = getNovel(card.dataset.id);
  if (!n) return;
  const newTitle = titleEl.textContent.trim() || n.title;
  titleEl.textContent = newTitle;
  if (newTitle !== n.title) {
    n.title = newTitle;
    persist();
    renderLibrary();
  }
}

function deleteNovel(id) {
  const n = getNovel(id);
  if (!n) return;
  if (!confirm('Delete "' + n.title + '" permanently?')) return;
  novels = novels.filter(x => x.id !== id);
  persist();
  renderLibrary();
}

/* =====================================================================
   MODAL
   ===================================================================== */
function openModal(id) {
  editingNovelId = id || null;
  pendingCover = '';
  const novel = id ? getNovel(id) : null;

  $('#modalTitle').textContent = novel ? 'Edit Novel' : 'Add Novel';
  $('#fTitle').value = novel ? novel.title : '';
  $('#fUrl').value = (novel && novel.cover && !novel.cover.startsWith('data:')) ? novel.cover : '';
  $('#fFile').value = '';
  $('#chaptersWrap').innerHTML = '';

  pendingCover = novel ? (novel.cover || '') : '';
  updateCoverPreview();

  const chapters = (novel && novel.chapters.length)
    ? novel.chapters
    : [{ title: 'Chapter One', content: '' }];

  chapters.forEach(ch => addChapterBlock(ch.title, ch.content));
  $('#modal').classList.remove('hidden');
  setTimeout(() => $('#fTitle').focus(), 150);
}

function closeModal() {
  $('#modal').classList.add('hidden');
  editingNovelId = null;
  pendingCover = '';
}

function addChapterBlock(title, content) {
  title = title || '';
  content = content || '';
  const wrap = $('#chaptersWrap');
  const idx = wrap.children.length + 1;
  const block = document.createElement('div');
  block.className = 'chapter-block';
  block.innerHTML =
    '<div class="ch-head">' +
      '<input class="ch-title" type="text" placeholder="Chapter ' + idx + ' — Title" value="' + esc(title) + '" />' +
      '<button class="ch-del" title="Remove chapter">✕</button>' +
    '</div>' +
    '<textarea class="ch-content" placeholder="Paste the chapter text here...">' + esc(content) + '</textarea>';

  block.querySelector('.ch-del').addEventListener('click', () => {
    if (wrap.children.length === 1) {
      block.querySelector('.ch-content').value = '';
      block.querySelector('.ch-title').value = '';
      return;
    }
    block.remove();
  });
  wrap.appendChild(block);
}

function updateCoverPreview() {
  const box = $('#coverPreview');
  if (!box) return;
  box.innerHTML = pendingCover
    ? '<img src="' + esc(pendingCover) + '" alt="Cover preview">'
    : '<span class="muted">Cover preview</span>';
}

function fileToCover(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 700;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        if (h > MAX * 1.5) { w = Math.round(w * (MAX * 1.5) / h); h = Math.round(MAX * 1.5); }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function saveNovel() {
  const title = $('#fTitle').value.trim() || 'Untitled Novel';
  const url = $('#fUrl').value.trim();
  if (url) pendingCover = url;

  const chapters = Array.prototype.slice
    .call($('#chaptersWrap').querySelectorAll('.chapter-block'))
    .map(b => ({
      title: b.querySelector('.ch-title').value.trim() || 'Untitled Chapter',
      content: b.querySelector('.ch-content').value
    }));

  if (!chapters.length) chapters.push({ title: 'Chapter One', content: '' });

  if (editingNovelId) {
    const n = getNovel(editingNovelId);
    if (n) {
      n.title = title;
      n.cover = pendingCover;
      n.chapters = chapters;
    }
  } else {
    novels.unshift({
      id: uid(), title, cover: pendingCover,
      createdAt: Date.now(), chapters
    });
  }

  persist();
  renderLibrary();
  closeModal();
}

/* =====================================================================
   READER
   ===================================================================== */
/* =====================================================================
   READER — with pagination, book-flip, and position memory
   ===================================================================== */

function openReader(id) {
  const n = getNovel(id);
  if (!n || !n.chapters.length) return;
  currentNovelId = id;

  // Try to restore last position
  const saved = safeGet(KEY_POSITION, null);
  const hasSaved = saved && saved.novelId === id;

  if (hasSaved) {
    currentChapterIndex = Math.min(Math.max(0, saved.chapterIndex || 0), n.chapters.length - 1);
    currentPages = paginateChapter(n.chapters[currentChapterIndex].content);
    currentPageIndex = Math.min(Math.max(0, saved.pageIndex || 0), currentPages.length - 1);
  } else {
    currentChapterIndex = 0;
    currentPageIndex = 0;
    currentPages = paginateChapter(n.chapters[0].content);
  }

  $('#reader').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  renderPage();
  document.querySelector('.reader-scroll').scrollTo({ top: 0, behavior: 'instant' });
}

function closeReader() {
  savePosition();
  $('#reader').classList.add('hidden');
  document.body.style.overflow = '';
  currentNovelId = null;
}

function savePosition() {
  if (!currentNovelId) return;
  safeSet(KEY_POSITION, {
    novelId: currentNovelId,
    chapterIndex: currentChapterIndex,
    pageIndex: currentPageIndex
  });
}

function renderPage() {
  const n = getNovel(currentNovelId);
  if (!n) return;
  const ch = n.chapters[currentChapterIndex] || { title: '', content: '' };
  const isFirstPage = currentPageIndex === 0;

  // Cover + title only on the first page of the chapter
  const coverWrap  = document.getElementById('readerCoverWrap');
  const titleEl    = document.getElementById('readerTitle');
  const chapterEl  = document.getElementById('readerChapter');

  if (isFirstPage) {
    coverWrap.style.display  = '';
    titleEl.style.display    = '';
    chapterEl.style.display  = '';

    const coverEl = $('#readerCover');
    coverEl.innerHTML = n.cover
      ? '<img src="' + esc(n.cover) + '" alt="' + esc(n.title) + ' cover">'
      : '<div class="ph-cover" style="--h:' + hashStr(n.title) + ';width:100%;height:100%"><span>' + esc(initials(n.title)) + '</span></div>';

    titleEl.textContent   = n.title.toUpperCase();
    chapterEl.textContent = ch.title;
  } else {
    coverWrap.style.display  = 'none';
    titleEl.style.display    = 'none';
    chapterEl.style.display  = 'none';
  }

  $('#toolbarTitle').textContent = n.title;

  // Page content
  const pageContent = currentPages[currentPageIndex] || '';
  const contentEl = $('#readerContent');
  if (!pageContent.trim()) {
    contentEl.innerHTML = '<p style="text-align:center;opacity:.6;font-style:italic">This chapter is still empty.</p>';
  } else {
    contentEl.innerHTML = pageContent
      .split(/\n{2,}/)
      .map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; })
      .join('');
  }

  // Footer marker
  const isLastPage    = currentPageIndex === currentPages.length - 1;
  const isLastChapter = currentChapterIndex === n.chapters.length - 1;
  const footer = $('#pageFooter');
  if (isLastPage && isLastChapter) {
    footer.textContent = '— The End —';
    footer.className = 'page-footer end-of-chapter';
  } else if (isLastPage) {
    footer.textContent = '— End of Chapter —';
    footer.className = 'page-footer end-of-chapter';
  } else {
    footer.textContent = 'Continued on next page →';
    footer.className = 'page-footer';
  }

  // Page indicator
  // Continuous book-wide page indicator
const totalBookPages = n.chapters.reduce((total, chapter) => {
  return total + paginateChapter(chapter.content).length;
}, 0);

const previousChapterPages = n.chapters
  .slice(0, currentChapterIndex)
  .reduce((total, chapter) => {
    return total + paginateChapter(chapter.content).length;
  }, 0);

const bookPageNumber = previousChapterPages + currentPageIndex + 1;

$('#pageIndicator').textContent =
  'Page ' + bookPageNumber + ' of ' + totalBookPages;

  // Boundary disabling
  const atStart = currentChapterIndex === 0 && currentPageIndex === 0;
  const atEnd   = isLastChapter && isLastPage;
  $('#prevPage').disabled = atStart;
  $('#nextPage').disabled = atEnd;

  applyPrefs();
  savePosition();
}

async function turnPage(direction) {
  if (isTurning) return;
  const n = getNovel(currentNovelId);
  if (!n) return;

  const isLastPage    = currentPageIndex >= currentPages.length - 1;
  const isFirstPage   = currentPageIndex <= 0;
  const isLastChapter = currentChapterIndex >= n.chapters.length - 1;
  const isFirstChapter = currentChapterIndex <= 0;

  if (direction === 'next' && isLastPage && isLastChapter) return;
  if (direction === 'prev' && isFirstPage && isFirstChapter) return;

  isTurning = true;
  try {
    const article = $('#readerArticle');
    const outAngle = direction === 'next' ? -100 : 100;
    const inAngle  = direction === 'next' ?  100 : -100;

    document.querySelector('.reader-scroll').scrollTo({ top: 0, behavior: 'instant' });

    article.style.transition = 'transform .28s cubic-bezier(.4,0,1,1), opacity .28s ease-in';
    article.style.transform  = 'perspective(1800px) rotateY(' + outAngle + 'deg)';
    article.style.opacity    = '0';

    await wait(280);

    // Move position
    if (direction === 'next') {
      if (isLastPage) {
        currentChapterIndex++;
        currentPages = paginateChapter(n.chapters[currentChapterIndex].content);
        currentPageIndex = 0;
      } else {
        currentPageIndex++;
      }
    } else {
      if (isFirstPage) {
        currentChapterIndex--;
        currentPages = paginateChapter(n.chapters[currentChapterIndex].content);
        currentPageIndex = currentPages.length - 1;
      } else {
        currentPageIndex--;
      }
    }

    renderPage();

    // Flip in from opposite side
    article.style.transition = 'none';
    article.style.transform  = 'perspective(1800px) rotateY(' + inAngle + 'deg)';
    article.style.opacity    = '0';
    void article.offsetWidth;

    article.style.transition = 'transform .35s cubic-bezier(0,0,.2,1), opacity .35s ease-out';
    article.style.transform  = 'perspective(1800px) rotateY(0deg)';
    article.style.opacity    = '1';

    await wait(360);

    article.style.transition = '';
    article.style.transform  = '';
    article.style.opacity    = '';
  } finally {
    isTurning = false;
  }
}

function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

/* ------------------------- Pagination engine ------------------------- */
function paginateChapter(content) {
  const limit = CHARS_PER_PAGE;
  const paragraphs = (content || '').split(/\n{2,}/).map(function (p) { return p.trim(); }).filter(Boolean);
  const pages = [];
  let currentParts = [];
  let currentChars = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const addedChars = currentParts.length ? para.length + 2 : para.length;

    if (para.length > limit) {
      // Oversized paragraph — flush current page then split
      if (currentParts.length) {
        pages.push(currentParts.join('\n\n'));
        currentParts = [];
        currentChars = 0;
      }
      const chunks = splitLongParagraph(para, limit);
      for (let k = 0; k < chunks.length - 1; k++) pages.push(chunks[k]);
      const last = chunks[chunks.length - 1];
      currentParts = [last];
      currentChars = last.length;
    } else if (currentChars + addedChars > limit) {
      pages.push(currentParts.join('\n\n'));
      currentParts = [para];
      currentChars = para.length;
    } else {
      currentParts.push(para);
      currentChars += addedChars;
    }
  }

  if (currentParts.length) pages.push(currentParts.join('\n\n'));
  return pages.length ? pages : [''];
}

function splitLongParagraph(para, limit) {
  const chunks = [];
  let remaining = para;

  while (remaining.length > limit) {
    let breakAt = limit;
    const windowStart = Math.max(0, limit - 200);
    const windowStr = remaining.substring(windowStart, limit);

    const lastSentence = Math.max(
      windowStr.lastIndexOf('. '),
      windowStr.lastIndexOf('? '),
      windowStr.lastIndexOf('! ')
    );

    if (lastSentence > 50) {
      breakAt = windowStart + lastSentence + 2;
    } else {
      const lastSpace = windowStr.lastIndexOf(' ');
      if (lastSpace > 50) breakAt = windowStart + lastSpace + 1;
    }

    chunks.push(remaining.substring(0, breakAt).trim());
    remaining = remaining.substring(breakAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}


function renderChapter() {
  const n = getNovel(currentNovelId);
  if (!n) return;
  const ch = n.chapters[currentChapterIndex] || { title: '', content: '' };

  const coverEl = $('#readerCover');
  coverEl.innerHTML = n.cover
    ? '<img src="' + esc(n.cover) + '" alt="' + esc(n.title) + ' cover">'
    : '<div class="ph-cover" style="--h:' + hashStr(n.title) + ';width:100%;height:100%"><span>' + esc(initials(n.title)) + '</span></div>';

  $('#readerTitle').textContent = n.title.toUpperCase();
  $('#readerChapter').textContent = ch.title;
  $('#toolbarTitle').textContent = n.title;

  const content = (ch.content || '').trim();
  const contentEl = $('#readerContent');
  if (!content) {
    contentEl.innerHTML = '<p style="text-align:center;opacity:.6;font-style:italic">This chapter is still empty.</p>';
  } else {
    contentEl.innerHTML = content
      .split(/\n{2,}/)
      .map(p => '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>')
      .join('');
  }

  $('#prevChapter').disabled = currentChapterIndex === 0;
  $('#nextChapter').disabled = currentChapterIndex >= n.chapters.length - 1;
  $('#chapterIndicator').textContent = 'Chapter ' + (currentChapterIndex + 1) + ' of ' + n.chapters.length;

  var scroller = document.querySelector('.reader-scroll');
  if (scroller) scroller.scrollTop = 0;
  applyPrefs();
}

function gotoChapter(dir) {
  const n = getNovel(currentNovelId);
  if (!n) return;
  const next = currentChapterIndex + dir;
  if (next < 0 || next >= n.chapters.length) return;
  currentChapterIndex = next;
  renderChapter();
}

/* ------------------------- Reader preferences ------------------------- */
function loadPrefs() {
  const saved = safeGet(KEY_PREFS, null);
  if (saved && typeof saved === 'object') prefs = Object.assign({}, prefs, saved);
  const fs = $('#fontSelect');
  if (fs) fs.value = (prefs.font in FONT_MAP) ? prefs.font : 'georgia';
  $$('#swatches .swatch').forEach(s =>
    s.classList.toggle('active', s.dataset.theme === prefs.theme));
}

function savePrefs() { safeSet(KEY_PREFS, prefs); }

function applyPrefs() {
  const art = $('#readerArticle');
  if (!art) return;
  art.style.setProperty('--reader-font', FONT_MAP[prefs.font] || FONT_MAP.georgia);
  art.style.setProperty('--reader-size', prefs.size + 'px');
  art.style.setProperty('--reader-style', prefs.font === 'italic' ? 'italic' : 'normal');
  art.dataset.theme = prefs.theme;
  $$('#swatches .swatch').forEach(s =>
    s.classList.toggle('active', s.dataset.theme === prefs.theme));
}

/* =====================================================================
   EVENT BINDING
   ===================================================================== */
function bindEvents() {
  // NOTE: Login + eye toggle use inline handlers in index.html — no binding here.

  bindGridEvents();

  $('#themeToggle').addEventListener('click', toggleTheme);

  $('#logoutBtn').addEventListener('click', () => {
    if (confirm('Log out of Novel Vault?')) logout();
  });

  $('#closeModal').addEventListener('click', closeModal);
  $('#cancelModal').addEventListener('click', closeModal);
  $('#saveNovel').addEventListener('click', saveNovel);
  $('#addChapterBtn').addEventListener('click', () => {
    addChapterBlock('', '');
    const blocks = $('#chaptersWrap').querySelectorAll('.chapter-block');
    blocks[blocks.length - 1].querySelector('.ch-title').focus();
  });

  $('#modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
  });

  $('#fFile').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      pendingCover = await fileToCover(file);
      $('#fUrl').value = '';
      updateCoverPreview();
    } catch (err) {
      alert('That image could not be read. Please try another file.');
    }
  });

  $('#fUrl').addEventListener('input', (e) => {
    const v = e.target.value.trim();
    if (v) { pendingCover = v; updateCoverPreview(); }
  });

  $('#readerBack').addEventListener('click', closeReader);
$('#prevPage').addEventListener('click', () => turnPage('prev'));
$('#nextPage').addEventListener('click', () => turnPage('next'));
$('#pageZoneLeft').addEventListener('dblclick',  () => turnPage('prev'));
$('#pageZoneRight').addEventListener('dblclick', () => turnPage('next'));
// Touch swipe — only fires on a deliberate horizontal swipe,
// never on a vertical scroll
let touchStartX = 0;
let touchStartY = 0;
const articleEl = $('#readerArticle');
articleEl.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });
articleEl.addEventListener('touchend', (e) => {
  if (isTurning) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  // Real swipe = at least 80px horizontal, and horizontal dominates vertical
  const isHorizontalSwipe =
    Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5;
  if (isHorizontalSwipe) turnPage(dx > 0 ? 'prev' : 'next');
}, { passive: true });

  $('#fontSelect').addEventListener('change', (e) => {
    prefs.font = e.target.value;
    savePrefs(); applyPrefs();
  });

  $('#fontUp').addEventListener('click', () => {
    prefs.size = Math.min(34, prefs.size + 1);
    savePrefs(); applyPrefs();
  });
  $('#fontDown').addEventListener('click', () => {
    prefs.size = Math.max(13, prefs.size - 1);
    savePrefs(); applyPrefs();
  });

  $$('#swatches .swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      prefs.theme = sw.dataset.theme;
      savePrefs(); applyPrefs();
    });
  });
document.addEventListener('keydown', (e) => {
  const tag = (e.target.tagName || '').toLowerCase();
  const inFormField =
    tag === 'input' || tag === 'textarea' || tag === 'select' ||
    e.target.isContentEditable;
  if (inFormField) return;

  if (e.key === 'Escape') {
      if (!$('#modal').classList.contains('hidden')) closeModal();
      else if (!$('#reader').classList.contains('hidden')) closeReader();
    }
    if (!$('#reader').classList.contains('hidden')) {
  if (e.key === 'ArrowRight') turnPage('next');
  if (e.key === 'ArrowLeft')  turnPage('prev');
}
  });
}