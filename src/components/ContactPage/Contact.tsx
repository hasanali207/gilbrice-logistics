"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";

const Contact = () => {
  return (
    <section
      id="contact"
      className="relative overflow-hidden py-24 bg-slate-900 text-white"
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="px-4 py-2 rounded-full bg-blue-600/20 text-blue-400 text-sm border border-blue-500/30">
            Contact Us
          </span>

          <h2 className="text-4xl md:text-6xl font-bold mt-6">
            Let's Build Something Amazing Together
          </h2>

          <p className="text-slate-400 mt-6 text-lg">
            Have an idea, project, or business challenge? Let's discuss how
            Devixo can help transform your vision into powerful digital
            solutions.
          </p>
        </motion.div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 mt-20 ">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <h3 className="text-3xl font-bold mb-6">Send Us a Message</h3>

            <form className="space-y-5">
              <div>
                <label className="block mb-2 text-slate-300">Full Name</label>

                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-slate-300">
                  Email Address
                </label>

                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-slate-300">Subject</label>

                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-slate-300">Message</label>

                <textarea
                  rows={5}
                  placeholder="Tell us about your project..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                Send Message
                <Send size={18} />
              </button>
            </form>
          </motion.div>

          {/* Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-3xl font-bold mb-8">Contact Information</h3>

              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                    <Mail className="text-blue-400" />
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm">Email</p>

                    <h4 className="text-lg font-medium">
                      devixo.web@gmail.com
                    </h4>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 flex items-center justify-center">
                    <Phone className="text-cyan-400" />
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm">Phone</p>

                    <h4 className="text-lg font-medium">+880 1575533398</h4>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center">
                    <MapPin className="text-purple-400" />
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm">Office</p>

                    <h4 className="text-lg font-medium">
                      Gulshan-1, Dhaka, Bangladesh
                    </h4>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="mt-10">
                <a
                  href="https://wa.me/8801575533398"
                  target="_blank"
                  className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]"
                >
                  <MessageCircle />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Extra Card */}
            <div className="mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8">
              <h3 className="text-2xl font-bold">Need a Custom Solution?</h3>

              <p className="mt-3 text-white/80">
                We specialize in ERP Systems, SaaS Platforms, Logistics
                Software, School Management Systems, and Enterprise Web
                Applications.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
