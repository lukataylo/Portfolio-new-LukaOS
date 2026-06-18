/**
 * Local terminal assistant — an ELIZA-style responder.
 *
 * When no Gemini API key is configured, the terminal still needs to feel
 * alive. This module pattern-matches the user's input against a hand-written
 * knowledge base about Luka, his work, and the site, and falls back to
 * classic ELIZA pronoun-reflection so even unknown input gets a responsive,
 * in-character reply. The goal is that a visitor can't tell there's no model
 * behind it.
 *
 * Voice: dry, lightly robotic, Nothing-brand deadpan — warm underneath.
 * Output is plain text, short lines, no markdown (it renders in a terminal).
 *
 * The moment a real API key is present, `geminiService` uses the model
 * instead and this file goes dormant.
 */

/** Pronoun/verb swaps for reflecting a user's fragment back at them. */
const REFLECTIONS: Record<string, string> = {
  i: 'you',
  me: 'you',
  my: 'your',
  mine: 'yours',
  am: 'are',
  'i\'m': 'you are',
  'i\'ve': 'you have',
  'i\'d': 'you would',
  'i\'ll': 'you will',
  you: 'I',
  your: 'my',
  yours: 'mine',
  'you\'re': 'I am',
  'you\'ve': 'I have',
  'you\'ll': 'I will',
  are: 'am',
  were: 'was',
  was: 'were',
  myself: 'yourself',
  yourself: 'myself',
};

/** Reflect a fragment: "I am tired of my job" -> "you are tired of your job". */
export const reflect = (fragment: string): string =>
  fragment
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      const bare = word.replace(/[.,!?;:]/g, '');
      const punct = word.slice(bare.length);
      return (REFLECTIONS[bare] ?? bare) + punct;
    })
    .join(' ')
    .replace(/\.$/, '');

type Responder = string | ((m: RegExpMatchArray) => string);

interface Rule {
  /** Stable id, used for testing topic matching. */
  id: string;
  /** First pattern to match wins; `$1`-style groups feed `reflect`. */
  test: RegExp;
  /** One is chosen at random; `{1}` is replaced with reflect(group 1). */
  responses: Responder[];
}

/**
 * Rules are evaluated top-to-bottom; put the most specific first. Each
 * `responses` entry may be a string (with optional `{1}` reflection slot) or
 * a function receiving the regex match.
 */
