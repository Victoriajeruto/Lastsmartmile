import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Package, Lock, Bell, Zap, ArrowRight, ChevronRight } from "lucide-react";
import LandingLayout from "@/components/LandingLayout";

export default function Home() {
  return (
    <LandingLayout>
      <section className="min-h-[calc(100vh-14rem)] flex flex-col justify-center py-10 overflow-hidden bg-white relative">
        {/* Background shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/5"></div>
          <div className="absolute top-1/2 -left-40 w-[360px] h-[360px] rounded-full bg-primary/5"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center w-full">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-3 h-3" /> Smart Parcel Delivery — Reimagined
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-4">
            Deliveries that{" "}
            <span className="text-primary">wait for you,</span>
            <br />
            not the other way.
          </h1>

          <p className="text-base lg:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
            Last Link Box is a secure automated lockbox system that receives your parcels,
            notifies you instantly, and lets you collect at your convenience — safely, every time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-7 py-5 text-sm font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2" data-testid="hero-cta-register">
                Start for free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full px-7 py-5 text-sm font-semibold border-gray-200 hover:border-primary hover:text-primary gap-2" data-testid="hero-cta-login">
                Sign in <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-400 mb-8">
            Trusted by residents, couriers, and administrators across Kenya.
          </p>

          {/* Hero visual cards */}
          <div className="relative rounded-2xl bg-gradient-to-br from-primary/8 via-primary/4 to-transparent border border-primary/10 p-5 lg:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none rounded-2xl"></div>
            <div className="grid grid-cols-3 gap-3 lg:gap-5 relative z-10">
              {[
                { icon: Package, label: "Parcel Delivered", sub: "KB-2341 · Just now", color: "text-primary" },
                { icon: Lock, label: "Box Secured", sub: "OTP expires in 10 min", color: "text-emerald-500" },
                { icon: Bell, label: "You're Notified", sub: "SMS + in-app alert sent", color: "text-amber-500" },
              ].map(({ icon: Icon, label, sub, color }, i) => (
                <div key={i} className="bg-white rounded-xl p-3 lg:p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
