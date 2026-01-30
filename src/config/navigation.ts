// Navigation configuration
export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const mainNav: NavItem[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Tools',
    href: '/tools',
  },
  {
    title: 'About',
    href: '/about',
  },
  {
    title: 'Pricing',
    href: '/pricing',
  },
];

export const footerNav: NavGroup[] = [
  // {
  //   title: 'Tools',
  //   items: [
  //     { title: 'QR Code Generator', href: '/tools/qr-code-generator' },
  //     { title: 'Instagram Carousel', href: '/tools/instagram-carousel' },
  //     { title: 'Image Compressor', href: '/tools/image-compressor' },
  //     { title: 'All Tools', href: '/tools' },
  //   ],
  // },
  {
    title: 'Company',
    items: [
      { title: 'About', href: '/about' },
      { title: 'Blog', href: '/blog' },
      { title: 'Careers', href: '/careers' },
      { title: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Service', href: '/terms' },
      { title: 'Cookie Policy', href: '/cookies' },
    ],
  },
];