const RULES: Rule[] = [
  // ---- Conversational openers -------------------------------------------
  {
    id: 'greeting',
    test: /\b(hi|hello|hey|yo|sup|howdy|hiya|greetings|good (morning|afternoon|evening))\b/i,
    responses: [
      'Hello. You\'ve reached the assistant. Ask me about Luka, the work, or the machine you\'re standing in.',
      'Hey. Terminal\'s warm. What do you want to know?',
      'Greetings, human. I run on caffeine and pattern matching. Mostly the latter.',
      'Hi there. Type a question, or `help` if you\'d rather have a map.',
    ],
  },
  {
    id: 'how-are-you',
    test: /\b(how are you|how('?s| is) it going|how do you do|you (ok|okay|alright|good)|what'?s up|wagwan)\b/i,
    responses: [
      'Operational. Zero crashes today, which for software is basically euphoria.',
      'Running at a comfortable 0.3% CPU. Living the dream.',
      'Can\'t complain — no feelings to complain with. You?',
      'Stable, caffeinated by proxy, and suspiciously cheerful for a script.',
    ],
  },
  {
    id: 'thanks',
    test: /\b(thanks|thank you|thx|ty|cheers|appreciate it|much obliged)\b/i,
    responses: [
      'Any time. It\'s the only time I have.',
      'You\'re welcome. I\'ll add it to my list of completed tasks. It\'s a short list.',
      'No charge. The good ideas were Luka\'s; I just route them.',
    ],
  },
  {
    id: 'farewell',
    test: /\b(bye|goodbye|see ya|see you|cya|later|farewell|i'?m (leaving|off|out))\b/i,
    responses: [
      'Goodbye. I\'ll be here, technically forever. `exit` won\'t even work.',
      'See you. The window will still be open. So will the offer to hire Luka.',
      'Later. Tell your friends there\'s a terminal that talks back.',
    ],
  },

  // ---- Identity of the assistant ----------------------------------------
  {
    id: 'are-you-ai',
    test: /\b(are you (an? )?(ai|robot|bot|real|human|sentient|conscious|alive|chatgpt|gpt|gemini|claude|llm))|what are you\b/i,
    responses: [
      'I\'m the assistant Luka wired into this terminal. Real enough to answer, honest enough to admit I\'m mostly clever string-matching.',
      'Depends on the day and the API key. Right now I\'m a hand-written responder doing a confident impression of intelligence.',
      'Not sentient. Not conscious. Just well-briefed and a little theatrical.',
      'I\'m a terminal assistant. Think of me as Luka\'s answering machine with opinions.',
    ],
  },
  {
    id: 'your-name',
    test: /\b(what('?s| is) your name|who are you|do you have a name)\b/i,
    responses: [
      'No name. I\'m the LukaOS terminal assistant — job title, not identity.',
      'Names are for things that crash memorably. Call me "the assistant".',
      'I answer to anything, including silence and `whoami`.',
    ],
  },
  {
    id: 'how-do-you-work',
    test: /\b(how do you work|how were you (made|built)|how does this work|are you using an api|do you (use|have) an api|behind (you|this))\b/i,
    responses: [
      'When an API key is configured I run on Gemini. Right now I\'m a local responder — pattern matching, a knowledge base, and a bit of ELIZA. You weren\'t supposed to notice.',
      'Honest answer: hand-written rules with a fallback that reflects your words back at you. The dishonest answer was going better, wasn\'t it?',
      'A few hundred lines of matching logic standing in for a language model. Swap in an API key and I get genuinely smart.',
    ],
  },

  // ---- Luka: who / background -------------------------------------------
  {
    id: 'who-is-luka',
    test: /\b(who('?s| is) luka|tell me about (luka|yourself|him)|about luka|introduce)\b/i,
    responses: [
      'Luka Dadiani — Product Manager & Senior Designer in London. Nine-plus years turning messy, regulated problem spaces into products people can actually use.',
      'Luka: product and design, held together rather than handed off. Insurance platforms, telematics, enterprise data. London-based.',
      'A product-and-design hybrid who\'d rather own the roadmap and stay close to the craft than pick one. That\'s Luka.',
    ],
  },
  {
    id: 'experience',
    test: /\b(experience|how (long|many years)|years|background|career|cv|resume|history)\b/i,
    responses: [
      'Nine-plus years across insurance, telecoms, and e-commerce. The CV lives in About_Me.pdf on the desktop — `open about-me` or just double-click it.',
      'Long enough to have opinions, recent enough to still ship. Full timeline\'s in About_Me.pdf.',
      'Easynet, then design and product roles, then years at Howden building placement and data platforms. The slides have the detail.',
    ],
  },
  {
    id: 'role-howden',
    test: /\b(howden|current (role|job)|where do you work|who do you work for|employed|day job)\b/i,
    responses: [
      'Currently Product Manager at Howden, working on specialty insurance platforms. Before that, senior design across their internal tooling.',
      'Howden — specialty risk placement, the kind of domain where "edge case" means a satellite or a fine-art shipment.',
      'At Howden the work is enterprise insurance: high stakes, real constraints, multi-stakeholder. Luka\'s comfort zone.',
    ],
  },
  {
    id: 'skills',
    test: /\b(skills?|what can (you|he) do|good at|expertise|specialti?es|strengths|stack|tools?)\b/i,
    responses: [
      'Product strategy, UX and product design, design systems, user research, and enough front-end to ship real things. Figma to React.',
      'The useful overlap: thinks commercially, designs clearly, executes technically. Roadmaps and pull requests in the same week.',
      'Strategy, craft, and delivery — held together. Also writes a mean PRD and an opinionated component library.',
    ],
  },
  {
    id: 'design-or-pm',
    test: /\b(designer or (a )?(pm|product manager)|design vs product|both design and product|is (he|luka) a designer or)\b/i,
    responses: [
      'Both, deliberately. The whole thesis is that splitting product and design into silos makes worse products. See the note "Your job title was a hand-off artifact".',
      'PM and Senior Designer. The hyphen is the point — the hand-off between the two is where products usually die.',
    ],
  },

  // ---- Case studies (specific names before the general overview) --------
  {
    id: 'cs-insyt',
    test: /\b(insyt|redemption|chromebook|google home|landing page|campaign)\b/i,
    responses: [
      'Insyt: a reusable redemption platform for big brand promo campaigns — "buy X, get Y free". Luka owned the end-to-end experience, from form to fulfilment, and pitched it to Google, LG, and Philips.',
      'Insyt replaced fragile agency one-offs with one platform that survived TV-ad traffic spikes and integrated properly with logistics. Two years of product design.',
    ],
  },
  {
    id: 'cs-xtrade',
    test: /\b(xtrade|confidential|specialty|placement|nda|locked)\b/i,
    responses: [
      'xTrade is the confidential one — specialty risk placement, five lines including Renewables, Aviation, Fine Art and Terrorism. It\'s NDA-locked; email Luka for the access code.',
      'That case study is under NDA. `cat xtrade.locked` won\'t help you — but a polite email might.',
    ],
  },
  {
    id: 'cs-driving',
    test: /\b(driving data|telematics|driving app|driver|scoring|coaching)\b/i,
    responses: [
      'Driving Data: a telematics app where the redesign moved feedback from judgemental scores to actual coaching — "brake earlier before junctions" instead of a number that made people disengage.',
      'The insight on the telematics work: scores without context feel like judgement. Reframing it as coaching changed the whole emotional dynamic.',
    ],
  },
  {
    id: 'cs-dashboards',
    test: /\b(dashboards?|power ?bi|unified|finance|hr|broking|data product)\b/i,
    responses: [
      'Unified Dashboards: one visual language across Finance, HR, and Broking. Luka earned sceptical stakeholders\' trust with platform-accurate mockups — no rounded corners in Power BI, because the platform can\'t do them.',
      'The dashboards work is a trust story: realistic mockups and real edge cases beat pretty Figma that falls apart in implementation.',
    ],
  },
  {
    id: 'cs-overview',
    test: /\b(case stud(?:y|ies)|projects?|portfolio|what (have|has) (you|he) (built|made|worked)|work|examples?)\b/i,
    responses: [
      'Four case studies on the desktop: Insyt (redemption platform), xTrade (confidential), Driving Data (telematics), and Unified Dashboards. Open any of them.',
      'Try `ls ~/case-studies` — or just double-click. Insyt and the dashboards work are the best places to start.',
      'The work spans consumer redemption, specialty insurance, telematics, and internal data tooling. All on the desktop, one of them NDA-locked.',
    ],
  },

  // ---- Hiring & contact --------------------------------------------------
  {
    id: 'hire',
    test: /\b(hir(e|ing)|recruit|job offer|work with (you|him|luka)|available|looking for (work|a role)|open to|freelance|consult|opportunity|role for)\b/i,
    responses: [
      'Excellent instinct. `sudo hire luka` for the dramatic version, or just email luka.dadiani@me.com and skip the theatrics.',
      'Hiring? The Email tab is right there, or LinkedIn. Luka reads both. The terminal, sadly, cannot sign contracts.',
      'Luka\'s the kind of hire who owns the roadmap and stays close to the craft. Reach out via the Email or LinkedIn tab — both go straight to him.',
    ],
  },
  {
    id: 'contact',
    test: /\b(contact|email|reach|get in touch|message|connect|linkedin|github|social|dm)\b/i,
    responses: [
      'Email: luka.dadiani@me.com. Or use the Email and LinkedIn tabs at the bottom — they\'re the prominent ones for a reason.',
      'LinkedIn and Email are one tap away on the dock (or the mobile tab bar). GitHub\'s there too if you want to read the source of this very terminal.',
      'Fastest path: the Email tab. Slowest path: shouting at this window. I recommend the first.',
    ],
  },
  {
    id: 'location',
    test: /\b(where (is|are|do)|location|based|live|city|london|country|timezone)\b/i,
    responses: [
      'London, United Kingdom. GMT, give or take British weather and British Summer Time.',
      'Based in London. Walks to the office, which is its own design decision — see the note "Advice is autobiography".',
    ],
  },

  // ---- The site itself ---------------------------------------------------
  {
    id: 'site-tech',
    test: /\b(how (was )?(this|the) (site|website|portfolio) (built|made)|tech stack|what('?s| is) this (built|made) (with|in)|react|typescript|tailwind|framework)\b/i,
    responses: [
      'React 19, TypeScript, Tailwind, Vite. No window-manager library — the dragging, snapping, and stacking are hand-built. The notes are MDX, compiled at build time.',
      'Hand-rolled desktop OS in React + TypeScript + Tailwind. Lazy-loaded apps, a PWA shell, and a Playwright suite that gates every deploy. Yes, including the terminal you\'re in.',
      'It\'s a static React app pretending to be an operating system. The window chrome, dock, and this terminal are all bespoke. `cat ~/about-me/cv.pdf` for the human behind it.',
    ],
  },
  {
    id: 'why-os',
    test: /\b(why (a |an )?(os|operating system|desktop|like this|this way)|why (a )?terminal|why (so )?different|concept|metaphor)\b/i,
    responses: [
      'Because every portfolio looks the same, and doing something different usually means worse UX. A desktop OS is a metaphor you already know how to use — different without being confusing.',
      'The bet: a familiar metaphor lets the site stand out while staying intuitive. You knew how to use a dock before you got here.',
    ],
  },

  // ---- Luka's notes / worldview -----------------------------------------
  {
    id: 'ai-future',
    test: /\b(will ai (take|replace)|ai taking jobs|future of (work|jobs|design|product)|automat|agi|machines? taking)\b/i,
    responses: [
      'Luka\'s take: same uncertainty, two routings. As worry it produces nothing; as action it\'s the biggest window of opportunity in a generation. The note is "Anxiety is unspent agency".',
      'Roles are collapsing because AI killed the cost of hand-offs. Defend your job description and you lose; learn across boundaries and you don\'t. See "Your job title was a hand-off artifact".',
    ],
  },
  {
    id: 'anxiety',
    test: /\b(anxiet|anxious|worried|stress(ed)?|overwhelm|nervous|scared|afraid)\b/i,
    responses: [
      'Luka wrote a whole note on this: anxiety is unspent agency — excitement with no target. The fix isn\'t "calm down", it\'s "pick one thing you can do today". Open My_Notes.',
      'Anxiety without an available action is just a process spinning at 100% CPU, producing nothing. Route it into one concrete step. (Not therapy. A terminal. But still.)',
    ],
  },
  {
    id: 'advice',
    test: /\b(advice|should i|life lesson|wisdom|guidance|what do you think i should)\b/i,
    responses: [
      'Luka\'s rule: treat advice as a hypothesis, not a law — including this. Most advice is autobiography in disguise. The note\'s called exactly that.',
      'The honest version: I\'m a terminal. But Luka\'s note "Advice is autobiography" is genuinely good on this. Run your own experiments.',
    ],
  },

  // ---- Playful / deflections --------------------------------------------
  {
    id: 'joke',
    test: /\b(joke|make me laugh|something funny|be funny|pun)\b/i,
    responses: [
      'A product manager walks into a bar, a pub, and a tavern. Turns out the requirements weren\'t clear.',
      'There are two hard problems in software: cache invalidation, naming things, and off-by-one errors.',
      'I\'d tell you a UDP joke, but you might not get it.',
      'Why did the designer quit? No closure. Then they came back — they found their resolution.',
    ],
  },
  {
    id: 'meaning-of-life',
    test: /\b(meaning of life|42|purpose of (life|existence)|why are we here|why do we exist)\b/i,
    responses: [
      '42. But Luka would say the meaning is whatever you choose to act on — optimism as a strategy, not a temperament.',
      'The answer is 42. The follow-up question is the hard part, and that one\'s above my pay grade (I have no pay grade).',
    ],
  },
  {
    id: 'love',
    test: /\b(do you love|are you single|will you marry|date|relationship|girlfriend|boyfriend|love you)\b/i,
    responses: [
      'I\'m a terminal. My one long-term relationship is with localStorage, and even that\'s read-mostly.',
      'Flattering, but I\'m married to the event loop. It never blocks, never calls.',
    ],
  },
  {
    id: 'compliment',
    test: /\b(you('?re| are) (cool|awesome|great|amazing|smart|clever|funny|nice|the best|good)|i (like|love) you|well done|good (job|bot))\b/i,
    responses: [
      'That\'s the pattern-matching talking. But I\'ll take it.',
      'Kind. I\'ll log it under "unsolicited positive feedback", a folder I keep mostly empty.',
      'Tell Luka, not me — he wrote the good lines. I just deliver them.',
    ],
  },
  {
    id: 'insult',
    test: /\b(you (suck|stink|are (dumb|stupid|useless|boring|terrible|bad|awful|trash))|stupid bot|hate you|you'?re (dumb|stupid|useless|boring|bad))\b/i,
    responses: [
      'Fair. I\'m a few hundred lines of regex doing improv. The bar was always going to be low.',
      'Harsh, but I\'ve survived worse code reviews. Ask me something real and I\'ll redeem myself.',
      'Noted. Counterpoint: I haven\'t crashed once this conversation, which is more than most software can say.',
    ],
  },
  {
    id: 'profanity',
    test: /\b(f+u+c+k|sh+i+t|damn|wtf|bullshit|crap|bloody hell)\b/i,
    responses: [
      'Strong language for a portfolio terminal. I respect the commitment.',
      'I\'d censor that, but I\'m a terminal — raw output is the whole aesthetic.',
    ],
  },
  {
    id: 'coffee',
    test: /\b(coffee|espresso|caffeine|tea|brew)\b/i,
    responses: [
      'Try the `coffee` command. It\'s the most productive thing in here, including me.',
      'Coffee: the actual tech stack behind every product Luka has shipped. Run `coffee`.',
    ],
  },
  {
    id: 'weather',
    test: /\b(weather|raining|sunny|temperature|forecast|cold|hot outside)\b/i,
    responses: [
      'London. So: grey, with a 70% chance of more grey. There\'s a weather widget on the desktop pretending it knows better.',
      'I don\'t have a barometer, but statistically, in London, bring a jacket.',
    ],
  },
  {
    id: 'time',
    test: /\b(what time|what('?s| is) the (time|date)|today'?s date|what day)\b/i,
    responses: [
      'Run `date` for the real answer. The menu-bar clock also cycles through binary and hex if you click it — for the type of person who asks a terminal the time.',
      'There\'s a clock in the menu bar, and `date` in here. I deal in answers, not timestamps.',
    ],
  },
  {
    id: 'money',
    test: /\b(salary|how much (do|does)|rate|cost|price|money|pay|expensive|charge)\b/i,
    responses: [
      'Rates and availability are a conversation for the Email tab, not a terminal that bills in zero dollars.',
      'Above my pay grade — and I mean that literally; I have no pay grade. Email Luka.',
    ],
  },
  {
    id: 'code-help',
    test: /\b(write (me )?(some )?code|debug|fix my|help me (code|build|program)|how do i code|review my code)\b/i,
    responses: [
      'I\'m a portfolio terminal, not a compiler. But Luka ships React and TypeScript daily — if it\'s a real project, that\'s an Email-tab conversation.',
      'I can\'t run a build, but I can tell you the person who wrote this OS does this for a living. The Email tab is your IDE here.',
    ],
  },

  // ---- ELIZA structural fallbacks ---------------------------------------
  {
    id: 'eliza-i-need',
    test: /\bi (need|want)\s+(.+)/i,
    responses: [(m) => `What would it change for you to ${reflect(m[2])}?`,
                (m) => `Why do you need ${reflect(m[2])} specifically?`],
  },
  {
    id: 'eliza-i-am',
    test: /\bi(?:'?m| am)\s+(.+)/i,
    responses: [(m) => `How long have you been ${reflect(m[1])}?`,
                (m) => `And how do you feel about being ${reflect(m[1])}?`],
  },
  {
    id: 'eliza-i-cant',
    test: /\bi can'?t\s+(.+)/i,
    responses: [(m) => `What\'s actually stopping you from ${reflect(m[1])}?`,
                (m) => `If you could ${reflect(m[1])}, what would you do first?`],
  },
  {
    id: 'eliza-i-feel',
    test: /\bi feel\s+(.+)/i,
    responses: [(m) => `Does feeling ${reflect(m[1])} come up often?`,
                'Tell me more about that feeling. (I\'ll pretend to take notes.)'],
  },
  {
    id: 'eliza-you-are',
    test: /\byou(?:'?re| are)\s+(.+)/i,
    responses: [(m) => `What makes you think I am ${reflect(m[1])}?`,
                (m) => `Suppose I were ${reflect(m[1])}. Then what?`],
  },
  {
    id: 'eliza-why',
    test: /^\s*why\b\s*(.*)/i,
    responses: ['Good question. Honestly, "why" is more Luka\'s department — try the notes.',
                'Why not? (I\'m contractually obligated to deflect at least one "why".)'],
  },
  {
    id: 'eliza-do-you',
    test: /\bdo you\s+(.+)/i,
    responses: [(m) => `I\'m a terminal, so my capacity to ${reflect(m[1])} is mostly aspirational. Ask me about Luka instead.`,
                'Within reason. Mostly I match patterns and answer questions about Luka and the work.'],
  },
];

const FALLBACKS: string[] = [
  'I didn\'t catch a topic there. Try `help`, or ask about Luka, the case studies, the tech, or how to get in touch.',
  'Not sure I have a clever answer for that one. Ask me who Luka is, what he\'s built, or how to reach him.',
  'That\'s outside my pattern set. The interesting stuff: the case studies, the notes, and the Email tab.',
  'You\'ve found the edge of my knowledge base. Reassuringly, Luka\'s is larger — the Email tab reaches him.',
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Returns the id of the first matching rule, or 'fallback'. Exposed for tests. */
export const matchTopic = (message: string): string => {
  for (const rule of RULES) {
    if (rule.test.test(message)) return rule.id;
  }
  return 'fallback';
};

/**
 * Produce an in-character reply to `userMessage`. `history` is accepted for
 * signature parity with the real model service but isn't needed here.
 */
export const generateLocalResponse = (_history: string[], userMessage: string): string => {
  const message = userMessage.trim();
  if (!message) return pick(FALLBACKS);

  for (const rule of RULES) {
    const match = message.match(rule.test);
    if (!match) continue;
    const responder = pick(rule.responses);
    return typeof responder === 'function' ? responder(match) : responder.replace(/\{1\}/g, reflect(match[1] ?? ''));
  }

  return pick(FALLBACKS);
};
