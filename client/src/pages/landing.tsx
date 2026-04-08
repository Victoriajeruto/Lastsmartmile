import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Shield,
  Zap,
  Bell,
  MapPin,
  Lock,
  ChevronRight,
  CheckCircle,
  Truck,
  BarChart3,
  ArrowRight,
  Phone,
  Mail,
  Building2,
  Send,
  Home,
} from "lucide-react";
import companyLogo from "@assets/Last_Link_Box_1769242505355.png";

const features = [
  {
    icon: Lock,
    title: "Secure Smart Lockboxes",
    description:
      "Each parcel is protected by a unique OTP or QR code. Only you can unlock your delivery.",
  },
  {
    icon: Truck,
    title: "Real-Time Tracking",
    description:
      "Follow your package from dispatch to your doorstep with live status updates.",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description:
      "Receive SMS and in-app alerts the moment your delivery arrives or changes status.",
  },
  {
    icon: Shield,
    title: "Tamper Detection",
    description:
      "Advanced monitoring alerts you and our team immediately if tampering is detected.",
  },
  {
    icon: BarChart3,
    title: "Admin Dashboard",
    description:
      "Full visibility over deliveries, couriers, boxes, and subscriptions in one place.",
  },
  {
    icon: MapPin,
    title: "Precise Location Pinning",
    description:
      "GPS-accurate delivery placement so your packages always reach the right box.",
  },
];

const steps = [
  {
    step: "01",
    title: "Register & Get Your Box",
    description:
      "Sign up, enter your smart box code, and pin your location on the map.",
  },
  {
    step: "02",
    title: "Receive Deliveries Securely",
    description:
      "Couriers drop off packages in your locked smart box — no waiting required.",
  },
  {
    step: "03",
    title: "Unlock & Collect",
    description:
      "Get notified, then use your OTP or QR code to open your box at any time.",
  },
];

const benefits = [
  "No more missed deliveries",
  "24/7 secure access",
  "Works with all couriers",
  "SMS & in-app alerts",
  "Tamper-proof hardware",
  "Real-time tracking",
];

