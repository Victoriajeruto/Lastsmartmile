import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, PackageCheck, Unlock } from "lucide-react";
import LandingLayout from "@/components/LandingLayout";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Register & Get Your Box",
    description: "Sign up for an account, select your role, enter your smart box code, and pin your exact location on the interactive map for accurate deliveries.",
    details: ["Create a free account in minutes", "Enter your unique smart box code", "Pin your location with GPS precision"],
  },
  {
    step: "02",
    icon: PackageCheck,
    title: "Receive Deliveries Securely",
    description: "Couriers drop off your packages directly into your locked smart box. No waiting at home, no missed deliveries, no package left at the door.",
    details: ["Works with all courier services", "Box locks automatically after deposit", "Tamper detection keeps it safe"],
  },
  {
    step: "03",
    icon: Unlock,
    title: "Unlock & Collect",
    description: "Get an instant SMS and in-app alert the moment your parcel arrives. Use your OTP or QR code to open the box at any time that suits you.",
    details: ["Instant SMS & in-app notification", "One-time OTP or QR code access", "Collect at your own convenience"],
  },
];

export default function HowItWorksPage() {
  return (
    <LandingLayout>
      <section className="min-h-[calc(100vh-14rem)] flex flex-col justify-center py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">How It Works</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-3">
              Simple. Secure. Smart.
            </h1>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Getting started takes only a few minutes — and once you're set up, everything runs automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {steps.map(({ step, icon: Icon, title, description, details }, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(100%-1rem)] w-8 h-px bg-gradient-to-r from-primary/40 to-primary/10 z-0"></div>
                )}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-base font-bold text-primary">{step}</span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{description}</p>
                  <ul className="space-y-1.5">
                    {details.map((d, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/register">
              <Button className="rounded-full px-8 py-5 text-sm font-semibold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 gap-2" data-testid="how-cta">
                Get started today <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
