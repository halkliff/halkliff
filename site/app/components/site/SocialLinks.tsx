import { cn } from '@/lib/utils';
import { ArrowUpRight, Mail } from 'lucide-react';
import { FaGithub, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { Typography } from '../ui/typography';

export const socialLinks = [
  {
    label: 'X',
    handle: '@halkliff',
    href: 'https://x.com/halkliff',
    icon: FaXTwitter,
    ariaLabel: 'Werberth on X',
  },
  {
    label: 'GitHub',
    handle: '/halkliff',
    href: 'https://github.com/halkliff',
    icon: FaGithub,
    ariaLabel: 'Werberth on GitHub',
  },
  {
    label: 'LinkedIn',
    handle: '/werberth-lins',
    href: 'https://linkedin.com/in/werberth-lins',
    icon: FaLinkedinIn,
    ariaLabel: 'Werberth on LinkedIn',
  },
  {
    label: 'Email',
    handle: 'Say hello',
    href: 'mailto:halkliff@pm.me',
    icon: Mail,
    ariaLabel: 'Email Werberth',
  },
] as const;

type SocialLinksProps = {
  className?: string;
  mediumCompact?: boolean;
};

/** Shared social destinations for the homepage and other portfolio surfaces. */
export function SocialLinks({
  className,
  mediumCompact = false,
}: SocialLinksProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-4 max-md:grid-cols-2',
        mediumCompact && 'max-lg:grid-cols-2',
        className,
      )}
    >
      {socialLinks.map((link, index) => {
        const Icon = link.icon;

        return (
          <a
            aria-label={link.ariaLabel}
            className={cn(
              'grid grid-cols-[25px_1fr_auto] items-center gap-x-2 gap-y-1 border-l border-(--line) px-3 py-2.5 transition-[background] duration-150 lg:first:border-l-0 lg:first:pl-0 hover:bg-[rgba(255,255,255,0.38)] dark:hover:bg-white/6 max-md:border-l-0 max-md:border-b max-md:border-(--line) max-md:p-3 max-md:even:border-l',
              mediumCompact &&
                'max-lg:border-b max-lg:border-(--line) max-lg:p-3',
              mediumCompact && index % 2 === 0 && 'max-lg:border-l-0',
            )}
            href={link.href}
            key={link.label}
          >
            <i className="col-start-1 row-span-2 row-start-1 flex size-6 items-center justify-center bg-(--ink) text-(--paper)">
              <Icon
                aria-hidden="true"
                className="size-3"
              />
            </i>
            <Typography
              as="span"
              className="col-start-2 row-start-1 text-[9px] font-[650]"
              variant="codeLabel"
            >
              {link.label}
            </Typography>
            <Typography
              as="small"
              className="col-start-2 row-start-2 text-[7px] text-[#74776f] dark:text-[#8f9a9e]"
              variant="caption"
            >
              {link.handle}
            </Typography>
            <ArrowUpRight
              aria-hidden="true"
              className="col-start-3 row-span-2 row-start-1 size-3"
            />
          </a>
        );
      })}
    </div>
  );
}
