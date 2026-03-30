const services = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: "Blood Testing",
    description: "Complete blood count, glucose, lipid profile, liver & kidney function tests. Comprehensive panels for all your diagnostic needs.",
    tests: ["CBC", "Blood Glucose", "Lipid Profile", "LFT / KFT"],
    color: "from-red-500 to-rose-400",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Thyroid Testing",
    description: "Accurate TSH, T3, T4 testing for thyroid health monitoring. Early detection of hypothyroidism and hyperthyroidism.",
    tests: ["TSH", "T3 & T4", "Free T3/T4", "Anti-TPO"],
    color: "from-purple-500 to-violet-400",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "ECG Testing",
    description: "State-of-the-art electrocardiogram testing to monitor heart health and detect cardiac abnormalities with precision.",
    tests: ["12-Lead ECG", "Resting ECG", "Rhythm Analysis", "Report Same Day"],
    color: "from-pink-500 to-rose-400",
    bg: "bg-pink-50",
    border: "border-pink-100",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    title: "Allergy Testing",
    description: "Comprehensive allergy panels to identify food, environmental, and skin allergens causing your symptoms.",
    tests: ["Food Allergy Panel", "Skin Allergy", "IgE Total", "Specific Allergens"],
    color: "from-yellow-500 to-orange-400",
    bg: "bg-yellow-50",
    border: "border-yellow-100",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    title: "Home Sample Collection",
    description: "Trained phlebotomists come to your doorstep. Safe, hygienic, and convenient sample collection from the comfort of home.",
    tests: ["Zero Extra Cost", "Trained Staff", "Safe & Hygienic", "Flexible Timing"],
    color: "from-green-500 to-emerald-400",
    bg: "bg-green-50",
    border: "border-green-100",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: "Online Booking",
    description: "Book tests instantly via WhatsApp or phone. Get digital reports on WhatsApp. No paperwork, no waiting.",
    tests: ["WhatsApp Booking", "Digital Reports", "Instant Confirmation", "Easy Follow-up"],
    color: "from-blue-500 to-cyan-400",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Comprehensive Diagnostic{" "}
            <span className="gradient-text">Testing</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            From routine blood tests to specialized diagnostics — everything under one roof with unmatched accuracy.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div
              key={i}
              className={`${service.bg} border ${service.border} rounded-2xl p-6 card-hover group`}
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.color} text-white mb-4 shadow-md`}>
                {service.icon}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{service.description}</p>

              {/* Test Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {service.tests.map((test) => (
                  <span
                    key={test}
                    className="text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-medium"
                  >
                    {test}
                  </span>
                ))}
              </div>

              {/* Book Button */}
              <a
                href={`/book?test=${encodeURIComponent(service.title)}`}
                className={`inline-flex items-center gap-2 bg-gradient-to-r ${service.color} text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity shadow-sm`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book This Test
              </a>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Not sure which test you need?</h3>
          <p className="text-blue-100 mb-6">Our experts are available to guide you — just give us a call or message on WhatsApp.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+919182147180"
              className="flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-full hover:bg-blue-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us
            </a>
            <a
              href="https://wa.me/919182147180?text=Hello%2C%20I%20need%20help%20selecting%20the%20right%20test"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
