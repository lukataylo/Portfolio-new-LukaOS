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
  BookOpen,
  Map as MapIcon,
  Mail
} from 'lucide-react';
import { DesktopItem, FileType, BlogPost } from './types';

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
    title: 'Engineering Blog',
    icon: BookOpen,
    type: FileType.BLOG,
    blogPosts: BLOG_POSTS,
    seoDescription: 'Technical writings on React, Design Systems, and Product Strategy.',
    slug: 'blog'
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
    icon: Terminal,
    type: FileType.APP,
    appId: 'sitemap', // Updated finder to open Sitemap for better navigation
    seoDescription: 'System Finder and File Navigation.'
  },
  {
    id: 'blog-dock',
    title: 'Blog',
    icon: BookOpen,
    type: FileType.APP,
    appId: 'blog'
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
    title: 'Email',
    icon: Mail,
    type: FileType.EXTERNAL_LINK,
    url: 'mailto:luka.taylor@gmail.com',
    seoDescription: 'Send an email to Luka Dadiani.'
  }
];