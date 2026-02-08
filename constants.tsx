import {
  FileText,
  Lock,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Cpu,
  Terminal,
  Camera,
  Music,
  Briefcase,
  StickyNote,
  Map as MapIcon,
  Mail,
  Library,
  Folder,
  Settings
} from 'lucide-react';
import { DesktopItem, FileType, BlogPost, Book } from './types';

export const INITIAL_WINDOW_WIDTH = 600;
export const INITIAL_WINDOW_HEIGHT = 500;

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'When Adults Were Wrong',
    excerpt: 'A reflection on projection, fear, and why inherited narratives often say more about the speaker than reality.',
    date: 'Feb 08, 2026',
    readTime: '7 min read',
    author: 'Luka Dadiani',
    tags: ['Reflection', 'Mindset', 'Life'],
    image: 'https://picsum.photos/800/400?random=10',
    content: `
      <p>I grew up hearing a lot of confident advice from adults. A lot of it sounded wise. Some of it was useful. Some of it was just fear dressed up as certainty.</p>

      <p>As I have got older, one pattern keeps coming back: many warnings I received were less about reality and more about other people’s unresolved anxiety.</p>

      <h3>“You won’t like the big city. People are cold. You’ll struggle to make friends.”</h3>
      <p>I heard this one a lot. The city was framed as anonymous and distant — a place where connection is impossible unless you are lucky. My actual experience has been the opposite.</p>

      <p>Yes, people are busy. Yes, nobody is waiting at your door with friendship. But if you invest effort — book clubs, events, saying yes to invitations, following up — people are open.</p>

      <p>The city did not fail me. Passive expectations did.</p>

      <h3>“It is hard to make it.”</h3>
      <p>This one is technically true in the way all vague statements are true. Life is expensive. Trade-offs are real. But the sentence is often used as a full stop, not a description.</p>

      <p>I was able to buy a home in the centre and walk to the office every day. Not because I found a secret shortcut — because I made explicit sacrifices, especially on space, and optimised around what actually improved my life.</p>

      <p>I chose proximity over square footage. Time over ego. Daily quality of life over abstract status.</p>

      <h3>“You’ll miss your country. You’ll regret not studying Georgian grammar.”</h3>
      <p>I heard this with total confidence. It turned out to be false. I do not miss the country, and I do not regret not memorising grammar rules that had no meaningful use in my life.</p>

      <p>This is where identity pressure gets disguised as prediction. People project a moral story onto your choices — loyalty, roots, tradition, what a “good person” should value.</p>

      <h3>“You’ll miss being a kid.”</h3>
      <p>This is usually presented as universal truth. I do not buy it.</p>

      <p>I think many adults who say this are describing their own unresolved trade-offs: anxiety, responsibility overload, and emotional fatigue. That is real. But it is not the same as childhood being objectively better.</p>

      <p>For me, adulthood is better. More complexity, yes — but also more agency, more choice, and more self-respect.</p>

      <h3>What I think is really going on</h3>
      <p>Most of these “truths” came from the same causes: projection, defensive pessimism, identity preservation, and unprocessed regret.</p>

      <p>Advice is often autobiography in disguise.</p>

      <h3>What I have learned</h3>
      <p>I still listen to older people, but now I filter. Is this observation or projection? Is this caution or fear? Is this my path, or their story?</p>

      <p>Most advice is useful as data, not as law. The biggest shift in my life came when I stopped treating inherited narratives as truth and started treating them as hypotheses.</p>

      <p>Some were right. Many were not. The only way to know was to run the experiment myself.</p>
    `
  },
  {
    id: 'post-2',
    title: 'A Note on Agency and Anxiety',
    excerpt: 'Why anxiety is often misdirected energy — and how turning it into action creates better outcomes.',
    date: 'Feb 08, 2026',
    readTime: '5 min read',
    author: 'Luka Dadiani',
    tags: ['Mindset', 'Agency', 'AI'],
    content: `
      <p>As I have grown older, I have found anxiety to be a fairly pointless emotion.</p>

      <p>We inherited it from our ancestors scanning the bushes for danger. That system had a purpose. But in modern life, most anxiety is not helping us survive — it is just looping without producing action.</p>

      <p>If you do clear planning and resolve identity questions ahead of time, there is usually much less to worry about than it first appears.</p>

      <h3>From anxiety to action</h3>
      <p>I have found it easier to transform anxiety into action. A useful reframe is this: anxiety is often excitement with no direction. Give it direction.</p>

      <p>Ask: what is one concrete thing I can do today?</p>

      <h3>The AI example</h3>
      <p>A recent example is the anxiety around AI jobs and the future. Many people worry about what AI will do to designers and developers.</p>

      <p>I see this differently. Instead of worrying, I treat it as an opportunity — to build, to start something, to create real value, and potentially to become far more economically independent than before.</p>

      <p>More importantly, moments of change are exactly when you can shape the world for the better. Disruption is not only a threat; it is also a window.</p>

      <h3>Control what you can</h3>
      <p>I try not to worry about things I cannot control. I focus on what I can influence: my skills, my decisions, my output, my standards, and the people I choose to work with.</p>

      <p>Optimism, to me, is not blind positivity. It is a strategic choice to act where action is possible.</p>

      <p>When change arrives, I would rather move than freeze.</p>
    `
  },
  {
    id: 'post-3',
    title: 'Building a Web-Based OS',
    excerpt: 'A technical deep dive into z-indexing, drag physics, and window management in the browser.',
    date: 'Nov 15, 2024',
    readTime: '12 min read',
    author: 'Senior Engineer',
    tags: ['Case Study', 'Tutorial', 'Technical'],
    image: 'https://picsum.photos/800/400?random=12',
    content: `
      <p>Creating a desktop environment in the browser is the ultimate test of DOM manipulation and state management. The browser was designed to display documents, not to manage stacking contexts of overlapping, draggable windows.</p>
      
      <h3>The Z-Index War</h3>
      <p>The hardest part isn't dragging (thanks to HTML5 Drag API or simple mouse events); it's determining what is "on top." You can't just increment z-index forever. You need a centralized window manager that tracks an \`activeWindowId\` and re-calculates the stack order whenever a window is focused.</p>
      
      <h3>Performance</h3>
      <p>Rendering live blur effects (\`backdrop-filter\`) behind multiple moving windows can crush the GPU. For this project, I opted for simple opacity and border tricks to maintain 60fps even on mobile devices. The "Nothing" aesthetic helps here—dots and lines are cheap to render.</p>
    `
  }
];

