import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { COMPANY_PROFILE } from '../config/companyProfile';

const publicRoutes = {
  '/': { title: 'Shahnawaz Enterprises — We Make Interiors', description: 'Explore interior-focused services, project inspiration and consultation options from Shahnawaz Enterprises.' },
  '/products': { title: 'Products & Solutions | Shahnawaz Enterprises', description: 'Explore product and interior solution options from Shahnawaz Enterprises. Confirm specifications and availability with the company.' },
  '/portfolio': { title: 'Portfolio | Shahnawaz Enterprises', description: 'Browse interior project inspiration and portfolio items shared by Shahnawaz Enterprises.' },
  '/calculator': { title: 'Project Estimate Calculator | Shahnawaz Enterprises', description: 'Prepare a preliminary project estimate. Final scope, materials and pricing must be confirmed with the company.' },
  '/quote': { title: 'Request a Quote | Shahnawaz Enterprises', description: 'Share your interior project requirements to request a preliminary quotation from Shahnawaz Enterprises.' },
  '/appointments': { title: 'Book a Consultation | Shahnawaz Enterprises', description: 'Submit an appointment request to discuss your interior project requirements with Shahnawaz Enterprises.' },
  '/reviews': { title: 'Customer Reviews | Shahnawaz Enterprises', description: 'Explore the customer review section on the Shahnawaz Enterprises website.' },
  '/recommendations': { title: 'Recommendations | Shahnawaz Enterprises', description: 'Explore project and product recommendations to help plan your interior requirements.' },
  '/chat': { title: 'Project Assistant | Shahnawaz Enterprises', description: 'Use the website assistant to explore service information and prepare your project questions.' },
  '/login': { title: 'Sign In | Shahnawaz Enterprises', description: '', private: true },
  '/register': { title: 'Create Account | Shahnawaz Enterprises', description: '', private: true },
};
const privatePrefixes = ['/account', '/admin'];

function ensureMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export default function SeoManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const exact = publicRoutes[pathname];
    const privateRoute = Boolean(exact?.private || privatePrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)));
    let route = exact;
    if (!route && pathname.startsWith('/products/')) route = { title: 'Product Details | Shahnawaz Enterprises', description: 'Review product details and confirm current specifications and availability with Shahnawaz Enterprises.' };
    if (!route && pathname.startsWith('/portfolio/')) route = { title: 'Project Details | Shahnawaz Enterprises', description: 'Explore this portfolio item from Shahnawaz Enterprises.' };
    if (!route) route = { title: 'Page Not Found | Shahnawaz Enterprises', description: '' };

    document.title = route.title || `${COMPANY_PROFILE.name} — ${COMPANY_PROFILE.tagline}`;
    ensureMeta('name', 'description', route.description || '');
    ensureMeta('name', 'robots', privateRoute || !exact && !pathname.startsWith('/products/') && !pathname.startsWith('/portfolio/') ? 'noindex, nofollow' : 'index, follow');
    ensureMeta('property', 'og:title', document.title);
    ensureMeta('property', 'og:description', route.description || '');
  }, [pathname]);
  return null;
}
