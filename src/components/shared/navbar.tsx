"use client";

import { getDashboardPath } from "@/lib/route";
import { logout, selectCurrentUser } from "@/Redux/Features/Auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/Redux/hook";
import { persistor } from "@/Redux/store";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Phone,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const [openPartners, setOpenPartners] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogOut = () => {
    dispatch(logout());
    persistor.purge();
    router.push("/");
  };

  const linkClasses = (href: string) =>
    `relative text-[15px] font-medium transition-all duration-300 px-1 ${
      pathname === href ? "text-white" : "text-slate-300 hover:text-white"
    }`;

  return (
    <>
      {/* TOP BANNER */}
      <div className="hidden md:block bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex h-10 items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-slate-400">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span>support@gilbricelogistics.com</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={14} />
                <span>+880 1XXX-XXXXXX</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/contact">
                <Button className="hidden md:flex rounded-xl px-5 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 shadow-lg">
                  Become a Partner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* NAVBAR FULL BACKGROUND */}
      <div
        className={`w-full transition-all duration-500 ${
          scrolled
            ? "fixed top-0 left-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-lg"
            : "relative bg-slate-950"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex justify-between items-center h-20">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <Link href="/" className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Gilbrice <span className="text-amber-400">Logistics</span>
                </h2>
              </div>
            </Link>
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <Link href="/" className={linkClasses("/")}>
                Home
              </Link>

              <Link href="/tracking" className={linkClasses("/tracking")}>
                Track a Shipment
              </Link>

              {/* SERVICES DROPDOWN */}
              <div className="group relative">
                <button className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer transition">
                  Services
                  <ChevronDown size={15} />
                </button>

                <div className="absolute left-0 top-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pt-6 z-50">
                  <div className="w-[700px] rounded-3xl bg-white p-8 shadow-2xl">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-bold mb-4 text-black">
                          Freight Services
                        </h3>

                        <div className="flex flex-col gap-3">
                          <Link href="/services/air-freight">Air Freight</Link>

                          <Link href="/services/sea-freight">Sea Freight</Link>

                          <Link href="/services/manifests">
                            Master Manifests
                          </Link>

                          <Link href="/services/reporting">
                            Reports & Statements
                          </Link>
                        </div>
                      </div>

                      <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-teal-900 p-6 text-white">
                        <h4 className="font-bold text-lg">
                          Real-Time Tracking
                        </h4>

                        <p className="mt-3 text-teal-100">
                          Track any shipment by number, no account required —
                          from received to delivered.
                        </p>

                        <Link href="/tracking">
                          <Button className="mt-5 bg-white text-teal-800 hover:bg-slate-100">
                            Track Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOR PARTNERS DROPDOWN */}
              <div className="group relative">
                <button className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer transition">
                  For Partners
                  <ChevronDown size={15} />
                </button>
                <div className="absolute left-0 top-full opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pt-6 z-50">
                  <div className="w-[650px] rounded-3xl bg-white p-8 shadow-2xl">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col gap-3">
                        <Link href="/partners/overview">Partner Network</Link>

                        <Link href="/partners/pricing">Wholesale Pricing</Link>

                        <Link href="/partners/dashboard">
                          Partner Dashboard
                        </Link>

                        <Link href="/partners/branding">
                          Custom Tracking & Branding
                        </Link>
                      </div>

                      <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 p-6 text-white">
                        <h4 className="font-bold text-lg">Become a Partner</h4>

                        <p className="mt-3 text-amber-100">
                          Run your own shipping brand on the Gilbrice network —
                          your customers, your rates, your growth.
                        </p>

                        <Link href="/contact">
                          <Button className="mt-5 bg-white text-amber-800 hover:bg-slate-100">
                            Apply Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/about" className={linkClasses("/about")}>
                About
              </Link>

              <Link href="/contact" className={linkClasses("/contact")}>
                Contact
              </Link>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Avatar className="cursor-pointer">
                      <AvatarImage
                        src={currentUser?.profilePicture}
                        className="w-10 h-10 rounded-full"
                      />
                      <AvatarFallback>User</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="bg-teal-900 border-teal-700 text-white">
                    <DropdownMenuLabel>{user.role}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link
                        href={getDashboardPath(user?.role)}
                        className="flex gap-2 items-center text-white hover:text-black text-center"
                      >
                        <LayoutDashboard size={18} />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogOut}
                      className="flex gap-2 items-center text-white hover:text-black cursor-pointer"
                    >
                      <LogOut size={18} /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-5 shadow-sm">
                    <LogIn size={18} />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </nav>

          {/* MOBILE MENU */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-500 ${
              isOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {isOpen && (
              <div className="md:hidden bg-slate-950 text-white border-t border-slate-800">
                <div className="px-5 py-6 space-y-5">
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    Home
                  </Link>

                  <Link href="/tracking" onClick={() => setIsOpen(false)}>
                    Track a Shipment
                  </Link>

                  {/* Services */}
                  <div>
                    <button
                      onClick={() => setOpenServices(!openServices)}
                      className="w-full flex justify-between cursor-pointer"
                    >
                      Services
                    </button>

                    {openServices && (
                      <div className="ml-4 mt-3 flex flex-col gap-3 text-slate-400">
                        <Link href="/services/air-freight">Air Freight</Link>
                        <Link href="/services/sea-freight">Sea Freight</Link>
                        <Link href="/services/manifests">Master Manifests</Link>
                        <Link href="/services/reporting">
                          Reports & Statements
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* For Partners */}
                  <div>
                    <button
                      onClick={() => setOpenPartners(!openPartners)}
                      className="w-full flex justify-between cursor-pointer"
                    >
                      For Partners
                    </button>

                    {openPartners && (
                      <div className="ml-4 mt-3 flex flex-col gap-3 text-slate-400">
                        <Link href="/partners/overview">Partner Network</Link>
                        <Link href="/partners/pricing">Wholesale Pricing</Link>
                        <Link href="/partners/dashboard">
                          Partner Dashboard
                        </Link>
                        <Link href="/partners/branding">
                          Custom Tracking & Branding
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link href="/about" onClick={() => setIsOpen(false)}>
                    About
                  </Link>

                  <Link href="/contact" onClick={() => setIsOpen(false)}>
                    Contact
                  </Link>

                  <div className="pt-4 border-t border-slate-800">
                    <Button className="w-full bg-teal-700">
                      Become a Partner
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
