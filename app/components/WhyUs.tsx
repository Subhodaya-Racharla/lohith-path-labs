"use client";

import { useState } from "react";

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "Accurate Results",
    description: "Advanced equipment and strict quality controls ensure your results are precise and reliable every single time.",
    stat: "99.9%",
    statLabel: "Accuracy Rate",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Experienced Staff",
    description: "Our certified lab technicians and phlebotomists bring years of expertise, ensuring safe and comfortable testing.",
    stat: "10+",
    statLabel: "Years Experience",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Fast Reports",
    description: "Most test reports are ready within 24 hours. Urgent reports available for same-day delivery right to your WhatsApp.",
    stat: "24hr",
    statLabel: "Avg. Report Time",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    title: "Home Service",
    description: "Can't visit the lab? We come to you! Our home collection service makes diagnostics convenient for elderly and unwell patients.",
    stat: "Free",
    statLabel: "Home Collection",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Affordable Pricing",
    description: "Transparent pricing with no hidden charges. Quality diagnostics shouldn't break the bank. We offer fair rates for all tests.",
    stat: "Best",
    statLabel: "Price in Area",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Digital Reports",
    description: "Receive your reports digitally on WhatsApp. Easy to share with your doctor, store on your phone, and access anytime.",
    stat: "100%",
    statLabel: "Digital Delivery",
  },
];

export default function WhyUs() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? features : features.slice(0, 3);

  return (
    <section id="why-us" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Trusted by Thousands of{" "}
            <span className="gradient-text">Patients</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            We combine cutting-edge technology with compassionate care to deliver diagnostics you can trust.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl text-white shadow-md">
                  {feature.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold gradient-text">{feature.stat}</div>
                  <div className="text-xs text-slate-400 font-medium">{feature.statLabel}</div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 border-2 border-blue-200 text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors">
            {showAll ? "Show Less" : `Show More (${features.length - 3} more)`}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAll ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
        </div>

        <div className="mt-14 grid sm:grid-cols-3 gap-6 text-center">
          {[
            { value: "5,000+", label: "Tests Completed", icon: "🧪" },
            { value: "3,000+", label: "Happy Patients", icon: "❤️" },
            { value: "Medak", label: "Hussainpur, Telangana", icon: "📍" },
          ].map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
              <div className="text-4xl mb-2">{item.icon}</div>
              <div className="text-3xl font-bold mb-1">{item.value}</div>
              <div className="text-blue-100 text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
