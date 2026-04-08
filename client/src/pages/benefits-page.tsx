import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import LandingLayout from "@/components/LandingLayout";

const benefits = [
  {
    title: "No More Missed Deliveries",
    description: "Your smart box receives packages 24/7 even when you're away — no more 'sorry we missed you' cards.",
  },
  {
    title: "24/7 Secure Access",
    description: "Collect your parcels any time of day or night using your unique OTP or QR code.",
  },
  {
    title: "Works with All Couriers",
    description: "Any courier can drop off packages into your box — it's not tied to a single delivery service.",
  },
  {
    title: "SMS & In-App Alerts",
    description: "Get notified instantly via SMS and in-app message the moment a package arrives in your box.",
  },
  {
    title: "Tamper-Proof Hardware",
    description: "Our smart boxes feature tamper detection that alerts you and our team the moment anything unusual happens.",
  },
  {
    title: "Real-Time Tracking",
    description: "Follow each delivery from dispatch all the way to your smart box with live status updates.",
  },
  {
    title: "Battery Monitoring",
    description: "Box battery levels are continuously monitored with automatic alerts when charging is needed.",
  },
  {
    title: "Admin Oversight",
    description: "Administrators have full visibility into all boxes, couriers, and deliveries from a central dashboard.",
  },
];

export default function BenefitsPage() {
  return (
    <LandingLayout>
      <section className="min-h-[calc(100vh-14rem)] flex flex-col justify-center py-10 bg-primary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">Why Last Link Box</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
              Built for reliability.
            </h1>
            <p className="text-sm text-primary-foreground/70 max-w-xl mx-auto">
              Every feature is designed to give you complete peace of mind — from the moment a package ships to when it's in your hands.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {benefits.map(({ title, description }, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-colors">
                <div className="flex items-start gap-2.5 mb-2.5">
                  <CheckCircle className="w-4 h-4 text-white/80 flex-shrink-0 mt-0.5" />
                  <h3 className="text-sm font-semibold text-white leading-snug">{title}</h3>
                </div>
                <p className="text-xs text-primary-foreground/70 leading-relaxed pl-6">{description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="max-w-xl mx-auto text-center bg-white/10 rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">Ready to get started?</h3>
            <p className="text-sm text-primary-foreground/70 mb-5">
              Join residents and businesses already using Last Link Box across Kenya.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register">
                <Button className="rounded-full px-7 py-4 text-sm font-semibold bg-white text-primary hover:bg-gray-100 shadow-md gap-2" data-testid="cta-register">
                  Create free account <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="rounded-full px-6 py-4 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10">
                  Sign in instead
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
