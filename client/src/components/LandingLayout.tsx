import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import companyLogo from "@assets/Last_Link_Box_1769242505355.png";

const pages = [
  { path: "/", label: "Home" },
  { path: "/features", label: "Features" },
  { path: "/how-it-works", label: "How It Works" },
  { path: "/benefits", label: "Benefits" },
  { path: "/contact", label: "Contact" },
  { path: "/installation-request", label: "Request Installation" },
];

interface LandingLayoutProps {
  children: React.ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  const [location, setLocation] = useLocation();

  const currentIndex = pages.findIndex((p) => p.path === location);
  const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null;
  const nextPage = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <img src={companyLogo} alt="Last Link Box" className="w-8 h-8 object-contain" />
              <span className="font-bold text-base text-gray-900 tracking-tight group-hover:text-primary transition-colors">
                Last Link Box
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {pages.map((page) => (
              <Link key={page.path} href={page.path}>
                <button
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    location === page.path
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:text-primary hover:bg-gray-50"
                  }`}
                >
                  {page.label}
                </button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium text-gray-700 hover:text-primary" data-testid="nav-login">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-sm font-semibold rounded-full px-4 bg-primary hover:bg-primary/90 shadow-sm" data-testid="nav-register">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main className="flex-1 pt-14">
        {children}
      </main>

      {/* ── PAGE NAVIGATION (prev / next) ── */}
      <div className="border-t border-gray-100 bg-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {prevPage ? (
            <button
              onClick={() => setLocation(prevPage.path)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors group"
              data-testid="btn-prev-page"
            >
              <span className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </span>
              <span>{prevPage.label}</span>
            </button>
          ) : (
            <div />
          )}

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {pages.map((page, i) => (
              <button
                key={page.path}
                onClick={() => setLocation(page.path)}
                className={`rounded-full transition-all duration-200 ${
                  i === currentIndex
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-gray-200 hover:bg-primary/40"
                }`}
                data-testid={`dot-page-${i}`}
                title={page.label}
              />
            ))}
          </div>

          {nextPage ? (
            <button
              onClick={() => setLocation(nextPage.path)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors group"
              data-testid="btn-next-page"
            >
              <span>{nextPage.label}</span>
              <span className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-5 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src={companyLogo} alt="Last Link Box" className="w-6 h-6 object-contain" />
            <span className="text-sm font-semibold text-gray-700">Last Link Box</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Last Link Box. Smart Postal Delivery System.</p>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            <Link href="/installation-request"><span className="hover:text-primary transition-colors cursor-pointer">Request Installation</span></Link>
            <Link href="/contact"><span className="hover:text-primary transition-colors cursor-pointer">Contact</span></Link>
            <Link href="/login"><span className="hover:text-primary transition-colors cursor-pointer">Sign In</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
