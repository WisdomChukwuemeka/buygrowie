"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn, user }    = useUser();
  const pathname                = usePathname();
  const isAdmin                 =
    user?.publicMetadata?.role === "admin" ||
    user?.organizationMemberships?.length > 0;

  /* ── scroll listener ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── close drawer on route change ── */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /* ── lock body scroll when drawer is open ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const publicLinks = [
    { href: "/",        label: "Home"    },
    { href: "/about",   label: "About"   },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ];

  const authLinks = [
    { href: "/tracking",   label: "Track Order" },
    { href: "/dashboard",  label: "Dashboard"   },
  ];

  /* ── shared link style helper ── */
  const linkCls = (href, accent = false) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      accent
        ? pathname === href
          ? "bg-accent/20 text-accent"
          : "text-secondary hover:text-accent hover:bg-accent/10"
        : pathname === href
          ? "bg-elevated text-primary"
          : "text-secondary hover:text-primary hover:bg-elevated"
    }`;

  /* ── mobile link style ── */
  const mobileLinkCls = (href, accent = false) =>
    `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      accent
        ? pathname === href
          ? "bg-accent/20 text-accent"
          : "text-secondary hover:text-accent hover:bg-accent/10"
        : pathname === href
          ? "bg-elevated text-primary"
          : "text-secondary hover:text-primary hover:bg-elevated"
    }`;

  return (
    <>
      {/* ════════════════════════ NAVBAR BAR ════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 h-[68px] flex items-center justify-between transition-all duration-300 ${
          scrolled || menuOpen
            ? "bg-bg/90 backdrop-blur-xl border-b border-border"
            : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-bg font-display font-black text-base">
            S
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Snap<span className="text-accent">Search</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {publicLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={linkCls(href)}>
              {label}
            </Link>
          ))}

          {isSignedIn &&
            authLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={linkCls(href)}>
                {label}
              </Link>
            ))}

          {isSignedIn && isAdmin && (
            <Link href="/admin-dashboard" className={linkCls("/admin-dashboard", true)}>
              ⚙ Admin
            </Link>
          )}
        </div>

        {/* Right side: auth + hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Auth — always visible */}
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium border border-border text-secondary hover:text-primary hover:border-border-light transition-all cursor-pointer bg-transparent">
                  Sign In
                </button>
              </SignInButton>

              {/* "Get Started" hidden on very small screens to save space */}
              <SignUpButton mode="modal">
                <button className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-bold bg-accent text-bg hover:bg-accent-dim transition-all cursor-pointer border-none font-display">
                  Get Started
                </button>
              </SignUpButton>
            </>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-elevated transition-colors gap-[5px]"
          >
            <span
              className={`block h-[2px] w-5 bg-primary rounded-full transition-all duration-300 origin-center ${
                menuOpen ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-5 bg-primary rounded-full transition-all duration-300 ${
                menuOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-5 bg-primary rounded-full transition-all duration-300 origin-center ${
                menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* ════════════════════════ MOBILE DRAWER ════════════════════════ */}
      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-[68px] left-0 right-0 z-40 md:hidden transition-all duration-300 ease-in-out ${
          menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="mx-3 rounded-2xl border border-border bg-bg/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Nav links */}
          <div className="p-3 flex flex-col gap-1">
            {publicLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={mobileLinkCls(href)}>
                {label}
              </Link>
            ))}

            {isSignedIn && (
              <>
                <div className="my-1 border-t border-border" />
                {authLinks.map(({ href, label }) => (
                  <Link key={href} href={href} className={mobileLinkCls(href)}>
                    {label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href="/admin-dashboard"
                    className={mobileLinkCls("/admin-dashboard", true)}
                  >
                    ⚙ Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile CTA — shown only when signed-out (Get Started hidden on xs) */}
          {!isSignedIn && (
            <div className="px-3 pb-3 sm:hidden">
              <SignUpButton mode="modal">
                <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-accent text-bg hover:bg-accent-dim transition-all cursor-pointer border-none font-display">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </>
  );
}