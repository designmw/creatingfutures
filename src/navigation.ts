import { getPermalink, getBlogPermalink } from './utils/permalinks';
import { business } from './config/business';

// Contact hrefs derived from the single source of truth in config/business.ts —
// they update automatically once the client's real details are filled in.
const telHref = `tel:${business.telephone.replace(/\s/g, '')}`;
const whatsappHref = `https://wa.me/${business.telephone.replace(/\D/g, '')}`;
const emailHref = business.email ? `mailto:${business.email}` : undefined;

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/'),
    },
    {
      text: 'About',
      href: getPermalink('/about'),
    },
    {
      text: 'Services',
      href: getPermalink('/services'),
    },
    {
      text: 'Blog',
      href: getBlogPermalink(),
    },
    {
      text: 'Contact',
      href: getPermalink('/contact'),
    },
  ],
  actions: [],
};

// Default footer structure — the standing standard for every client build:
// brand column (logo + description + legal links), an icon-led "Explore"
// column, a "Get in touch" column fed by config/business.ts, then a bottom
// bar with the footnote left and social icons right.
export const footerData = {
  description: business.description,
  links: [
    {
      title: 'Explore',
      links: [
        { text: 'Home', href: getPermalink('/'), icon: 'tabler:home' },
        { text: 'About', href: getPermalink('/about'), icon: 'tabler:user' },
        { text: 'Services', href: getPermalink('/services'), icon: 'tabler:briefcase' },
        { text: 'Blog', href: getBlogPermalink(), icon: 'tabler:news' },
        { text: 'Contact', href: getPermalink('/contact'), icon: 'tabler:message-circle' },
      ],
    },
    {
      title: 'Get in touch',
      links: [
        { text: business.telephone, href: telHref, icon: 'tabler:phone' },
        { text: 'Message on WhatsApp', href: whatsappHref, icon: 'tabler:brand-whatsapp' },
        ...(business.email ? [{ text: business.email, href: emailHref, icon: 'tabler:mail' }] : []),
        { text: `${business.address.locality}, ${business.address.region}`, icon: 'tabler:map-pin' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'WhatsApp', icon: 'tabler:brand-whatsapp', href: whatsappHref },
    ...(emailHref ? [{ ariaLabel: 'Email', icon: 'tabler:mail', href: emailHref }] : []),
  ],
  footNote: `${business.name}. All rights reserved. Website by <a href="https://designmywebsite.ie" target="_blank" rel="noopener noreferrer" class="hover:underline">Design My Website</a>`,
};
