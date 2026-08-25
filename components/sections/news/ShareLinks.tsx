import { Facebook, Instagram, LinkedIn, XTwitter } from "@/components/icons/SocialIcons";

interface ShareLinksProps {
  url: string;
  title: string;
  label: string;
  ariaLabelFor: (network: string) => string;
}

/** Instagram has no public web share-intent URL for an arbitrary link, unlike the other three — this opens the Instagram homepage as the closest honest equivalent. */
const INSTAGRAM_HOME_URL = "https://www.instagram.com/";

export default function ShareLinks({ url, title, label, ariaLabelFor }: ShareLinksProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const networks = [
    {
      name: "Facebook",
      Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Instagram",
      Icon: Instagram,
      href: INSTAGRAM_HOME_URL,
    },
    {
      name: "X",
      Icon: XTwitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "LinkedIn",
      Icon: LinkedIn,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-20">
      <span className="text-h6 font-semibold text-white">{label}</span>
      <div className="flex items-center gap-20">
        {networks.map(({ name, Icon, href }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabelFor(name)}
            className="text-white transition-colors duration-150 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            <Icon size={24} />
          </a>
        ))}
      </div>
    </div>
  );
}
