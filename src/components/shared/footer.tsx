"use client";

import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          {/* Company */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Gilbrice Logistics"
                width={50}
                height={50}
                className="rounded-xl"
              />
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Gilbrice Logistics
                </h3>
                <p className="text-slate-400 text-sm">
                  Air • Sea • Ground Freight
                </p>
              </div>
            </Link>
            <p className="mt-6 text-slate-400 leading-relaxed">
              A multi-partner shipping network connecting independent freight
              partners with customers worldwide — real-time tracking,
              transparent pricing, and end-to-end delivery visibility.
            </p>
            <div className="flex gap-4 mt-8">
              <Link
                href="#"
                target="_blank"
                className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-teal-600 transition"
              >
                <Facebook size={18} className="text-white" />
              </Link>

              <Link
                href="#"
                target="_blank"
                className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-teal-600 transition"
              >
                <Linkedin size={18} className="text-white" />
              </Link>

              <Link
                href="#"
                target="_blank"
                className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-teal-600 transition"
              >
                <Instagram size={18} className="text-white" />
              </Link>

              <Link
                href="#"
                target="_blank"
                className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-teal-600 transition"
              >
                <Twitter size={18} className="text-white" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xl font-semibold mb-6">
              Quick Links
            </h4>

            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white">
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/tracking"
                  className="text-slate-400 hover:text-white"
                >
                  Track a Shipment
                </Link>
              </li>

              <li>
                <Link href="/about" className="text-slate-400 hover:text-white">
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-white"
                >
                  Become a Partner
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white text-xl font-semibold mb-6">Services</h4>

            <ul className="space-y-4">
              <li className="text-slate-400">Air Freight</li>
              <li className="text-slate-400">Sea Freight</li>
              <li className="text-slate-400">Partner Network</li>
              <li className="text-slate-400">Real-Time Tracking</li>
              <li className="text-slate-400">Master Manifests</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-xl font-semibold mb-6">
              Cameroon Contact
            </h4>

            <div className="space-y-5">
              <div className="flex gap-3 text-slate-400">
                <Mail className="mt-1" size={18} />
                <span className="text-slate-400">
                  support@gilbricelogistics.com
                </span>
              </div>

              <div className="flex gap-3 text-slate-400">
                <Phone className="mt-1 text-slate-400" size={18} />
                Founder:
                <span className="text-slate-400">+1 (304) 907-7812</span>
              </div>

              <div className="flex gap-3 text-slate-400">
                <MapPin className=" mt-1" size={18} /> Advisor:
                <span className="text-slate-400">+1 (240) 547-8094</span>
              </div>

              <div className="flex gap-3 text-slate-400">
                <MapPin className=" mt-1" size={18} /> Address
                <span className="text-slate-400">
                  Reynoldsburg, OH 43068, USA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Gilbrice Logistics. All rights
            reserved.
          </p>

          <div className="flex gap-6">
            <Link
              href="/privacy-policy"
              className="text-slate-500 hover:text-white text-sm"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="text-slate-500 hover:text-white text-sm"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
