import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-[#334155] bg-[#0F172A] mt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-[#94A3B8] text-sm">
            <Link to="/terms" className="hover:text-[#F1F5F9] transition-colors">
              Terms of Service
            </Link>
            <span>|</span>
            <Link to="/privacy" className="hover:text-[#F1F5F9] transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <a href="#" className="hover:text-[#F1F5F9] transition-colors">
              Careers
            </a>
          </div>
          <p className="text-[#94A3B8] text-sm">
            © 2025 NuuMee.AI — All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
