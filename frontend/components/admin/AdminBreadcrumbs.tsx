'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  admin555: 'Admin',
  users: 'Users',
  jobs: 'Jobs',
  payments: 'Payments',
  promos: 'Promo Codes',
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Build breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment;
    const isLast = index === segments.length - 1;

    return { path, label, isLast };
  });

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-[#94A3B8] mb-6">
      <Link
        href="/admin555"
        className="flex items-center gap-1 hover:text-[#F1F5F9] transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbs.slice(1).map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-[#475569]" />
          {crumb.isLast ? (
            <span className="text-[#F1F5F9] font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.path}
              className="hover:text-[#F1F5F9] transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
