import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { getSettings } from "@/features/cms/services/cmsApi";
import type { SettingsContent } from "@/features/cms/types";

const EMPTY_SETTINGS: SettingsContent = {
  social: {},
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  whatsappNumber: "",
};

export function Footer() {
  const { data: settings } = useQuery({
    queryKey: ["cms-settings"],
    queryFn: () => getSettings().catch(() => EMPTY_SETTINGS),
  });
  const social = settings?.social ?? {};
  const socialLinks = [
    { I: Facebook, href: social.facebook },
    { I: Instagram, href: social.instagram },
    { I: Twitter, href: social.twitter },
    { I: Youtube, href: social.youtube },
  ];
  return (
    <footer className="border-t bg-muted/40 mt-12">
      <div className="px-6 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <Logo />
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            Safar ka saath, Swaad ke saath. Hygienic, fresh meals delivered to your train seat.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/offers" className="hover:text-primary">
                Offers
              </Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-primary">
                Menu
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Help</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/help" className="hover:text-primary">
                Help & Support
              </Link>
            </li>
            <li>
              <Link to="/track" className="hover:text-primary">
                Track Order
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-primary">
                My Orders
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/privacy" className="hover:text-primary">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-primary">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-primary">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} SRFOOD – Shreeradhefood. All rights reserved.</span>
        <div className="flex items-center gap-3">
          <span>Follow Us</span>
          {socialLinks.map(({ I, href }, i) => (
            <a
              key={i}
              href={href || "#"}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 grid place-items-center rounded-full bg-background border hover:text-primary hover:border-primary transition"
            >
              <I className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
