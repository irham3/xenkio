import Link from "next/link";

export function Footer() {
  const links = {
    Product: ['Features', 'Pricing', 'API', 'Integrations'],
    Resources: ['Blog', 'Documentation', 'Community', 'Status'],
    Company: ['About', 'Careers', 'Legal', 'Contact'],
    Legal: ['Privacy', 'Terms', 'Security', 'Cookies']
  };

  return (
    <footer className="bg-gray-100 border-t border-gray-200 pt-16 pb-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-gray-900 block mb-4">
              Xenkio
            </Link>
            <p className="text-sm text-gray-500 mb-4 pr-4">
              Every tool you need for your daily workflow. One platform.
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-bold text-gray-900 mb-4">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-gray-600 hover:text-primary-500 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Xenkio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
