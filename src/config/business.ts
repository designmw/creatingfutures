/**
 * Per-client business details — edit this file for every new client project.
 * These values feed LocalBusinessSchema (home + contact) and can be pulled
 * into copy elsewhere via import.
 *
 * Common schema.org @type values for Irish SMEs:
 *   Plumber | Electrician | HVACBusiness | Locksmith | Roofer
 *   Attorney | AccountingService | LegalService | FinancialService
 *   HairSalon | BeautySalon | DaySpa | HealthClub
 *   GeneralContractor | HomeAndConstructionBusiness
 *   MedicalBusiness | Dentist | Optician
 *   AutoRepair | CarDealer
 *   Restaurant | CafeOrCoffeeShop
 *   LocalBusiness  ← safe fallback for anything else
 *
 * image must be an absolute URL (e.g. https://<client-domain>/og-business.jpg)
 * or a root-relative path that resolves once the site URL is set.
 */

export interface BusinessConfig {
  name: string;
  legalName?: string;
  /** schema.org @type — see list above */
  type: string;
  url: string;
  telephone: string;
  email?: string;
  address: {
    street: string;
    locality: string;
    region: string;
    postalCode: string;
    /** ISO 3166-1 alpha-2 country code */
    country: string;
  };
  /** Absolute URL or root-relative path to a representative image */
  image: string;
  description?: string;
  /** e.g. ["Mo-Fr 09:00-17:00", "Sa 09:00-13:00"] */
  openingHours?: string[];
  /** e.g. "€€" */
  priceRange?: string;
  /** Social profile URLs for sameAs */
  sameAs?: string[];
  /**
   * Aggregate review rating → ⭐ stars in Google results. ONLY set this with a
   * real rating that is also shown on the site (e.g. a Google/Trustpilot score
   * displayed in a testimonials section). Fabricated ratings breach Google's
   * guidelines and risk a manual penalty. Leave undefined if you have none.
   */
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export const business: BusinessConfig = {
  name: 'Creating Futures',
  legalName: 'Creating Futures',
  type: 'ProfessionalService',
  url: 'https://creatingfutures.ie',
  // Creating Futures publishes no phone number or street address — email only.
  telephone: '',
  email: 'Caroline@creatingfutures.ie',
  address: {
    street: '',
    locality: 'Dublin',
    region: 'Co. Dublin',
    postalCode: '',
    country: 'IE',
  },
  image: 'https://creatingfutures.ie/wp-content/uploads/2023/07/Creating-Futures-New-Logo.png',
  description:
    'Career coaching and recruitment services in Ireland — professional CV writing, LinkedIn optimisation, interview coaching and recruitment support for individuals and organisations.',
  priceRange: '€€',
  sameAs: ['https://www.linkedin.com/in/carolinekennedycareers/'],
};