const BOOKS: Book[] = [
  {
    id: 'zero-to-one',
    title: 'Zero to One',
    author: 'Peter Thiel',
    category: 'Business & Startups',
    rating: 9,
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1414347376i/18050143.jpg',
    amazonUrl: 'https://www.amazon.co.uk/Zero-One-Notes-Start-Future/dp/0753555204',
    review: `A masterclass in contrarian thinking. Thiel challenges the conventional wisdom that competition is good and instead argues that the best businesses are monopolies that create something entirely new.

The book's central thesis—that we should aim to go from zero to one (creating something new) rather than from one to n (copying what works)—has fundamentally shaped how I think about product strategy and innovation.

Essential reading for anyone in tech or entrepreneurship. The chapters on secrets and definite optimism are particularly thought-provoking.`
  },
  {
    id: 'how-big-things-get-done',
    title: 'How Big Things Get Done',
    author: 'Bent Flyvbjerg & Dan Gardner',
    category: 'Project Management',
    rating: 8,
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1666573028i/61327449.jpg',
    amazonUrl: 'https://www.amazon.co.uk/How-Big-Things-Get-Done/dp/1529091578',
    review: `A fascinating deep-dive into why megaprojects fail and what we can learn from the rare ones that succeed. Flyvbjerg's research on "reference class forecasting" and the planning fallacy is incredibly applicable to product development.

The key insight: think slow, act fast. Spend more time in planning and design before committing resources, then execute quickly. The Pixar and Frank Gehry case studies are excellent.

Changed how I approach project estimation and risk assessment.`
  },
  {
    id: 'boom',
    title: 'Boom',
    author: 'Byrne Hobart & Tobias Huber',
    category: 'Economics & Technology',
    rating: 8,
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1725379098i/212374671.jpg',
    amazonUrl: 'https://www.amazon.co.uk/Boom-Bubbles-Future-Byrne-Hobart/dp/1954118082',
    review: `A contrarian take on financial bubbles—arguing they're not just destructive but can be productive forces that fund transformative technologies. The thesis that bubbles help concentrate capital and talent in emerging sectors is compelling.

The historical analysis of railway manias, dot-com, and clean energy bubbles provides useful frameworks for understanding current market dynamics.

Particularly relevant for anyone working in or investing in emerging tech sectors.`
  },
  {
    id: 'stubborn-attachments',
    title: 'Stubborn Attachments',
    author: 'Tyler Cowen',
    category: 'Philosophy & Economics',
    rating: 7,
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1529514049i/31283667.jpg',
    amazonUrl: 'https://www.amazon.co.uk/Stubborn-Attachments-Prosperous-Responsible-Individuals/dp/1732265135',
    review: `Cowen makes a philosophical case for prioritising sustainable economic growth above almost everything else. His argument that growth compounds over generations and benefits future people is logically tight.

The book is dense but short—it packs big ideas into a compact format. The concept of "Wealth Plus" (GDP plus environmental and other considerations) is a useful mental model.

A thought-provoking read, even if you don't fully agree with the conclusions.`
  },
  {
    id: 'vietnam-war',
    title: 'Vietnam: An Epic Tragedy',
    author: 'Max Hastings',
    category: 'History',
    rating: 9,
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1532552019i/35154379.jpg',
    amazonUrl: 'https://www.amazon.co.uk/Vietnam-Epic-Tragedy-1945-1975/dp/0008133018',
    review: `An absolutely monumental work of history. Hastings draws on sources from all sides—American, Vietnamese, French—to paint a comprehensive picture of the war's tragedy and folly.

What sets this apart from other Vietnam histories is the human detail. The individual stories of soldiers, civilians, and leaders on all sides make the statistics feel real.

A masterpiece of military history. Long but never dull. Essential for understanding modern geopolitics and the limits of military power.`
  },
  {
    id: 'price-of-time',
    title: 'The Price of Time',
    author: 'Edward Chancellor',
    category: 'Finance & Economics',
    rating: 8,
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657029432i/61428626.jpg',
    amazonUrl: 'https://www.amazon.co.uk/Price-Time-Real-Story-Interest/dp/0241569990',
    review: `A sweeping history of interest rates and their role in economic development. Chancellor argues convincingly that artificially low interest rates cause asset bubbles, inequality, and economic stagnation.

The historical perspective—from ancient Mesopotamia through to today's central banking—is fascinating. The book helps explain many of the economic phenomena we've seen in the past two decades.

Dense but rewarding. Essential reading for understanding monetary policy's real-world effects.`
  },
  {
    id: 'meet-me-fountain',
    title: 'Meet Me by the Fountain',
    author: 'Alexandra Lange',
    category: 'Architecture & Design',
    rating: 7,
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1642092447i/58950012.jpg',
    amazonUrl: 'https://www.amazon.co.uk/Meet-Me-Fountain-Inside-Shopping/dp/1526614847',
    review: `A love letter to the shopping mall as an architectural and social phenomenon. Lange traces the mall's evolution from Victor Gruen's utopian visions to today's struggling retail spaces.

The book reframes malls not just as places of consumption but as important public spaces—particularly for teenagers, the elderly, and those without access to traditional civic spaces.

Thought-provoking for anyone interested in urban design, retail, or how physical spaces shape human behaviour.`
  },
  {
    id: 'bandit-capitalism',
    title: 'Bandit Capitalism',
    author: 'Bob Wylie',
    category: 'Business & Finance',
    rating: 7,
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1594716970i/54503557.jpg',
    amazonUrl: 'https://www.amazon.co.uk/Bandit-Capitalism-Carillion-British-Business/dp/1785904906',
    review: `A forensic examination of the Carillion collapse and what it reveals about modern British capitalism. Wylie traces how outsourcing, complex financial engineering, and regulatory capture led to one of the UK's biggest corporate disasters.

The book is particularly good on the human cost—the workers, pensioners, and suppliers left holding the bag while executives walked away.

Essential reading for understanding public-private partnerships and the risks of outsourcing public services.`
  },
  {
    id: 'about-face',
    title: 'About Face',
    author: 'David H. Hackworth',
    category: 'Military & Memoir',
    rating: 8,
    cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320531044i/180809.jpg',
    amazonUrl: 'https://www.amazon.co.uk/About-Face-David-H-Hackworth/dp/0671695347',
    review: `One of the most decorated soldiers in US history tells his story—from Korea through Vietnam. Hackworth's critique of military bureaucracy and careerism is scathing and still relevant.

The battlefield descriptions are vivid and often harrowing. But it's his analysis of what makes units effective (small unit leadership, realistic training, soldier welfare) that's most valuable.

A masterclass in leadership, even if you're not in the military. The lessons about institutional dysfunction apply to any large organisation.`
  }
];

