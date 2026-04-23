"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);   // mobile drawer
  const [sidebarOpen, setSidebar]   = useState(false);   // desktop sidebar
  const { isSignedIn, user }        = useUser();
  const pathname                    = usePathname();
  const isAdmin                     =
    user?.publicMetadata?.role === "admin" ||
    user?.organizationMemberships?.length > 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const publicLinks = [
    { href: "/",        label: "Home",        icon: "🏠" },
    { href: "/about",   label: "About",       icon: "ℹ️" },
    { href: "/pricing", label: "Pricing",     icon: "💎" },
    { href: "/contact", label: "Contact",     icon: "✉️" },
  ];

  const authLinks = [
    { href: "/tracking",  label: "Track Order", icon: "📦" },
    { href: "/dashboard", label: "Dashboard",   icon: "📊" },
  ];

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

  const sidebarLinkCls = (href, accent = false) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
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
      {/* ══════════════════ TOP NAVBAR ══════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 h-[68px] flex items-center justify-between transition-all duration-300 ${
          scrolled || menuOpen
            ? "bg-bg/90 backdrop-blur-xl border-b border-border"
            : "bg-transparent"
        }`}
      >
        {/* Left: sidebar toggle (desktop) + logo */}
        <div className="flex items-center gap-3">
          {/* Sidebar toggle — desktop only */}
          <button
            onClick={() => setSidebar((v) => !v)}
            aria-label="Toggle sidebar"
            className="hidden md:flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-elevated transition-colors gap-[5px] flex-shrink-0"
          >
            <span className="block h-[2px] w-5 bg-primary rounded-full" />
            <span className="block h-[2px] w-5 bg-primary rounded-full" />
            <span className="block h-[2px] w-5 bg-primary rounded-full" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
           
            <span className="font-display font-bold text-lg tracking-tight text-white">
              Linked<span className="text-orange-500">2buy</span>
            </span>
          </Link>
        </div>

        {/* Center: desktop inline links (visible when sidebar is closed) */}
        <div
          className={`hidden md:flex items-center gap-1 transition-all duration-300 ${
            sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {publicLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === href
                  ? "bg-elevated text-primary"
                  : "text-secondary hover:text-primary hover:bg-elevated"
              }`}
            >
              {label}
            </Link>
          ))}
      
        </div>

        {/* Right: auth + mobile hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium border border-border text-secondary hover:text-primary hover:border-border-light transition-all cursor-pointer bg-transparent">
                  Sign In
                </button>
              </SignInButton>
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
            <span className={`block h-[2px] w-5 bg-primary rounded-full transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block h-[2px] w-5 bg-primary rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block h-[2px] w-5 bg-primary rounded-full transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* ══════════════════ DESKTOP SIDEBAR ══════════════════ */}
      {/* Backdrop */}
      <div
        onClick={() => setSidebar(false)}
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 hidden md:block ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <div
        className={`fixed top-[68px] left-0 bottom-0 z-40 hidden md:flex flex-col w-64 bg-bg/95 backdrop-blur-xl border-r border-border transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* User info */}
        {isSignedIn && (
          <div className="p-4 border-border">
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-primary truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-secondary truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">

          {isSignedIn && (
            <>
              <div className="my-2 border-t border-border" />
              
              {authLinks.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebar(false)}
                  className={sidebarLinkCls(href)}
                >
                  {/* <span className="text-base">{icon}</span> */}
                  <span>{label}</span>
                </Link>
              ))}
            </>
          )}

          {isSignedIn && isAdmin && (
            <>
              <div className="my-2 border-t border-border" />
              
              <Link
                href="/admin-dashboard"
                onClick={() => setSidebar(false)}
                className={sidebarLinkCls("/admin-dashboard", true)}
              >
                <span>Admin</span>
              </Link>
            </>
          )}
        </nav>

        {/* Bottom: sign in CTA if not signed in */}
        {!isSignedIn && (
          <div className="p-4 border-t border-border flex flex-col  gap-2">
            <SignInButton mode="modal">
              <button className="w-full py-2.5 rounded-xl text-sm font-medium border border-border text-secondary hover:text-primary transition-all cursor-pointer bg-transparent">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-accent text-bg hover:bg-accent-dim transition-all cursor-pointer border-none font-display">
                Get Started
              </button>
            </SignUpButton>
          </div>
        )}

        
      </div>

      {/* ══════════════════ MOBILE DRAWER ══════════════════ */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      <div
        className={`fixed top-[68px] left-0 right-0 z-40 md:hidden transition-all duration-300 ease-in-out ${
          menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="mx-3 rounded-2xl border border-border bg-bg/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-3 flex flex-col gap-1">
            {publicLinks.map(({ href, label, icon }) => (
              <Link key={href} href={href} className={mobileLinkCls(href)}>
                {label}
              </Link>
            ))}

            {isSignedIn && (
              <>
                <div className="my-1 border-t border-border" />
                {authLinks.map(({ href, label, icon }) => (
                  <Link key={href} href={href} className={mobileLinkCls(href)}>
                    {label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link href="/admin-dashboard" className={mobileLinkCls("/admin-dashboard", true)}>
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

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