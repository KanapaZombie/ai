export type RebuiltGemId =
  | 'yellow-tts'
  | 'green-ui'
  | 'rebreather'
  | 'stopspiral'
  | 'dopaminator'
  | 'link-audit';

export type LinkHealthStatus = 'live' | 'rebuilt' | 'auth-gated' | 'bot-shield';

export interface ProjectLink {
  label: string;
  url: string;
  rebuiltGemId?: RebuiltGemId;
  status?: LinkHealthStatus;
  statusNote?: string;
  fallbackUrl?: string;
}

export interface Project {
  name: string;
  symbol: string;
  description: string;
  links: ProjectLink[];
}

export interface GemAuditEntry {
  id: string;
  project: string;
  label: string;
  originalUrl: string;
  resolvedUrl: string;
  rootCause: string;
  solution: string;
  rebuiltGemId: RebuiltGemId;
  fallbackUrl?: string;
}

export const GEM_AUDIT_INVENTORY: GemAuditEntry[] = [
  {
    id: 'yellow-tts',
    project: 'SafetyScan',
    label: 'YELLOW - TTS',
    originalUrl: 'https://gemini.google.com/share/db75accb5fc8?skid=4162005c-ddf8-433a-bb8e-5100d155757f',
    resolvedUrl: 'https://gemini.google.com/share/db75accb5fc8?skid=4162005c-ddf8-433a-bb8e-5100d155757f',
    rootCause:
      'Gemini Canvas/Gem share SPA requires active Google ServiceLogin + consent.google.com, blocks iframe embeds (X-Frame-Options: DENY), and emits >16KB headers.',
    solution:
      'Rebuilt natively in-app using Gemini 4 Vision (gemini-4-hydrogen) + Gemini Neural TTS (gemini-3.8-flash-lite-tts) in Hazard Yellow (#FFE600) UI, plus Community Edition mirror.',
    rebuiltGemId: 'yellow-tts',
    fallbackUrl: 'https://kanapazombie.github.io/'
  },
  {
    id: 'green-ui',
    project: 'SafetyScan',
    label: 'GREEN UI',
    originalUrl: 'https://share.gemini.google/t3iHHbyPnKXt',
    resolvedUrl: 'https://gemini.google.com/share/04b0a4329b54?skid=7e508e75-c7db-4f7b-a29c-441673c6a3bb',
    rootCause:
      'Shortlink 301-redirects to gemini.google.com/share/...?skid=... which bounces unauthenticated/incognito/Workspace visitors to Google Sign-In.',
    solution:
      'Rebuilt natively as the Tactical Green (#33FF66) mode inside SafetyScan Workbench with zero-login photo hazard triage & voice briefings.',
    rebuiltGemId: 'green-ui',
    fallbackUrl: 'https://kanapazombie.github.io/'
  },
  {
    id: 'claude-artifact',
    project: 'SafetyScan',
    label: 'CLAUDE ARTIFACT',
    originalUrl:
      'https://claude.ai/chat/300b6814-8a6d-4962-a399-70bc9fc18780?artifactId=safetyscan.html&versionUuid=2e3bfa9c-32da-42de-ac6c-06426141729b',
    resolvedUrl: 'https://claude.ai/chat/300b6814-8a6d-4962-a399-70bc9fc18780',
    rootCause:
      'Points to a private claude.ai/chat/ conversation URL (returns HTTP 403) instead of a publicly published claude.site artifact link.',
    solution:
      'Routed to the rebuilt in-app SafetyScan engine and mirrored to open-source SafetyScan Community Edition on GitHub Pages.',
    rebuiltGemId: 'yellow-tts',
    fallbackUrl: 'https://kanapazombie.github.io/'
  },
  {
    id: 'rebreather-gem-1',
    project: 'Rebreather / StopSpiral',
    label: 'REBREATHER - GEM 1',
    originalUrl: 'https://share.gemini.google/zalozTH0CXXY',
    resolvedUrl: 'https://gemini.google.com/share/4ea7b6efeaa0?skid=12beaa82-46f6-4644-80a3-fb48f5acdd23',
    rootCause:
      'Shortlink 301-redirects to Gemini share snapshot gated behind ServiceLogin & X-Frame-Options: DENY.',
    solution:
      'Rebuilt in-app breathing pacer (4-2-6 StopSpiral, 4-4-4-4 Box, 4-4-4 Triangle) + linked standalone HTML vault (REBREATHER_DOWNLOAD_1.html).',
    rebuiltGemId: 'rebreather',
    fallbackUrl: 'https://github.com/KanapaZombie/kanapa-download/blob/speak/REBREATHER_DOWNLOAD_1.html'
  },
  {
    id: 'stopspiral-gem-2',
    project: 'Rebreather / StopSpiral',
    label: 'STOPSPIRAL - GEM 2',
    originalUrl: 'https://share.gemini.google/F2IKnmFs9XEA',
    resolvedUrl: 'https://gemini.google.com/share/412959a46e22?skid=72e4848f-816f-4358-894c-e4319ce5a861',
    rootCause:
      'Shortlink 301-redirects to Gemini share snapshot gated behind ServiceLogin & consent check.',
    solution:
      'Rebuilt in-app panic-breaker protocol (long 6s exhale + Web Audio sine cue) alongside live Lovable & Replit mirrors.',
    rebuiltGemId: 'stopspiral',
    fallbackUrl: 'https://rebreather.lovable.app/'
  },
  {
    id: 'jumpstart-gem-2',
    project: 'Jumpstart / Dopaminator',
    label: 'GEM 2.0',
    originalUrl: 'https://share.gemini.google/pnKxkqnToMJo',
    resolvedUrl: 'https://gemini.google.com/share/7dcc5b9b8c78?skid=0ac407b4-142f-4802-840a-8112a477080e',
    rootCause:
      'Shortlink 301-redirects to Gemini share snapshot inaccessible without Google auth session.',
    solution:
      'Rebuilt in-app ADHD micro-focus dial (3/5/15/30/60m, instant +EXP, Compassion Shield) + linked standalone HTML archive.',
    rebuiltGemId: 'dopaminator',
    fallbackUrl: 'https://github.com/KanapaZombie/kanapa-download/blob/speak/JUMPSTART_DOWNLOAD_2.html'
  },
  {
    id: 'jumpstart-gem-1',
    project: 'Jumpstart / Dopaminator',
    label: 'GEM VER1',
    originalUrl: 'https://share.gemini.google/e1LvbryAog4S',
    resolvedUrl: 'https://gemini.google.com/share/ade1bbcdfa78?skid=cf61e408-d1d7-408c-b15e-22fa07b2e890',
    rootCause:
      'Shortlink 301-redirects to Gemini share snapshot inaccessible without Google auth session.',
    solution:
      'Rebuilt in-app Dopaminator timer + linked JUMPSTART_DOWNLOAD_1.html & Netlify live mirror.',
    rebuiltGemId: 'dopaminator',
    fallbackUrl: 'https://dopaminator.netlify.app/'
  }
];