export const DESKTOP_ITEMS: DesktopItem[] = [
  {
    id: 'sitemap',
    title: 'Site_Map.xml',
    icon: MapIcon,
    type: FileType.SITEMAP,
    seoDescription: 'Complete HTML sitemap of the portfolio for crawlers and quick navigation.',
    slug: 'sitemap'
  },
  {
    id: 'blog',
    title: 'Notes',
    icon: StickyNote,
    type: FileType.BLOG,
    blogPosts: BLOG_POSTS,
    seoDescription: 'Technical writings on React, Design Systems, and Product Strategy.',
    slug: 'notes'
  },
  {
    id: 'books',
    title: 'Library',
    icon: Library,
    type: FileType.BOOKS,
    books: BOOKS,
    seoDescription: 'Book reviews and recommendations on business, economics, history, and design.',
    slug: 'library'
  },
  {
    id: 'about-me',
    title: 'About_Me.pdf',
    icon: Briefcase,
    type: FileType.PRESENTATION,
    seoDescription: 'CV and Resume of Luka Dadiani - Product and design leadership at the intersection of strategy, craft, and complex domains.',
    slug: 'about',
    content: [
      {
        title: 'Luka Dadiani',
        body: 'Product Manager / Senior Product Designer\nLondon, United Kingdom\n\nI\'m a product and design leader who operates at the intersection of strategy, craft, and complex domains.\n\nOver seven years at Howden, I\'ve led product and design work across enterprise platforms, consumer products, mobile apps, and global internal tools—always in environments where the problem space is messy, regulated, or multi-stakeholder.'
      },
      {
        title: 'I\'m Most Effective When...',
        body: '• The domain is complex and requires deep understanding to get right\n\n• Product and design need to be held together, not handed off between silos\n\n• Outcomes matter more than artifacts\n\n• Teams need someone who can own the roadmap and stay close to the craft'
      },
      {
        title: 'What Runs Through My Work',
        body: 'Systems thinking:\nI look for the constraint limiting the whole system, not just the screen in front of me\n\nStrategic pragmatism:\nThe best feature is sometimes the one you don\'t build\n\nClarity as leadership:\nI create space for teams to execute by ensuring goals and learnings are understood by everyone\n\nCraft that ships:\nI design within real constraints—platform limitations, engineering trade-offs, business realities'
      },
      {
        title: 'Key Skills',
        body: '• Product Management & Strategy\n• Product design & UX strategy (B2B and B2C)\n• Mobile and responsive UI design\n• Design systems and component libraries\n• User research: interviews, workshops, usability testing\n• Data-informed design (qualitative and quantitative)\n• Stakeholder facilitation & cross‑functional collaboration\n• Agile delivery with distributed teams'
      },
      {
        title: 'xTrade (Howden Group)',
        body: 'Product Manager\nNov 2021 – Present\n\n• Managed a specialty risk placement platform, successfully delivering 5 key specialty lines including Renewables, Aviation, Fine Art, and Terrorism.\n• Led and managed a cross-functional development team of 15-20 engineers, running standups, sprint planning, and backlog refinement.\n• Authored detailed, research-backed technical tickets and requirements to ensure precision in delivery.\n• Created and executed the product roadmap, liaising directly with senior stakeholders to align on strategic business goals.\n• Conducted continuous UX research to validate features and improve product-market fit.'
      },
      {
        title: 'Hyperion X',
        body: 'Senior UX Designer\nSep 2018 – May 2022\n\n• Designed end‑to‑end experiences for multiple B2B and B2C products.\n• Partnered with product managers, engineers and marketers from discovery to delivery.\n• Created a new design system to unify UX and visual language.\n• Led workshops and validation activities to support internal startup initiatives.'
      },
      {
        title: 'Interoute',
        body: 'Digital Designer (UX/UI)\nJan 2016 – Aug 2018\n\n• Designed high‑conversion marketing and product websites.\n• Managed external development agency for campaign sites.\n• Produced interactive prototypes (Sketch, InVision, code).\n• Redesigned the company intranet improving information architecture.'
      },
      {
        title: 'Easynet',
        body: 'Senior Designer\nFeb 2015 – Jan 2016\n\n• Led creative design within the marketing team.\n• Redefined the internal intranet experience through stakeholder research.\n• Partnered with global stakeholders to deliver integrated product campaigns.\n• Managed external developers for accurate implementation.'
      },
      {
        title: 'PawPost',
        body: 'CTO & Co‑Founder\nMar 2014 – Jan 2015\n\n• Co‑founded a pet‑focused subscription box startup.\n• Conducted market research, user interviews and focus groups.\n• Designed packaging and end‑to‑end customer journeys.\n• Ran user testing and led a pivot to influencer‑driven marketing strategy.'
      },
      {
        title: 'Education',
        body: 'BBA Management\nUniversity of Lancaster (2010 – 2014)\n\nA‑levels & GCSEs\nGateacre Community Comprehensive (2007 – 2010)\nICT (A*), General Studies (A*), Business Studies (A), Extended Project (A), History (B).'
      }
    ]
  },
  {
    id: 'case-study-insyt',
    title: 'Insyt — Redemption Platform',
    icon: FileText,
    type: FileType.PRESENTATION,
    seoDescription: 'Case study: Building a scalable redemption platform for Google, LG, Philips, and Samsung.',
    slug: 'case-study/insyt',
    content: [
      {
        title: 'Insyt — Redemption Platform',
        body: 'Building a Scalable Redemption Platform for Global Brands\n\nRole: Lead Product Designer (UX, Service Design, Client-Facing Sales)\nTeam: 2 designers (1 hired by me), plus cross-functional delivery team\nDuration: 2 years\n\nClients: Google, LG, Philips, Samsung'
      },
      {
        title: 'The Strategic Problem',
        body: 'Promotional campaigns like "Buy a Chromebook, get a Google Home free" are a significant marketing investment for global brands. But the digital infrastructure behind these campaigns was typically an afterthought.\n\nLanding pages were agency-built one-offs: inconsistent quality, poor accessibility, fragile under load, and disconnected from fulfilment. Support teams drowned in "Where is my item?" tickets.\n\nThe opportunity was to build a single platform that could:\n• Deliver a best-in-class redemption experience across brands\n• Handle high-traffic spikes from TV and print advertising\n• Integrate properly with logistics partners\n• Reduce operational overhead and support costs\n• Be reusable across multiple clients'
      },
      {
        title: 'My Role',
        body: 'I led product design for Insyt over two years, with responsibilities spanning UX, service design, and client-facing work:\n\n• Owned the end-to-end redemption experience from form design through fulfilment and support\n\n• Managed two designers—one already on the team, one contractor I hired—across the component system and campaign UIs\n\n• Led service design across logistics partners, mapping delivery flows and failure modes\n\n• Drove copy and accessibility standards, including recommending we hire a part-time copywriter\n\n• Presented in sales pitches to Google, LG, and Philips, demoing the platform and explaining our UX testing methodology'
      },
      {
        title: 'Decision 1: The 60-Package Audit',
        body: 'Redemption doesn\'t end with a "Thank you" screen. The experience customers remember is receiving—or not receiving—their item. Most teams treat logistics as someone else\'s problem. I insisted we make it ours.\n\nI ordered just under 60 packages to different destinations across the UK—cities, suburbs, rural areas—using different delivery partners. I documented everything: delivery times, package condition, notification accuracy, failure modes.\n\nThe findings were decisive. Hermes (now Evri) performed significantly worse outside urban areas. Based on this research, we chose DPD as our primary partner.\n\nThis wasn\'t glamorous work, but it shaped the entire downstream experience.'
      },
      {
        title: 'Decision 2: Conversational Data Capture',
        body: 'Our users weren\'t always tech-savvy. Many came from TV and newspaper ads—an older demographic, often on mobile, redeeming a promotion for the first time.\n\nTraditional long forms would have killed conversion. Instead, I designed a question-by-question flow:\n\n• Large, mobile-friendly inputs\n• Conversational tone ("Let\'s start with your purchase details…")\n• Clear progress indication\n• A summary screen before final submission\n\nThis format reduced abandonment significantly, particularly on mobile. The pattern became a reusable template across all campaigns.'
      },
      {
        title: 'Decision 3: Pushing Back on Google',
        body: 'Google\'s team initially pushed for Material Design inputs throughout their campaigns—their components, their styling.\n\nI pushed back. Our inputs had been rigorously tested across demographics and devices. They met WCAG accessibility standards. They\'d been optimised for the specific context of promotional redemption.\n\nI walked their team through our testing methodology, showed the rationale behind each component decision, and demonstrated how we could achieve brand consistency without sacrificing usability. They accepted the approach.\n\nThis wasn\'t about winning an argument—it was about ensuring the end user got the best experience.'
      },
      {
        title: 'Decision 4: Copy Standards & Accessibility',
        body: 'As campaigns multiplied, inconsistency crept in. Different writers, different tones, different levels of clarity around promotional terms. This created confused users and compliance risk.\n\nI pushed for two changes:\n\nA copy style guide that standardised tone, terminology, and how promotional terms were communicated.\n\nA part-time copywriter to own the words across campaigns. I made the business case based on iteration cycles—we were burning time on stakeholder feedback rounds that a dedicated writer could prevent.\n\nThe result: iteration cycles roughly halved, saving about a week per campaign. Copy quality became consistent and compliant by default.\n\nOn accessibility, I ensured all form components met WCAG standards and led testing across assistive technologies.'
      },
      {
        title: 'Component Library & Multi-Brand Architecture',
        body: 'To serve Google, LG, Philips, and Samsung from a single platform, we built a component library that supported:\n\n• Co-branding and theming per client\n\n• Shared interaction patterns across campaigns\n\n• Rapid setup for new promotions without rebuilding\n\nThis turned Insyt from a project into a product—reusable infrastructure rather than bespoke builds.'
      },
      {
        title: 'Outcomes',
        body: 'Campaign reach: Millions of users across UK and Europe\n\nPeak traffic: 4–5k daily users during TV/print campaigns\n\nClient NPS: Mid-60s (significantly above typical promotional experiences)\n\nClients won: Google, LG, Philips (pitched and won during my tenure)\n\nIteration time saved: ~1 week per campaign (via copy standards)'
      },
      {
        title: 'What I Learned',
        body: 'The real experience extends far beyond the UI.\nRedemption spans web, logistics, email, SMS, and support. Designing only the form would have been solving 30% of the problem.\n\nDefending UX decisions is part of the job.\nBeing able to present testing rationale and stand behind your methodology—while remaining collaborative—is essential at this level.\n\nInvesting in content quality pays back fast.\nThe copywriter recommendation felt like a small intervention. It turned out to be high-leverage.\n\nClient-facing design work sharpens your craft.\nPresenting in sales pitches forced me to articulate why our approach worked, not just what we built.'
      }
    ]
  },
  {
    id: 'case-study-xtrade',
    title: 'xTrade (Confidential)',
    icon: Lock,
    type: FileType.PROTECTED,
    password: 'Socrates14',
    seoDescription: 'Case study: Consolidating legacy systems into a scalable placement platform at Howden.',
    slug: 'case-study/xtrade',
    lockedContent: [
      {
        title: 'xTrade — Scalable Placement Platform',
        body: 'Consolidating Legacy Systems into a Scalable Placement Platform\n\nRole: Lead Product Designer → Product Owner / Product Manager\nTeam: 17-person cross-functional team (4 front-end, 8 back-end, 1 DevOps, 3 QA, 1 lead + config specialists)\n\nImpact:\n• £1.5–2M annual savings\n• ~£200M GWP processed\n• ~1,000 enterprise users'
      },
      {
        title: 'The Strategic Problem',
        body: 'I\'d spent seven years in Howden\'s internal design team, designing several of the 1.0 placement platforms. Each product line—Aviation, Renewables, Cargo, Fine Art—had its own application, its own dev team, and its own way of capturing risk data.\n\nThis created compounding problems:\n• High operational cost: Multiple tech stacks meant duplicated maintenance and effort\n• Slow speed to market: Launching new products meant building from scratch\n• Data fragmentation: Inconsistent data capture made analytics unreliable\n• Poor user experience: Brokers had to learn different interfaces for different products'
      },
      {
        title: 'My Role',
        body: 'I joined as Lead Product Designer and evolved into Product Owner/Product Manager—a transition that happened because the problems required someone who could hold both the user experience and the delivery reality in the same frame.\n\nIn practice, this meant:\n• Owning the product roadmap and making prioritisation calls\n• Leading a 17-person delivery team through standups, sprint planning, and cross-functional coordination\n• Running weekly research sessions with brokers and underwriters\n• Managing a £1.5M annual budget and making build/buy/defer decisions\n• Partnering with North (the agency behind Tate Modern and Co-op identities) to establish Howden\'s digital design language'
      },
      {
        title: 'Decision 1: The Outlook Mental Model',
        body: 'Enterprise software often fails because it asks users to abandon mental models they\'ve spent years developing. From early user interviews, one thing was obvious: brokers live in Outlook.\n\nRather than imposing a novel UI paradigm, I leaned into what users already knew:\n• A pane-based layout mirroring Outlook\'s list-plus-detail pattern\n• Clear visual hierarchy for submissions, placements, and market responses\n• Interaction patterns that felt immediately familiar\n\nWe tested this with groups of up to 10 brokers. The result: near-zero onboarding friction. Users understood how to navigate within minutes, not days.'
      },
      {
        title: 'Decision 2: Product Configuration Tool',
        body: 'As we onboarded more product lines, a bottleneck emerged. Product configuration was being done by hand in JSON—early configs were a few hundred lines, but they ballooned to thousands with field IDs reused across multiple subsystems.\n\nI identified this as the critical constraint on our ability to scale. Rather than asking for a dedicated engineering initiative, I prototyped a configuration tool myself.\n\nWhat the tool did:\n• Automated ID generation and mapping relationships across subsystems\n• Visually exposed product logic hidden in raw JSON\n• Validated configurations before deployment\n• Made the structure legible to non-engineers\n\nThe impact: Configuration timelines dropped by ~1 month per product. We\'ve since launched 5 additional products using the tool.'
      },
      {
        title: 'Decision 3: Export Over Dashboard',
        body: 'Midway through the platform build, stakeholders requested a dashboard—charts, KPIs, visual reporting. I pushed back.\n\nHaving led Howden\'s internal dashboard unification effort, I understood how dashboards actually get used. In most cases, users exported data to Excel, rebuilt the views they needed, and circulated spreadsheets.\n\nInstead, I proposed investing in a robust export feature:\n• Clean column selection and filtering\n• Consistent data formatting aligned with Excel workflows\n• Reliable, fast performance on large datasets\n\nThe result met user needs at a fraction of the cost, and scaled automatically as we added new products. No dashboard redesign required.\n\nThis reflects a principle I return to often: understand the real workflow before optimising the interface.'
      },
      {
        title: 'Design System & Brand Alignment',
        body: 'With 2.5 designers on the team, I led the creation of a design system that:\n\n• Standardised components across the platform (tables, forms, pricing panels, filters)\n\n• Defined typography, spacing, and interaction patterns for consistency and accessibility\n\n• Aligned with Howden\'s new brand direction developed in partnership with North\n\nThis system has since been adopted across other Howden applications, multiplying the initial investment well beyond xTrade.'
      },
      {
        title: 'Outcomes',
        body: 'Annual cost savings: £1.5–2M (legacy system consolidation)\n\nGross written premium: ~£200M processed annually\n\nEnterprise users: ~1,000 (including AXA, Aviva, Convex, Chubb, Hiscox)\n\nProducts launched: 5 additional lines via the configuration tool\n\nTime saved per stakeholder: ~10 hours/week (structured MRC v3 data capture)'
      },
      {
        title: 'What I Learned',
        body: 'Familiarity beats novelty in high-stakes workflows.\nWhen users are processing complex, high-value transactions, reducing cognitive load matters more than visual innovation.\n\nFixing invisible bottlenecks creates disproportionate leverage.\nThe product configuration problem wasn\'t glamorous, but it was the constraint preventing us from scaling.\n\nThe best feature is sometimes the one you don\'t build.\nPushing back on the dashboard request required confidence in my understanding of user workflows.\n\nHolding design and delivery together maintains quality at speed.\nBeing both design lead and product owner meant I could protect UX quality while staying close to engineering trade-offs.'
      }
    ]
  },
  {
    id: 'case-study-driving-data',
    title: 'Driving Data — Telematics App',
    icon: FileText,
    type: FileType.PRESENTATION,
    seoDescription: 'Case study: Re-platforming a telematics mobile app for ANWB and white-label scale.',
    slug: 'case-study/driving-data',
    content: [
      {
        title: 'Driving Data — Telematics App',
        body: 'Re-platforming a Telematics App for Scale\n\nRole: Lead Product Designer (Mobile UX, Behavioural Design, White-Label Strategy)\nTeam: 0.5 designer supporting, remote dev team (Scotland), project team (Netherlands)\nDuration: 1 year\n\nClient: ANWB (Dutch insurer), later white-labelled for Howden and other prospects'
      },
      {
        title: 'The Strategic Problem',
        body: 'Telematics apps let drivers reduce their insurance premiums by driving more safely. When Howden acquired the telematics company behind Driving Data, the existing app had problems:\n\n• Complex, cluttered UX that was difficult to navigate\n• Clunky onboarding with permission requests that confused users and killed activation\n• Feedback that felt judgmental, not helpful—users disengaged rather than improved\n• No white-label capability—the team\'s plan was to build separate UIs for each new insurer client\n\nThat last point was the strategic blocker. Building a new app for every client wasn\'t scalable.'
      },
      {
        title: 'My Role',
        body: 'I led the re-platforming and UX redesign as the sole lead designer, with a design systems specialist supporting half-time. The work spanned:\n\n• User interviews with drivers to understand attitudes toward monitoring, feedback, and privacy\n\n• Redesigning onboarding, permissions, trip scoring, and feedback flows\n\n• Running A/B tests on permission copy and onboarding sequences\n\n• Defining the white-label architecture—my proposal, against initial resistance\n\n• Coordinating across three geographies: dev team in Scotland, project team and stakeholders in the Netherlands'
      },
      {
        title: 'Decision 1: White-Label Over Multiple Apps',
        body: 'The original plan was to build separate UIs for each insurer client. Different apps, different codebases, different maintenance burden. I\'d seen this pattern fail before.\n\nI proposed a white-label architecture instead: a single app that could be themed, configured, and branded per client without rebuilding. The pushback was immediate—stakeholders assumed it would take longer and cost more.\n\nI made the case with evidence from previous Howden projects. I showed two comparable initiatives: one built without a component library, one with. The version with reusable components could be updated in seconds.\n\nWe built the white-label system, and it paid off:\n• ANWB launched on time with the new platform\n• Howden later launched their own white-labelled version\n• The architecture enabled sales conversations with other insurers'
      },
      {
        title: 'Decision 2: Permission Flows That Convert',
        body: 'Telematics apps need multiple permissions: location (always-on), motion detection, notifications, sometimes Bluetooth. Most apps dump these requests on users all at once. Users decline, onboarding fails.\n\nI redesigned the permission flow with three principles:\n\n• Plain language explanations for each permission, tied to a clear user benefit\n\n• Staggered requests rather than all at once—ask for each permission at the moment it becomes relevant\n\n• Contextual framing that addressed privacy concerns directly\n\nI ran A/B tests using mockups with different copy variations, recruiting participants myself and measuring which approaches reduced hesitation and drop-off.\n\nThe result: onboarding drop-off reduced by roughly one-third. For a telematics app, where the entire business model depends on users granting permissions, this was high-leverage work.'
      },
      {
        title: 'Decision 3: Coaching, Not Scoring',
        body: 'The original app gave users scores after each trip. The problem: scores without context feel like judgment. Users who received low scores felt criticized, not helped. Many disengaged entirely.\n\nI redesigned the feedback system around coaching rather than scoring:\n\n• Encouraging language that framed improvement as achievable\n\n• Specific, actionable suggestions ("Brake earlier before junctions") rather than vague ratings\n\n• Progress over time so users could see themselves improving, not just getting judged trip by trip\n\nThis shift changed the emotional dynamic of the app. Users weren\'t being watched and graded—they were being helped to become better drivers.'
      },
      {
        title: 'Simplified Navigation & Dashboard',
        body: 'Beyond the strategic decisions, I simplified the core UX:\n\n• Stripped away unnecessary complexity in navigation\n\n• Centred the home dashboard around recent trips and behaviour trends\n\n• Made the hardware vs phone-based modes clearly distinct, reducing confusion\n\nThe goal was an app that felt lightweight and helpful, not surveillance-heavy and complicated.'
      },
      {
        title: 'Outcomes',
        body: 'ANWB relaunch: Delivered on time\n\nOnboarding drop-off: Reduced by ~1/3 (via A/B-tested permission flows)\n\nWhite-label adoption: Howden launched own version; additional insurer conversations initiated\n\nPlatform architecture: Transformed from single-client app to reusable product'
      },
      {
        title: 'What I Learned',
        body: 'Challenge the build plan, not just the UI.\nThe most impactful decision I made wasn\'t a design choice—it was proposing a different architecture.\n\nPermission UX is product strategy.\nFor apps that depend on sensitive permissions, onboarding isn\'t just a flow—it\'s the entire funnel.\n\nBehaviour change needs coaching, not scoring.\nFeedback that feels like judgment creates defensiveness. Feedback that feels like support creates engagement.\n\nEvidence beats opinion in cross-functional debates.\nWhen stakeholders assumed white-label would cost more, I didn\'t argue—I showed previous projects.'
      }
    ]
  },
  {
    id: 'case-study-dashboards',
    title: 'Unified Dashboards',
    icon: FileText,
    type: FileType.PRESENTATION,
    seoDescription: 'Case study: Standardising data experience across a £3B business for PE investment.',
    slug: 'case-study/dashboards',
    content: [
      {
        title: 'Unified Dashboards',
        body: 'Standardising Data Experience Across a £3B Business\n\nRole: Lead Product Designer (Data UX, Design Systems, Cross-Org Collaboration)\nTeam: 2 designers + 1 contractor (hired by me)\nScope: ~20 dashboards across Finance, HR, and Broking\n\nImpact: Contributed to securing hundreds of millions in PE investment'
      },
      {
        title: 'The Strategic Problem',
        body: 'Howden grew from an ~£800M to ~£3B business through rapid acquisition. Each acquired company brought its own dashboards, its own data definitions, and its own way of presenting information to leadership.\n\nThe result was chaos at the executive level:\n• Inconsistent visual language: Different colour schemes, chart types, and hierarchies across every dashboard\n• Conflicting terminology: The same metric might be labelled differently—or calculated differently—depending on who built the dashboard\n• Unreliable filtering: Each dashboard handled filters, date ranges, and drill-downs its own way\n• Ad-hoc exports: Users resorted to screenshots and manual data copying\n\nLeaders couldn\'t compare performance across business units without first mentally translating each dashboard\'s logic.'
      },
      {
        title: 'My Role',
        body: 'I led the design effort to unify dashboards across Finance, HR, and Broking, working closely with a project manager and product lead. My responsibilities:\n\n• Running discovery with Finance, HR, and Broking teams to understand how dashboards were actually used\n\n• Defining the unified visual language and pattern library across Power BI and Angular\n\n• Managing a small design team—two designers plus a contractor I hired\n\n• Navigating stakeholder skepticism from teams protective of their existing approaches\n\n• Translating technical constraints (Power BI limitations, data quality issues) into UX patterns'
      },
      {
        title: 'Decision 1: Realistic Mockups',
        body: 'Dashboard projects at Howden had a mixed track record. Stakeholders in Finance and HR were skeptical—they\'d seen design initiatives that looked good in Figma but fell apart in implementation.\n\nI earned their trust by showing I understood the constraints:\n\n• Platform-accurate mockups: No rounded corners in Power BI designs (the platform doesn\'t support them). System fonts like Arial, Georgia, and Courier—not custom typography that would never ship.\n\n• Real data scenarios: Mockups that reflected actual edge cases, not idealised examples\n\n• Fast iteration: I turned around updated mockups quickly, incorporating feedback between sessions\n\nThis wasn\'t about flashy design—it was about demonstrating that I knew how to deliver within real constraints.'
      },
      {
        title: 'Decision 2: Unified Visual Language',
        body: 'I defined a cross-tool pattern library that brought consistency to ~20 dashboards:\n\n• A carefully chosen colour palette for categorical and quantitative data that worked within Power BI\'s limitations\n\n• Typography and spacing optimised for numeric legibility at a glance\n\n• Chart type guidance: When to use which visualisation, with rationale\n\n• Standard patterns for filters, tabs, tables, and drill-downs\n\nThe goal was that a user who understood one dashboard would feel at home in any other—regardless of whether it was built in Power BI or Angular.'
      },
      {
        title: 'Decision 3: Standardised Filtering',
        body: 'Filtering was one of the biggest sources of confusion. Every dashboard handled it differently: where filters lived, how they behaved, how active filters were surfaced.\n\nI put a stake in the ground:\n• Consistent filter placement (global vs local) across all dashboards\n• Standardised behaviour: multi-select, reset, defaults\n• Clear surfacing of active filters so users always knew what they were looking at\n• Unified date range patterns for time-based comparisons\n\nBeyond filtering, I created a shared glossary and formatting conventions:\n• How to represent negative numbers (brackets, not minus signs)\n• Currency formatting and labelling\n• Metric definitions and calculation explanations\n• Cohort vs total labelling\n\nThis isn\'t glamorous work. But for data products, trust is the core UX feature.'
      },
      {
        title: 'Decision 4: Export UX',
        body: 'Through discovery, it became clear that dashboards were rarely the final destination. Leaders took data out—into Excel for analysis, into PowerPoint for board presentations, into emails for distribution.\n\nThe existing export options were inadequate: awkward formatting, missing filters, no control over what got exported.\n\nI designed a unified export flow:\n• Column selection so users could choose what to include\n• Filter preservation so exports reflected the current view\n• Date range and aggregation controls for flexibility\n• Format options matched to downstream workflows\n\nThis feature didn\'t get the attention that visual redesigns get. But it directly addressed how executives actually used the data.'
      },
      {
        title: 'Outcomes',
        body: 'Dashboards unified: ~20 across Finance, HR, and Broking\n\nBusiness impact: Contributed to securing hundreds of millions in PE investment\n\nData quality: Improved consistency enabled reliable cross-business comparison\n\nDevelopment efficiency: BI and engineering teams build new dashboards faster with shared patterns\n\nSupport: Fewer crashes and reduced support queries (per engineering)'
      },
      {
        title: 'What I Learned',
        body: 'In data products, trust is the core UX feature.\nBeautiful charts mean nothing if users don\'t trust the numbers. Consistency in terminology, formatting, and behaviour builds confidence.\n\nRealistic mockups earn credibility faster than polished ones.\nShowing stakeholders that I understood platform constraints built trust faster than impressive visuals.\n\nExport flows matter more than they seem.\nThe "boring" feature that lets users get data into Excel turned out to be one of the most valuable deliverables.\n\nStandardisation during growth is a strategic asset.\nWhen a business is scaling through acquisition, consistent internal tools aren\'t a nice-to-have—they\'re what allows leadership to actually manage the portfolio.'
      }
    ]
  },
  {
    id: 'photography',
    title: 'Hobby: Photos',
    icon: Camera,
    type: FileType.PRESENTATION,
    seoDescription: 'Street photography gallery shot on Fujifilm X100V.',
    slug: 'photography',
    content: [
      {
        title: 'Street Photography',
        body: 'Capturing the urban decay and brutalist architecture of the city.',
        image: 'https://picsum.photos/600/300?random=4'
      },
      {
        title: 'Gear',
        body: 'Shot on Fujifilm X100V.'
      }
    ]
  }
];

