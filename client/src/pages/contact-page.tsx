import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, Building2, Send } from "lucide-react";
import LandingLayout from "@/components/LandingLayout";

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Missing fields", description: "Please fill in your name, email, and message.", variant: "destructive" });
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    toast({ title: "Message sent!", description: "We'll get back to you at " + form.email });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <LandingLayout>
      <section className="min-h-[calc(100vh-14rem)] flex flex-col justify-center py-10 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Contact Us</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-3">Get in touch.</h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Have a question, need a demo, or want to learn more? We're happy to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Info + Map */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="tel:+254722714242" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group" data-testid="contact-phone-1">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Call Us</p>
                    <p className="text-sm font-semibold text-gray-900">+254 722 714 242</p>
                  </div>
                </a>

                <a href="tel:+254722509540" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group" data-testid="contact-phone-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Call Us</p>
                    <p className="text-sm font-semibold text-gray-900">+254 722 509 540</p>
                  </div>
                </a>

                <a href="mailto:info@lastlinkbox.com" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group sm:col-span-2" data-testid="contact-email">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email Us</p>
                    <p className="text-sm font-semibold text-gray-900">info@lastlinkbox.com</p>
                  </div>
                </a>

                <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100 sm:col-span-2" data-testid="contact-address">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Office</p>
                    <p className="text-sm font-semibold text-gray-900">Simco Building, 2nd Floor</p>
                    <p className="text-xs text-gray-500">Lusaka Road, P.O Box 3726-00506, Nairobi, Kenya</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-1" style={{ minHeight: "200px" }}>
                <iframe
                  title="Last Link Box Office Location"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=36.8395%2C-1.3040%2C36.8490%2C-1.2970&layer=mapnik&marker=-1.2988%2C36.8440"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "200px" }}
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

            {/* Right: Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Send us a message</h3>
              <p className="text-xs text-gray-500 mb-5">Fill in the form below and we'll respond as soon as possible.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="contact-name" className="text-xs font-medium">Full Name <span className="text-red-500">*</span></Label>
                    <Input id="contact-name" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} className="h-9 text-sm" data-testid="input-contact-name" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="contact-phone" className="text-xs font-medium">Phone Number</Label>
                    <Input id="contact-phone" name="phone" type="tel" placeholder="+254 700 000 000" value={form.phone} onChange={handleChange} className="h-9 text-sm" data-testid="input-contact-phone" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact-email" className="text-xs font-medium">Email Address <span className="text-red-500">*</span></Label>
                  <Input id="contact-email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="h-9 text-sm" data-testid="input-contact-email" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contact-message" className="text-xs font-medium">Message <span className="text-red-500">*</span></Label>
                  <Textarea id="contact-message" name="message" placeholder="Tell us how we can help you..." rows={4} value={form.message} onChange={handleChange} className="resize-none text-sm" data-testid="input-contact-message" />
                </div>
                <Button type="submit" className="w-full rounded-xl py-4 text-sm font-semibold bg-primary hover:bg-primary/90 gap-2" disabled={sending} data-testid="button-contact-submit">
                  {sending ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...</>
                  ) : (
                    <><Send className="w-3.5 h-3.5" /> Send Message</>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
