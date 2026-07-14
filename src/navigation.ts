import { getPermalink } from './utils/permalinks';
import { business } from './config/business';

// Contact hrefs derived from the single source of truth in config/business.ts —
// they update automatically once the client's real details are filled in.
// Creating Futures is email-first: no public phone number, so phone/WhatsApp
// entries are only included when a telephone is set.
const telHref = business.telephone ? `tel:${business.telephone.replace(/\s/g, '')}` : undefined;
const whatsappHref = business.telephone ? `https://wa.me/${business.telephone.replace(/\D/g, '')}` : undefined;
const emailHref = business.email ? `mailto:${business.email}` : undefined;
const linkedInHref = business.sameAs?.find((url) => url.includes('linkedin.com'));

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
      text: 'Individuals',
      href: getPermalink('/services'),
    },
    {
      text: 'Organisations',
      href: getPermalink('/organisations'),
    },
    {
      text: 'Schools',
      href: getPermalink('/schools'),
    },
    {
      text: 'Pricing',
      href: getPermalink('/pricing'),
    },
    {
      text: 'Contact',
      href: getPermalink('/contact'),
    },
  ],
  actions: [{ variant: 'primary' as const, text: 'Make an inquiry', href: getPermalink('/contact') }],
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
        { text: 'Individuals', href: getPermalink('/services'), icon: 'tabler:briefcase' },
        { text: 'Organisations', href: getPermalink('/organisations'), icon: 'tabler:building' },
        { text: 'Schools', href: getPermalink('/schools'), icon: 'tabler:school' },
        { text: 'Pricing', href: getPermalink('/pricing'), icon: 'tabler:tag' },
        { text: 'Contact', href: getPermalink('/contact'), icon: 'tabler:message-circle' },
      ],
    },
    {
      title: 'Get in touch',
      links: [
        ...(business.telephone && telHref ? [{ text: business.telephone, href: telHref, icon: 'tabler:phone' }] : []),
        ...(whatsappHref ? [{ text: 'Message on WhatsApp', href: whatsappHref, icon: 'tabler:brand-whatsapp' }] : []),
        ...(business.email ? [{ text: business.email, href: emailHref, icon: 'tabler:mail' }] : []),
        ...(linkedInHref ? [{ text: 'Connect on LinkedIn', href: linkedInHref, icon: 'tabler:brand-linkedin' }] : []),
        { text: `${business.address.locality}, ${business.address.region}`, icon: 'tabler:map-pin' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    ...(linkedInHref ? [{ ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: linkedInHref }] : []),
    ...(emailHref ? [{ ariaLabel: 'Email', icon: 'tabler:mail', href: emailHref }] : []),
  ],
  footNote: `${business.name}. All rights reserved. Website by <a href="https://designmywebsite.ie" target="_blank" rel="noopener noreferrer" class="hover:underline">Design My Website</a> <svg class="inline-block w-4 h-3 align-baseline rounded-[1px]" viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Irish flag"><rect width="1" height="2" fill="#169B62"/><rect x="1" width="1" height="2" fill="#ffffff"/><rect x="2" width="1" height="2" fill="#FF883E"/></svg>`,
};
