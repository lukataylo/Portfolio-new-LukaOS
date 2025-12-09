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
  Folder
} from 'lucide-react';
import { DesktopItem, FileType, BlogPost, Book } from './types';

export const INITIAL_WINDOW_WIDTH = 600;
export const INITIAL_WINDOW_HEIGHT = 500;

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'The Search for Digital Minimalism',
    excerpt: 'Why we are returning to brutalist aesthetics and raw data in an age of AI-generated noise.',
    date: 'Oct 24, 2024',
    readTime: '5 min read',
    author: 'Senior Engineer',
    tags: ['Design', 'Philosophy', 'UX'],
    image: 'https://picsum.photos/800/400?random=10',
    content: `
      <p>In a world increasingly saturated with high-fidelity graphics, immersive 3D environments, and AI-generated "perfection," there is a growing counter-movement. We crave the raw, the unfiltered, and the functional. This is not just nostalgia for the early web; it is a rejection of the dopamine-loop design patterns that have come to dominate our screens.</p>
      
      <h3>The Return of the Terminal</h3>
      <p>Why are developers obsessing over terminal-based portfolios? It represents a return to control. The command line is honest. It does exactly what you tell it to do, nothing more, nothing less. It hides nothing behind a glossy gradient.</p>
      
      <p>When I set out to build this OS-style portfolio, the goal wasn't just to mimic macOS. It was to strip it back. To remove the blur (mostly), the bounce, and the shine, and replace it with mono-spaced typography and clear, stark borders.</p>
      
      <h3>Function over Form? No, Function IS Form.</h3>
      <p>The "Nothing" aesthetic—popularized by the tech brand—suggests that the transparent workings of a device are beautiful in themselves. We shouldn't hide the grid. We shouldn't hide the pixels. We should celebrate the machine.</p>
    `
  },
  {
    id: 'post-2',
    title: 'React 19 & The Future of State',
    excerpt: 'Exploring server components, actions, and the new use() hook in production applications.',
    date: 'Nov 02, 2024',
    readTime: '8 min read',
    author: 'Senior Engineer',
    tags: ['React', 'Engineering', 'Frontend'],
    content: `
      <p>React 19 is not just an update; it's a paradigm shift. For years, we've managed complex async states using \`useEffect\` and third-party libraries. With the introduction of Actions and the native \`use\` API, the mental model is simplifying.</p>
      
      <h3>Goodbye, useEffect?</h3>
      <p>Well, not entirely. But for data fetching, absolutely. The ability to suspend rendering natively while waiting for a promise to resolve cleans up components significantly. We no longer need \`isLoading\` flags littered across every component state.</p>
      
      <p>In this operating system project, I utilized standard React state management, but if I were to rebuild the "Filesystem," I would heavily leverage Server Components to stream file content on demand, rather than bundling it all into the client.</p>
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
    seoDescription: 'CV and Resume of Luka Dadiani, Senior Product Manager and Designer in London.',
    slug: 'about',
    content: [
      {
        title: 'Luka Dadiani',
        body: 'Product Manager / Senior Product Designer\nLondon, United Kingdom\n\nSenior Product Professional with over 9 years’ experience delivering user-centred, data-informed products across insurance, telecoms and subscription e‑commerce. Skilled at translating complex stakeholder and user needs into clear product strategies, high-impact UX, and scalable design systems within globally distributed agile teams.',
        image: 'https://picsum.photos/600/300?random=3'
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
    id: 'case-study-1',
    title: 'E-Commerce Redesign',
    icon: FileText,
    type: FileType.PRESENTATION,
    seoDescription: 'Case study: Redesigning a major fashion retailer mobile experience with headless Shopify architecture.',
    slug: 'case-study/ecommerce',
    content: [
      {
        title: 'Project Overview',
        body: 'A complete overhaul of a major fashion retailer\'s mobile experience. We focused on performance and minimalism.',
        image: 'https://picsum.photos/600/300?random=1'
      },
      {
        title: 'The Challenge',
        body: 'The legacy codebase was slow, and conversion rates on mobile were dropping. The client wanted a "Nothing" style aesthetic.'
      },
      {
        title: 'The Solution',
        body: 'We implemented a headless architecture using React and Shopify. Load times decreased by 40%.'
      }
    ]
  },
  {
    id: 'case-study-secret',
    title: 'Project X (Confidential)',
    icon: Lock,
    type: FileType.PROTECTED,
    password: '123',
    seoDescription: 'A confidential FinTech AI project protected by NDA.',
    slug: 'case-study/project-x',
    lockedContent: [
      {
        title: 'Top Secret Project',
        body: 'This project involves next-gen AI integration for a FinTech startup. Currently under NDA.',
        image: 'https://picsum.photos/600/300?random=2'
      },
      {
        title: 'Tech Stack',
        body: 'Rust, WebAssembly, and Custom LLMs.'
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
    type: FileType.APP,
    appId: 'sitemap', // Updated finder to open Sitemap for better navigation
    seoDescription: 'System Finder and File Navigation.'
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