export const projects: Record<string, Project[]> = {
  HEALTH: [
    {
      name: 'Gabber Runner',
      symbol: '🤘',
      description: 'Neuro‑Rhythm Engine for Human Motion. A running companion built on one simple discovery: your nervous system reacts to BPM like it’s a cheat code.',
      links: [
        { label: 'LOVABLE VER 2.0', url: 'https://gabber-runner.lovable.app/', status: 'live' },
        { label: 'LOVABLE - PROTOTYPE', url: 'https://gabberrunner.lovable.app/', status: 'live' }
      ]
    },
    {
      name: 'Rebreather / StopSpiral',
      symbol: '☯',
      description: 'A Tiny Tool for Big Emotional Storms. A minimalist visual + audio guide for ancient breathing techniques, redesigned for modern chaos.',
      links: [
        { label: 'LOVABLE', url: 'https://rebreather.lovable.app/', status: 'live' },
        {
          label: 'REBREATHER - GEM (REBUILT)',
          url: 'https://share.gemini.google/zalozTH0CXXY',
          rebuiltGemId: 'rebreather',
          status: 'rebuilt',
          statusNote: 'Original Gemini share requires Google login; rebuilt natively in-app.',
          fallbackUrl: 'https://github.com/KanapaZombie/kanapa-download/blob/speak/REBREATHER_DOWNLOAD_1.html'
        },
        {
          label: 'STOPSPIRAL - GEM (REBUILT)',
          url: 'https://share.gemini.google/F2IKnmFs9XEA',
          rebuiltGemId: 'stopspiral',
          status: 'rebuilt',
          statusNote: 'Original Gemini share requires Google login; rebuilt natively in-app.',
          fallbackUrl: 'https://rebreather.lovable.app/'
        },
        { label: 'MINDFULBREATS', url: 'https://mindful-breaths--szymonkarpierz.replit.app/', status: 'live' },
        { label: 'GITHUB HTML', url: 'https://github.com/KanapaZombie/kanapa-download/blob/speak/REBREATHER_DOWNLOAD_1.html', status: 'live' }
      ]
    },
    {
      name: 'Jumpstart / Dopaminator',
      symbol: '⚡',
      description: 'Dopamine Booster for ADHD Focus, and a minimalist cycle timer designed for adults with ADHD-based executive dysfunction.',
      links: [
        { label: 'LOVABLE', url: 'https://dopaminator.lovable.app/', status: 'live' },
        { label: 'NETLIFY', url: 'https://dopaminator.netlify.app/', status: 'live' },
        {
          label: 'GEM 2.0 (REBUILT)',
          url: 'https://share.gemini.google/pnKxkqnToMJo',
          rebuiltGemId: 'dopaminator',
          status: 'rebuilt',
          statusNote: 'Original Gemini share requires Google login; rebuilt natively in-app.',
          fallbackUrl: 'https://github.com/KanapaZombie/kanapa-download/blob/speak/JUMPSTART_DOWNLOAD_2.html'
        },
        {
          label: 'GEM VER1 (REBUILT)',
          url: 'https://share.gemini.google/e1LvbryAog4S',
          rebuiltGemId: 'dopaminator',
          status: 'rebuilt',
          statusNote: 'Original Gemini share requires Google login; rebuilt natively in-app.',
          fallbackUrl: 'https://github.com/KanapaZombie/kanapa-download/blob/speak/JUMPSTART_DOWNLOAD_1.html'
        },
        { label: 'CODEPEN', url: 'https://codepen.io/zombiekanapa/full/MYJXYoG', status: 'bot-shield' }
      ]
    }
  ],
  SECURITY: [
    {
      name: 'SafetyScan',
      symbol: '☣',
      description: 'Take photos, scan for threats, stay safe!',
      links: [
        {
          label: 'YELLOW - TTS (REBUILT)',
          url: 'https://gemini.google.com/share/db75accb5fc8?skid=4162005c-ddf8-433a-bb8e-5100d155757f',
          rebuiltGemId: 'yellow-tts',
          status: 'rebuilt',
          statusNote: 'Original Gemini share gated behind Google login; rebuilt with Gemini Vision + Neural TTS.',
          fallbackUrl: 'https://kanapazombie.github.io/'
        },
        {
          label: 'GREEN UI (REBUILT)',
          url: 'https://share.gemini.google/t3iHHbyPnKXt',
          rebuiltGemId: 'green-ui',
          status: 'rebuilt',
          statusNote: 'Original Gemini share gated behind Google login; rebuilt in Tactical Green mode.',
          fallbackUrl: 'https://kanapazombie.github.io/'
        },
        { label: 'COMMUNITY EDITION (GITHUB)', url: 'https://kanapazombie.github.io/', status: 'live' },
        { label: 'BASE44', url: 'https://safetyscan-app.base44.app/', status: 'live' },
        {
          label: 'LOVABLE (AUTH)',
          url: 'https://safetyscan.lovable.app/',
          status: 'auth-gated',
          statusNote: 'Requires sign-in on Lovable before scanning.'
        },
        {
          label: 'CLAUDE ARTIFACT (REBUILT)',
          url: 'https://claude.ai/chat/300b6814-8a6d-4962-a399-70bc9fc18780?artifactId=safetyscan.html&versionUuid=2e3bfa9c-32da-42de-ac6c-06426141729b',
          rebuiltGemId: 'yellow-tts',
          status: 'rebuilt',
          statusNote: 'Private Claude chat URL (403); routed to rebuilt in-app SafetyScan.',
          fallbackUrl: 'https://kanapazombie.github.io/'
        }
      ]
    },
    {
      name: 'Evacuate',
      symbol: '⚠',
      description: 'Evacuation instructions and emergency info.',
      links: [
        { label: 'VERCEL', url: 'https://evacuate-eight.vercel.app/', status: 'live' },
        { label: 'NETLIFY', url: 'https://ewakuacja.netlify.app/', status: 'live' }
      ]
    },
    {
      name: 'Zombie Landing Pages',
      symbol: '🧟',
      description: 'Previous landing page iterations and mockups.',
      links: [
        { label: 'GITHUB', url: 'https://kanapazombie.github.io/' },
        { label: 'FIGMA', url: 'https://zombiekanapa.figma.site/' },
        { label: 'GREEN', url: 'https://zombiekanapa.free.site.pro/' }
      ]
    }
  ],
  EXPERIMENTS: [
    {
      name: 'The Trolley Problem',
      symbol: '🚋',
      description: 'A science fiction short story based on a real conversation between me and Grok, edited by Claude, and narrated by a voice clone TTS model based on Sir Arthur C. Clarke.',
      links: [
        { label: 'YOUTUBE', url: 'https://youtu.be/AKC5vn8SKI0' }
      ]
    },
    {
      name: 'AI Fictional Soundtrack Scores',
      symbol: '🎵',
      description: 'A collection of snippets and narration tests promoting the upcoming release of a conceptual set of cinematic themes for non-existent movies, created with Udio and AI agents.',
      links: [
        { label: 'YOUTUBE', url: 'https://youtu.be/w5yfFRAFnnc' },
        { label: 'HYCEAN BLUE GALLERY', url: 'https://www.bing.com/saves?FORM=IRPCOL&collId=077517e2b9ca4a2aa1d7ba10e26d89e9' }
      ]
    },
    {
      name: 'Aotearoa',
      symbol: '🌊',
      description: 'A conceptual story, soundtrack score and English narration piece.',
      links: [
        { label: 'BANDCAMP', url: 'https://zombiekanapa.bandcamp.com/track/aotearoa-story-english' }
      ]
    },
    {
      name: 'Ostatnia Niedziela',
      symbol: '📻',
      description: 'Słuchowisko audio drama and conceptual atmospheric soundtrack score.',
      links: [
        { label: 'BANDCAMP - SŁUCHOWISKO', url: 'https://zombiekanapa.bandcamp.com/album/ostatnia-niedziela-s-uchowisko' }
      ]
    },
    {
      name: 'Pax Polonia',
      symbol: '🦅',
      description: 'Conceptual alternate history soundtrack score and narrative video experiment.',
      links: [
        { label: 'YOUTUBE', url: 'https://www.youtube.com/watch?v=Aa2nTY-Z6RI&t=379s' }
      ]
    }
  ],
  CULTURE: [
    {
      name: 'Shaolin: Monar',
      symbol: '⛩️',
      description: 'Community and cultural story exploration and documentary video.',
      links: [
        { label: 'YOUTUBE', url: 'https://youtu.be/4xPPCwoSB9E' }
      ]
    },
    {
      name: 'AstroLab',
      symbol: '🔭',
      description: 'Astronomical educational journey exploring cosmic mysteries through sound and visual media.',
      links: [
        { label: 'YOUTUBE', url: 'https://youtu.be/lNpq56hYbMA' }
      ]
    },
    {
      name: 'One Hundred Seconds to Midnight',
      symbol: '⏳',
      description: 'Conceptual reflection and audio-visual essay exploring existential risks and the Doomsday Clock.',
      links: [
        { label: 'YOUTUBE', url: 'https://youtu.be/Y8-UorUJgDE' }
      ]
    },
    {
      name: 'Hubble Ambient Journey',
      symbol: '🌌',
      description: 'Deep space ambient visual & sound journey through high-resolution Hubble Space Telescope captures.',
      links: [
        { label: 'YOUTUBE', url: 'https://youtu.be/Q6FK3UtWvco' }
      ]
    },
    {
      name: 'Nobody is Nobody',
      symbol: '👥',
      description: 'Community-centered reflection on human dignity, connections, and personal narratives.',
      links: [
        { label: 'YOUTUBE', url: 'https://youtu.be/5bD--yGMU5w' }
      ]
    },
    {
      name: 'A Sign in Space',
      symbol: '📡',
      description: 'Decoding extraterrestrial signals and generative alien visual galleries created for the global interstellar communication project.',
      links: [
        { label: 'VIDEO (YOUTUBE)', url: 'https://youtu.be/7r2VeCAm3hw' },
        { label: 'ALIEN IMAGE GALLERY', url: 'https://asignin.space/a-collection-of-images-prompted-by-digital-creator-szymon-karpierz/' }
      ]
    }
  ],
  'AI-EYE': [
    {
      name: 'ArtStation Portfolio',
      symbol: '🎨',
      description: 'Digital art concepts, prompt crafting, and generative visual experiment portfolios.',
      links: [
        { label: 'ARTSTATION', url: 'https://zombiekanapa.artstation.com/' }
      ]
    },
    {
      name: 'Bing Collections: Blue',
      symbol: '💎',
      description: 'Curated generative art collection archive and aesthetic mood boards.',
      links: [
        { label: 'BING COLLECTIONS: BLUE', url: 'https://www.bing.com/saves?FORM=O2HV46&collId=077517e2b9ca4a2aa1d7ba10e26d89e9' }
      ]
    },
    {
      name: 'Red Hive 01',
      symbol: '🔴',
      description: 'Generative video and visual aesthetic synthesizer test.',
      links: [
        { label: 'YOUTUBE', url: 'https://youtu.be/LKMIWx8aSKY' }
      ]
    },
    {
      name: 'Video: Veo 2',
      symbol: '🎥',
      description: 'Generative video exploration with DeepMind’s Veo 2 model.',
      links: [
        { label: 'YOUTUBE', url: 'https://youtu.be/7N-JgLDQU4A' }
      ]
    },
    {
      name: 'AI Pagan Fiction',
      symbol: '🌿',
      description: 'Generative visual storytelling and mythic folklore worldbuilding.',
      links: [
        { label: 'YOUTUBE', url: 'https://youtu.be/sztltGgdGAo' }
      ]
    }
  ],
  DOWNLOAD: [
    {
      name: 'Kanapa-Download Vault',
      symbol: '💾',
      description: 'Standalone HTML files, tools, and offline bundles (Dopaminator, StopSpiral) for zero-dependency local execution directly in your browser.',
      links: [
        { label: 'GITHUB: KANAPAZOMBIE', url: 'https://github.com/KanapaZombie/kanapa-download' }
      ]
    },
    {
      name: 'ZombieKanapa DJ Sets & Mixtapes',
      symbol: '🎛️',
      description: 'Live DJ sets, BPM training sessions, and curated electronic mixtapes hosted on Audio.com.',
      links: [
        { label: 'AUDIO.COM - ZOMBIE MIXTAPEZ', url: 'https://audio.com/zombiekanapa/collections/zombie-mixtapez' }
      ]
    },
    {
      name: 'Remixes & Mashups Vault',
      symbol: '🔊',
      description: 'Curated remixes, mashups, edits, and experimental audio tracks.',
      links: [
        { label: 'SOUNDCLOUD - TRACKS', url: 'https://soundcloud.com/szymon-karpierz/tracks' }
      ]
    }
  ]
};