export default function Landing() {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContactForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Missing fields",
        description: "Please fill in your name, email, and message.",
        variant: "destructive",
      });
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    toast({
      title: "Message sent!",
      description: "We'll get back to you shortly at " + contactForm.email,
    });
    setContactForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <img
                src={companyLogo}
                alt="Last Link Box"
                className="w-9 h-9 object-contain"
              />
              <span className="font-bold text-lg text-gray-900 tracking-tight group-hover:text-primary transition-colors">
                Last Link Box
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Home
            </a>
            <a href="#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#benefits" className="hover:text-primary transition-colors">
              Benefits
            </a>
            <a href="#contact" className="hover:text-primary transition-colors">
              Contact
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-sm font-medium text-gray-700 hover:text-primary"
                data-testid="nav-login"
              >
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button
                className="text-sm font-semibold rounded-full px-5 bg-primary hover:bg-primary/90 shadow-sm"
                data-testid="nav-register"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5"></div>
          <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] rounded-full bg-primary/5"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-primary/3"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <Zap className="w-3.5 h-3.5" />
            Smart Parcel Delivery — Reimagined
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.08] mb-6">
            Deliveries that{" "}
            <span className="text-primary">wait for you,</span>
            <br />
            not the other way.
          </h1>

          <p className="text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Last Link Box is a secure automated lockbox system that receives
            your parcels, notifies you instantly, and lets you collect at your
            convenience — safely, every time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2"
                data-testid="hero-cta-register"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-base font-semibold border-gray-200 hover:border-primary hover:text-primary gap-2"
                data-testid="hero-cta-login"
              >
                Sign in
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            Trusted by residents, couriers, and administrators across Kenya.
          </p>
        </div>

        {/* Hero visual cards */}
        <div className="relative max-w-5xl mx-auto mt-16 px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary/8 via-primary/4 to-transparent border border-primary/10 p-8 lg:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none rounded-3xl"></div>
            <div className="grid grid-cols-3 gap-4 lg:gap-6 relative z-10">
              {[
                { icon: Package, label: "Parcel Delivered", sub: "KB-2341 · Just now", color: "text-primary" },
                { icon: Lock, label: "Box Secured", sub: "OTP expires in 10 min", color: "text-emerald-500" },
                { icon: Bell, label: "You're Notified", sub: "SMS + in-app alert sent", color: "text-amber-500" },
              ].map(({ icon: Icon, label, sub, color }, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-gray-100 flex flex-col gap-3"
                >
                  <div className={`w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Everything you need,
              <br />
              nothing you don't.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              How It Works
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Simple. Secure. Smart.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ step, title, description }, i) => (
              <div key={i} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-primary/30 to-transparent z-0"></div>
                )}
                <div className="relative z-10 inline-flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <span className="text-xl font-bold text-primary">{step}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Strip */}
      <section id="benefits" className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
              Built for reliability.
            </h2>
            <p className="text-primary-foreground/70 text-base">
              Every feature designed to give you peace of mind.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 bg-white/10 rounded-2xl p-5 text-center"
              >
                <CheckCircle className="w-5 h-5 text-white/80" />
                <span className="text-sm font-medium text-white">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-5">
            Ready to secure your deliveries?
          </h2>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            Join residents and businesses already using Last Link Box for
            smarter, safer parcel management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="rounded-full px-10 py-6 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 gap-2"
                data-testid="cta-register"
              >
                Create free account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full px-8 py-6 text-base font-medium text-gray-600 hover:text-primary"
                data-testid="cta-login"
              >
                Already have an account? Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Contact Us
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Get in touch.
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Have a question or want to learn more? Reach out — we're happy to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left: Contact Info + Map */}
            <div className="flex flex-col gap-6">
              {/* Contact cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone 1 */}
                <a
                  href="tel:+254722714242"
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group"
                  data-testid="contact-phone-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Call Us</p>
                    <p className="text-sm font-semibold text-gray-900">+254 722 714 242</p>
                  </div>
                </a>

                {/* Phone 2 */}
                <a
                  href="tel:+254722509540"
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group"
                  data-testid="contact-phone-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Call Us</p>
                    <p className="text-sm font-semibold text-gray-900">+254 722 509 540</p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:info@lastlinkbox.com"
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group sm:col-span-2"
                  data-testid="contact-email"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email Us</p>
                    <p className="text-sm font-semibold text-gray-900">info@lastlinkbox.com</p>
                  </div>
                </a>

                {/* Office Address */}
                <div
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 sm:col-span-2"
                  data-testid="contact-address"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Office</p>
                    <p className="text-sm font-semibold text-gray-900">Simco Building, 2nd Floor</p>
                    <p className="text-sm text-gray-500">Lusaka Road, P.O Box 3726-00506</p>
                    <p className="text-sm text-gray-500">Nairobi, Kenya</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-72">
                <iframe
                  title="Last Link Box Office Location"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=36.8395%2C-1.3040%2C36.8490%2C-1.2970&layer=mapnik&marker=-1.2988%2C36.8440"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  data-testid="office-map"
                ></iframe>
              </div>
              <a
                href="https://www.openstreetmap.org/?mlat=-1.2988&mlon=36.8440#map=17/-1.2988/36.8440"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline text-center"
              >
                View larger map →
              </a>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Send us a message</h3>
              <p className="text-sm text-gray-500 mb-6">
                Fill in the form below and we'll respond as soon as possible.
              </p>
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name" className="text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact-name"
                      name="name"
                      placeholder="John Doe"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      placeholder="+254 700 000 000"
                      value={contactForm.phone}
                      onChange={handleContactChange}
                      data-testid="input-contact-phone"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    data-testid="input-contact-email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-message" className="text-sm font-medium">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    value={contactForm.message}
                    onChange={handleContactChange}
                    className="resize-none"
                    data-testid="input-contact-message"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-xl py-5 font-semibold bg-primary hover:bg-primary/90 gap-2"
                  disabled={sending}
                  data-testid="button-contact-submit"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src={companyLogo}
              alt="Last Link Box"
              className="w-7 h-7 object-contain"
            />
            <span className="text-sm font-semibold text-gray-700">Last Link Box</span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Last Link Box. Smart Postal Delivery System.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/installation-request">
              <span className="hover:text-primary transition-colors cursor-pointer">
                Request Installation
              </span>
            </Link>
            <a href="#contact" className="hover:text-primary transition-colors">
              Contact
            </a>
            <Link href="/login">
              <span className="hover:text-primary transition-colors cursor-pointer">
                Sign In
              </span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
