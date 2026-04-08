import { Lock, Truck, Bell, Shield, BarChart3, MapPin } from "lucide-react";
import LandingLayout from "@/components/LandingLayout";

const features = [
  {
    icon: Lock,
    title: "Secure Smart Lockboxes",
    description: "Each parcel is protected by a unique OTP or QR code. Only you can unlock your delivery — no one else.",
  },
  {
    icon: Truck,
    title: "Real-Time Tracking",
    description: "Follow your package from dispatch to your doorstep with live status updates at every stage.",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description: "Receive SMS and in-app alerts the moment your delivery arrives or its status changes.",
  },
  {
    icon: Shield,
    title: "Tamper Detection",
    description: "Advanced monitoring alerts you and our team immediately if any tampering is detected on your box.",
  },
  {
    icon: BarChart3,
    title: "Admin Dashboard",
    description: "Full visibility over deliveries, couriers, boxes, and subscriptions — all in one powerful dashboard.",
  },
  {
    icon: MapPin,
    title: "Precise Location Pinning",
    description: "GPS-accurate delivery placement with up to 10-meter precision so packages always reach the right box.",
  },
];

export default function FeaturesPage() {
  return (
    <LandingLayout>
      <section className="min-h-[calc(100vh-14rem)] flex flex-col justify-center py-10 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Features</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-3">
              Everything you need, nothing you don't.
            </h1>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              Designed from the ground up to make parcel delivery secure, simple, and stress-free for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