export const DOCK_ITEMS: DesktopItem[] = [
  {
    id: 'finder',
    title: 'Finder',
    icon: Folder,
    type: FileType.FINDER,
    seoDescription: 'Browse all files and folders in LukaOS.'
  },
  {
    id: 'preferences',
    title: 'Settings',
    icon: Settings,
    type: FileType.PREFERENCES,
    seoDescription: 'System Preferences and Settings.'
  },
  {
    id: 'blog-dock',
    title: 'Notes',
    icon: StickyNote,
    type: FileType.APP,
    appId: 'blog'
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: Terminal,
    type: FileType.TERMINAL,
    seoDescription: 'AI-powered terminal assistant. Ask questions about the portfolio.'
  },
  // AI Assistant hidden for now
  // {
  //   id: 'ai-assistant',
  //   title: 'Ask AI',
  //   icon: Cpu,
  //   type: FileType.APP,
  //   appId: 'ai-chat',
  //   seoDescription: 'Gemini AI powered assistant to answer questions about the portfolio.'
  // },
  {
    id: 'github',
    title: 'GitHub',
    icon: Github,
    type: FileType.EXTERNAL_LINK,
    url: 'https://github.com/lukataylo',
    seoDescription: 'GitHub profile of Luka Dadiani.'
  },
  {
    id: 'twitter',
    title: 'Twitter',
    icon: Twitter,
    type: FileType.EXTERNAL_LINK,
    url: 'https://x.com/lukadadiani',
    seoDescription: 'Social media profile on X / Twitter.'
  },
  {
    id: 'linkedin',
    title: 'LinkedIn',
    icon: Linkedin,
    type: FileType.EXTERNAL_LINK,
    url: 'https://www.linkedin.com/in/luka-dadiani-3293a915',
    seoDescription: 'LinkedIn Professional Profile.'
  },
  {
    id: 'email',
    title: 'New Message',
    icon: Mail,
    type: FileType.MAIL,
    seoDescription: 'Send an email to Luka Dadiani.'
  }
];