import React from 'react';
import { Github, Linkedin } from 'lucide-react';
import { SOCIAL_LINKS } from '../constants';

/**
 * Always-visible LinkedIn + GitHub links, surfaced in the top menu bar so they
 * sit above the fold on every viewport (the menu bar renders above windows and
 * is never covered). Real anchor tags — crawlable, and Playwright can assert
 * the `href`. Labelled pills on desktop; accent icon buttons on mobile.
 */
const LINKS = [
  { id: 'github', label: 'GitHub', href: SOCIAL_LINKS.github, Icon: Github },
  { id: 'linkedin', label: 'LinkedIn', href: SOCIAL_LINKS.linkedin, Icon: Linkedin },
] as const;

export const SocialLinks: React.FC = () => (
  <nav aria-label="Social profiles" className="flex items-center gap-1.5">
    {LINKS.map(({ id, label, href, Icon }) => (
      <a
        key={id}
        href={href}
        target="_blank"
        rel="noopener noreferrer me"
        data-testid={`social-${id}`}
        aria-label={`${label} (opens in a new tab)`}
        title={`${label} (opens in a new tab)`}
        className="flex items-center gap-1.5 rounded-full border border-red-600/40 bg-red-600/10 px-2.5 py-1 text-red-600 dark:text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
      >
        <Icon size={14} strokeWidth={2} aria-hidden="true" />
        <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-[0.12em]">
          {label}
        </span>
      </a>
    ))}
  </nav>
);
