"use client";

import { useState, useEffect } from "react";
import { useCart } from "../CartContext";

export default function V2Navbar({ dark }: { dark?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links: { href: string; label: string }[] = [];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${(scrolled || dark) ? "nav-blur shadow-lg shadow-black/20" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/v2" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <span className="text-white font-bold text-sm leading-tight block">Lohith Path Labs</span>
              <span className="text-blue-300 text-xs">Advanced Quality Testing</span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <a key={l.href} href={l.href} className="text-slate-300 hover:text-white text-sm font-medium transition-colors">{l.label}</a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/v2/reports" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              My Reports
            </a>
            <a href="/v2/tests"
              className="relative flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Book Tests
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </a>
          </div>

          {/* Mobile: cart badge + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <a href="/v2/tests" className="relative p-2 text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </a>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden nav-blur border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setIsOpen(false)}
                className="block text-slate-300 hover:text-white text-sm font-medium py-2 transition-colors">{l.label}</a>
            ))}
            <a href="/v2/reports" onClick={() => setIsOpen(false)}
              className="block text-slate-300 hover:text-white text-sm font-medium py-2 transition-colors">My Reports</a>
            <a href="/v2/tests" onClick={() => setIsOpen(false)}
              className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-3 rounded-full transition-colors">
              Book Tests {count > 0 && `(${count} in cart)`}
            </a>
            <a href="tel:+919182147180"
              className="block text-center border border-white/30 text-white text-sm font-semibold px-4 py-3 rounded-full">
              Call Now: +91 91821 47180
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
