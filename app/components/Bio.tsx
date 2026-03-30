"use client";

import { useEffect, useState } from "react";
import { supabase, type Bio } from "@/lib/supabase";

export default function Bio() {
  const [bio, setBio] = useState<Bio | null>(null);

  useEffect(() => {
    supabase.from("bio").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) setBio(data as Bio);
    });
  }, []);

  if (!bio || !bio.name) return null;

  const fields = [
    { value: bio.title, show: bio.show_title, icon: "🏥" },
    { value: bio.qualification, show: bio.show_qualification, icon: "🎓" },
    { value: bio.experience, show: bio.show_experience, icon: "⏱️" },
    { value: bio.specialization, show: bio.show_specialization, icon: "🔬" },
  ].filter((f) => f.show && f.value);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">
            About Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Meet Our{" "}
            <span className="gradient-text">Expert</span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl mx-auto">
          {/* Photo */}
          <div className="shrink-0">
            <div className="w-48 h-48 rounded-full overflow-hidden bg-slate-100 border-4 border-blue-100 shadow-lg">
              {bio.photo_url ? (
                <img src={bio.photo_url} alt={bio.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{bio.name}</h3>

            {fields.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                {fields.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full font-medium">
                    <span>{f.icon}</span>
                    {f.value}
                  </span>
                ))}
              </div>
            )}

            {bio.show_about && bio.about && (
              <p className="mt-5 text-slate-600 leading-relaxed text-base">{bio.about}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
