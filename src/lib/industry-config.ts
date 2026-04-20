// ── Industry Groups (for profile dropdown) ────────────────────────────────────

export interface IndustryGroup {
  group: string;
  icon: string;
  color: string;
  items: string[];
}

export const INDUSTRY_GROUPS: IndustryGroup[] = [
  {
    group: "Core Home Trades",
    icon: "fa-house",
    color: "#ea580c",
    items: ["HVAC & Cooling", "Plumbing", "Electrical", "Roofing"],
  },
  {
    group: "Project-Based Trades",
    icon: "fa-person-digging",
    color: "#7c3aed",
    items: ["General Contractors", "Flooring", "Painting", "Windows & Doors", "Concrete & Paving"],
  },
  {
    group: "Outdoor & Recurring Services",
    icon: "fa-leaf",
    color: "#16a34a",
    items: ["Landscaping", "Tree Services", "Pest Control", "Pool & Spa", "Pressure Washing", "Cleaning Services"],
  },
  {
    group: "Health, Wellness & Med Services",
    icon: "fa-heart-pulse",
    color: "#e11d48",
    items: ["Med Spa & Aesthetics", "Dental & Orthodontics", "Physical Therapy", "Chiropractic Care", "Mental Health", "Local Clinics", "Veterinary"],
  },
];

// ── Industry Config (for intake page template) ────────────────────────────────

export interface IndustryConfig {
  group: string;
  heroImage: string;
  heroHeadlinePrefix: string;  // "[prefix] in {city}"
  ctaLabel: string;            // button copy
  urgencyText: string;         // strip below form header
  servicesLabel: string;
  services: { icon: string; label: string }[];
  jobTypes: string[];
  trustBullets: string[];      // first 2 are static; page appends dynamic ones
  aboutLabel: string;
  schemaType: string;
  faqs: { q: string; a: (city: string, serviceArea: string) => string }[];
}

// Pexels images — free commercial use
const IMG = {
  house:       "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  renovation:  "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  roofing:     "https://images.pexels.com/photos/209315/pexels-photo-209315.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  hvac:        "https://images.pexels.com/photos/3964704/pexels-photo-3964704.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  plumbing:    "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  electrical:  "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  outdoor:     "https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  pool:        "https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  cleaning:    "https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  medical:     "https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  dental:      "https://images.pexels.com/photos/3881449/pexels-photo-3881449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  wellness:    "https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  flooring:    "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  painting:    "https://images.pexels.com/photos/1669754/pexels-photo-1669754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  windows:     "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  pest:        "https://images.pexels.com/photos/459728/pexels-photo-459728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  tree:        "https://images.pexels.com/photos/158028/pexels-photo-158028.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
};

// ── Per-industry configs ───────────────────────────────────────────────────────

export const INDUSTRY_CONFIGS: Record<string, IndustryConfig> = {

  // ── Core Home Trades ──────────────────────────────────────────────────────

  "Roofing": {
    group: "Core Home Trades",
    heroImage: IMG.roofing,
    heroHeadlinePrefix: "Trusted Roofing Specialists",
    ctaLabel: "Get a Free Roof Estimate",
    urgencyText: "⚡ Guaranteed 2-hour response — or we call you first, no questions asked.",
    servicesLabel: "Roofing Services",
    services: [
      { icon: "fa-house-chimney",  label: "Roof Replacement"      },
      { icon: "fa-wrench",         label: "Roof Repair"           },
      { icon: "fa-droplet",        label: "Leak Detection"        },
      { icon: "fa-wind",           label: "Storm Damage"          },
      { icon: "fa-layer-group",    label: "Shingle Install"       },
      { icon: "fa-shield-halved",  label: "Roof Inspection"       },
      { icon: "fa-ruler-combined", label: "Gutters & Flashing"    },
      { icon: "fa-star",           label: "Flat / Commercial"     },
    ],
    jobTypes: ["Roof Replacement", "Roof Repair", "Leak Inspection", "Storm Damage Claim", "Gutters & Flashing", "Flat Roof / Commercial", "New Construction Roof", "Other"],
    trustBullets: ["Licensed & Insured Roofers", "Free Roof Inspections", "All Work Warranted"],
    aboutLabel: "Our Roofing Team",
    schemaType: "RoofingContractor",
    faqs: [
      { q: "How do I know if I need a full replacement vs. a repair?", a: (c) => `Our team serves ${c} and will perform a thorough free inspection to assess the damage and recommend the most cost-effective solution — no upselling, just honest advice.` },
      { q: "Will you work directly with my insurance?",               a: ()  => "Yes. We handle storm damage claims and can work directly with your insurance adjuster to document the damage and advocate for a fair settlement." },
      { q: "How quickly can you respond?",                            a: (c) => `We guarantee a response within 2 hours for customers in ${c}. Emergency repairs can often be scheduled same-day.` },
      { q: "Is the estimate really free?",                            a: ()  => "100% free, no obligation. We assess your roof, explain your options, and give you a written quote — you decide if you want to proceed." },
    ],
  },

  "HVAC & Cooling": {
    group: "Core Home Trades",
    heroImage: IMG.hvac,
    heroHeadlinePrefix: "HVAC & Cooling Experts",
    ctaLabel: "Schedule Free HVAC Estimate",
    urgencyText: "⚡ Same-day service available — don't sweat it out. Response in under 2 hours.",
    servicesLabel: "HVAC Services",
    services: [
      { icon: "fa-temperature-half", label: "AC Installation"      },
      { icon: "fa-wrench",           label: "AC Repair"            },
      { icon: "fa-fire",             label: "Heating Systems"      },
      { icon: "fa-wind",             label: "Air Quality"          },
      { icon: "fa-gear",             label: "Annual Tune-Up"       },
      { icon: "fa-snowflake",        label: "Refrigerant Service"  },
      { icon: "fa-fan",              label: "Duct Cleaning"        },
      { icon: "fa-thermometer-half", label: "Smart Thermostats"    },
    ],
    jobTypes: ["AC Installation", "AC Repair / Not Cooling", "Heating Repair", "Annual Tune-Up / Maintenance", "Air Quality / Filtration", "Duct Cleaning", "Smart Thermostat Install", "New System Quote", "Other"],
    trustBullets: ["NATE-Certified Technicians", "Same-Day Emergency Service", "All Major Brands Serviced"],
    aboutLabel: "Our HVAC Team",
    schemaType: "HVACBusiness",
    faqs: [
      { q: "Do you offer emergency or same-day service?",      a: (c) => `Yes — for urgent cooling or heating failures in ${c}, we offer same-day emergency service. Fill out the form and we'll call you within 2 hours.` },
      { q: "How often should I service my HVAC system?",      a: ()  => "We recommend a tune-up once per year — before summer for AC and before winter for heating. Regular maintenance extends system life and saves on energy bills." },
      { q: "What brands do you service?",                     a: ()  => "We service all major brands including Carrier, Trane, Lennox, Goodman, Rheem, and more." },
      { q: "Is the estimate free?",                           a: ()  => "Yes, completely free with no obligation. We'll diagnose the issue and give you a clear, upfront quote before any work begins." },
    ],
  },

  "Plumbing": {
    group: "Core Home Trades",
    heroImage: IMG.plumbing,
    heroHeadlinePrefix: "Licensed Plumbing Professionals",
    ctaLabel: "Request Free Plumbing Estimate",
    urgencyText: "⚡ Emergency plumbing available — 2-hour response guaranteed.",
    servicesLabel: "Plumbing Services",
    services: [
      { icon: "fa-faucet",         label: "Leak Repair"          },
      { icon: "fa-toilet",         label: "Toilet Service"       },
      { icon: "fa-shower",         label: "Fixture Install"      },
      { icon: "fa-fire-flame-curved", label: "Water Heater"      },
      { icon: "fa-pipe-section",   label: "Drain Cleaning"       },
      { icon: "fa-house-flood-water", label: "Water Line"        },
      { icon: "fa-wrench",         label: "Repiping"             },
      { icon: "fa-circle-exclamation", label: "Emergency"        },
    ],
    jobTypes: ["Leak Repair", "Drain Cleaning / Clog", "Water Heater (Repair or Replace)", "Toilet / Fixture Service", "Pipe Replacement / Repiping", "Sewer Line", "Emergency Plumbing", "Other"],
    trustBullets: ["State-Licensed Plumbers", "Upfront Flat-Rate Pricing", "Emergency Service Available"],
    aboutLabel: "Our Plumbing Team",
    schemaType: "Plumber",
    faqs: [
      { q: "Do you handle emergency plumbing?",          a: (c) => `Yes — burst pipes, severe leaks, and flooding are treated as priority calls in ${c}. Submit the form and we'll reach you within 2 hours.` },
      { q: "Do you give upfront pricing?",               a: ()  => "Always. We diagnose the issue, explain all options, and provide a written quote before we start. No surprise charges." },
      { q: "Can you handle both small repairs and big jobs?", a: () => "Absolutely — from a dripping faucet to full repipe, we handle it all with the same level of care and craftsmanship." },
      { q: "Is the initial assessment free?",            a: ()  => "Yes, the estimate is 100% free with no obligation." },
    ],
  },

  "Electrical": {
    group: "Core Home Trades",
    heroImage: IMG.electrical,
    heroHeadlinePrefix: "Licensed Electrical Contractors",
    ctaLabel: "Get a Free Electrical Estimate",
    urgencyText: "⚡ Safety first — electrical issues answered within 2 hours.",
    servicesLabel: "Electrical Services",
    services: [
      { icon: "fa-bolt",           label: "Panel Upgrades"       },
      { icon: "fa-plug",           label: "Outlet & Wiring"      },
      { icon: "fa-lightbulb",      label: "Lighting Install"     },
      { icon: "fa-car-battery",    label: "EV Charger Install"   },
      { icon: "fa-shield-halved",  label: "Safety Inspections"   },
      { icon: "fa-house",          label: "Whole-Home Rewire"    },
      { icon: "fa-solar-panel",    label: "Generator / Solar"    },
      { icon: "fa-circle-exclamation", label: "Emergency"        },
    ],
    jobTypes: ["Panel Upgrade / Service", "Outlet / Switch Install", "Lighting Installation", "EV Charger Install", "Whole-Home Rewire", "Safety Inspection", "Generator Install", "Emergency Electrical", "Other"],
    trustBullets: ["State-Licensed Electricians", "Code-Compliant Work", "Emergency Service Available"],
    aboutLabel: "Our Electrical Team",
    schemaType: "Electrician",
    faqs: [
      { q: "Are you licensed and insured?",              a: ()  => "Yes — all our electricians are state-licensed, bonded, and fully insured. We pull all required permits and ensure work is code-compliant." },
      { q: "When is it an emergency?",                   a: ()  => "Sparking outlets, burning smell, flickering lights throughout the home, or a tripped panel that won't reset are all urgent. Submit the form and we'll reach you immediately." },
      { q: "Do you install EV chargers?",                a: (c) => `Yes — Level 2 home EV charger installation is one of our most requested services in ${c}. We handle the full permit and install.` },
      { q: "Is the estimate free?",                      a: ()  => "Yes, always free and no obligation." },
    ],
  },

  // ── Project-Based Trades ─────────────────────────────────────────────────

  "General Contractors": {
    group: "Project-Based Trades",
    heroImage: IMG.renovation,
    heroHeadlinePrefix: "General Contractor Services",
    ctaLabel: "Get a Free Project Quote",
    urgencyText: "⚡ Response within 24 hours — let's plan your project together.",
    servicesLabel: "Project Services",
    services: [
      { icon: "fa-house",          label: "Home Additions"       },
      { icon: "fa-kitchen-set",    label: "Kitchen Remodel"      },
      { icon: "fa-bath",           label: "Bathroom Remodel"     },
      { icon: "fa-person-digging", label: "Basement Finish"      },
      { icon: "fa-layer-group",    label: "Flooring"             },
      { icon: "fa-paintbrush",     label: "Interior Updates"     },
      { icon: "fa-ruler-combined", label: "Custom Builds"        },
      { icon: "fa-star",           label: "Full Renovations"     },
    ],
    jobTypes: ["Kitchen Remodel", "Bathroom Remodel", "Home Addition", "Basement Finishing", "Full Home Renovation", "Custom Build", "Interior Renovation", "Other"],
    trustBullets: ["Licensed General Contractor", "Portfolio Available on Request", "All Subs Vetted & Insured"],
    aboutLabel: "Our Team",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      { q: "How does the project process work?",         a: (c) => `For ${c} homeowners, we start with a free in-home consultation to understand your vision, then provide a detailed written proposal with timeline and budget.` },
      { q: "Do you manage subcontractors?",              a: ()  => "Yes — we manage the entire project from permits to final walkthrough. You have one point of contact, no chasing down multiple trades." },
      { q: "What size projects do you take?",            a: ()  => "We handle everything from a single-room remodel to full home renovations and additions." },
      { q: "Is the estimate free?",                      a: ()  => "Yes, our initial consultation and written quote are completely free with no obligation." },
    ],
  },

  "Flooring": {
    group: "Project-Based Trades",
    heroImage: IMG.flooring,
    heroHeadlinePrefix: "Premium Flooring Installation",
    ctaLabel: "Get a Free Flooring Quote",
    urgencyText: "⚡ Free in-home measurement & estimate — response within 24 hours.",
    servicesLabel: "Flooring Services",
    services: [
      { icon: "fa-layer-group",    label: "Hardwood"             },
      { icon: "fa-layer-group",    label: "LVP / Vinyl"          },
      { icon: "fa-border-all",     label: "Tile & Stone"         },
      { icon: "fa-rug",            label: "Carpet"               },
      { icon: "fa-layer-group",    label: "Laminate"             },
      { icon: "fa-wrench",         label: "Floor Repair"         },
      { icon: "fa-star",           label: "Refinishing"          },
      { icon: "fa-ruler",          label: "Free Measurement"     },
    ],
    jobTypes: ["Hardwood Installation", "LVP / Vinyl Plank", "Tile & Stone", "Carpet Installation", "Laminate Flooring", "Floor Repair / Refinishing", "Other"],
    trustBullets: ["Licensed & Insured Installers", "Free In-Home Measurement", "All Materials Available"],
    aboutLabel: "Our Flooring Team",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      { q: "Do you provide materials or just installation?", a: () => "Both — we can supply materials at competitive prices or install flooring you've already purchased." },
      { q: "How long does installation take?",               a: () => "Most rooms can be completed in 1–2 days. Whole-home projects typically take 3–5 days depending on square footage and material type." },
      { q: "Do you move furniture?",                         a: () => "Yes, furniture moving is included in most installations. We'll confirm the details during your free in-home estimate." },
      { q: "Is the measurement visit free?",                 a: () => "100% free — we come to your home, measure the space, and give you an accurate written quote with no obligation." },
    ],
  },

  "Painting": {
    group: "Project-Based Trades",
    heroImage: IMG.painting,
    heroHeadlinePrefix: "Professional Painting Services",
    ctaLabel: "Get a Free Painting Quote",
    urgencyText: "⚡ Free color consultation included — response within 24 hours.",
    servicesLabel: "Painting Services",
    services: [
      { icon: "fa-paintbrush",     label: "Interior Painting"    },
      { icon: "fa-house",          label: "Exterior Painting"    },
      { icon: "fa-layer-group",    label: "Cabinet Painting"     },
      { icon: "fa-star",           label: "Epoxy / Garage Floor" },
      { icon: "fa-ruler-combined", label: "Drywall & Texture"    },
      { icon: "fa-spray-can",      label: "Staining & Sealing"   },
      { icon: "fa-building",       label: "Commercial Painting"  },
      { icon: "fa-palette",        label: "Color Consulting"     },
    ],
    jobTypes: ["Interior Painting", "Exterior Painting", "Cabinet Painting / Refinishing", "Drywall Repair & Texture", "Deck / Fence Staining", "Garage Floor Epoxy", "Commercial Painting", "Other"],
    trustBullets: ["Licensed & Fully Insured", "Premium Paints — Sherwin-Williams & Benjamin Moore", "Clean Job Sites Guaranteed"],
    aboutLabel: "Our Painting Crew",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      { q: "Do you help with color selection?",            a: () => "Yes — a free color consultation is included with every quote. We'll bring samples and walk you through combinations that work for your space and lighting." },
      { q: "How do you protect furniture and floors?",     a: () => "We cover all furniture, floors, and fixtures before any brush touches the wall. Cleanliness and care are part of every job." },
      { q: "How long does a typical interior paint job take?", a: () => "Most whole-home interiors take 2–4 days. Single rooms can often be done in one day." },
      { q: "Is the estimate free?",                        a: () => "Yes, completely free. We'll walk the space, discuss your vision, and give you a written quote on the spot." },
    ],
  },

  "Windows & Doors": {
    group: "Project-Based Trades",
    heroImage: IMG.windows,
    heroHeadlinePrefix: "Window & Door Replacement Experts",
    ctaLabel: "Get a Free Window Quote",
    urgencyText: "⚡ Free in-home measurement — response within 24 hours.",
    servicesLabel: "Window & Door Services",
    services: [
      { icon: "fa-window-maximize", label: "Window Replacement"  },
      { icon: "fa-door-open",       label: "Entry Doors"         },
      { icon: "fa-door-closed",     label: "Patio & Sliding"     },
      { icon: "fa-snowflake",       label: "Energy-Efficient"    },
      { icon: "fa-shield-halved",   label: "Storm Windows"       },
      { icon: "fa-ruler",           label: "Custom Sizing"       },
      { icon: "fa-wrench",          label: "Window Repair"       },
      { icon: "fa-star",            label: "Skylights"           },
    ],
    jobTypes: ["Window Replacement", "Entry Door Replacement", "Patio / Sliding Door", "Storm Windows", "Energy-Efficient Upgrade", "Skylight Install", "Window / Door Repair", "Other"],
    trustBullets: ["Factory-Certified Installers", "Energy Star Certified Products", "Transferable Warranty"],
    aboutLabel: "Our Installation Team",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      { q: "How much can new windows save on energy bills?", a: () => "Energy-efficient windows can reduce heating and cooling costs by up to 15–25% annually. We'll help you select the right products for your climate." },
      { q: "How long does window installation take?",        a: () => "Most homes can be completed in a single day. We install, clean up, and haul away all old materials." },
      { q: "Do you offer financing?",                        a: () => "Ask about our financing options during your free estimate — many customers qualify for 0% interest promotional periods." },
      { q: "Is the measurement free?",                       a: () => "Yes, completely free — we measure every opening and give you an accurate written quote with no pressure." },
    ],
  },

  "Concrete & Paving": {
    group: "Project-Based Trades",
    heroImage: IMG.house,
    heroHeadlinePrefix: "Concrete & Paving Professionals",
    ctaLabel: "Get a Free Concrete Quote",
    urgencyText: "⚡ Free on-site assessment — response within 24 hours.",
    servicesLabel: "Concrete & Paving Services",
    services: [
      { icon: "fa-road",           label: "Driveways"            },
      { icon: "fa-square",         label: "Patios & Walkways"    },
      { icon: "fa-building",       label: "Foundations"          },
      { icon: "fa-wrench",         label: "Crack Repair"         },
      { icon: "fa-spray-can",      label: "Concrete Sealing"     },
      { icon: "fa-star",           label: "Stamped Concrete"     },
      { icon: "fa-car",            label: "Parking Areas"        },
      { icon: "fa-layer-group",    label: "Retaining Walls"      },
    ],
    jobTypes: ["Driveway (New or Replace)", "Patio / Walkway", "Foundation Work", "Concrete Repair", "Stamped Concrete", "Concrete Sealing", "Retaining Wall", "Other"],
    trustBullets: ["Licensed & Bonded", "Free On-Site Estimates", "Commercial & Residential"],
    aboutLabel: "Our Concrete Team",
    schemaType: "HomeAndConstructionBusiness",
    faqs: [
      { q: "How long does concrete take to cure?",          a: () => "New concrete is typically walkable in 24–48 hours and ready for vehicles in 7 days. We'll provide full aftercare instructions." },
      { q: "Can you match existing concrete?",              a: () => "We can get very close in color and finish for repairs and additions, though an exact match can be challenging with aged concrete." },
      { q: "Do you do both residential and commercial?",    a: (c) => `Yes — we serve both homeowners and commercial property managers throughout ${c}.` },
      { q: "Is the estimate free?",                         a: () => "Yes, free on-site assessment with a detailed written quote — no obligation." },
    ],
  },

  // ── Outdoor & Recurring Services ─────────────────────────────────────────

  "Landscaping": {
    group: "Outdoor & Recurring Services",
    heroImage: IMG.outdoor,
    heroHeadlinePrefix: "Professional Landscaping Services",
    ctaLabel: "Get a Free Landscaping Quote",
    urgencyText: "⚡ First visit often available this week — response within 24 hours.",
    servicesLabel: "Landscaping Services",
    services: [
      { icon: "fa-seedling",       label: "Lawn Care"            },
      { icon: "fa-tree",           label: "Tree & Shrub Trim"    },
      { icon: "fa-leaf",           label: "Landscape Design"     },
      { icon: "fa-tint",           label: "Irrigation Systems"   },
      { icon: "fa-square",         label: "Hardscaping"          },
      { icon: "fa-star",           label: "Sod Installation"     },
      { icon: "fa-calendar-check", label: "Seasonal Cleanups"    },
      { icon: "fa-recycle",        label: "Mulch & Beds"         },
    ],
    jobTypes: ["Weekly / Bi-Weekly Lawn Care", "One-Time Cleanup", "Landscape Design & Install", "Irrigation Install / Repair", "Hardscaping (Patios, Walls)", "Sod Installation", "Tree / Shrub Trimming", "Other"],
    trustBullets: ["Licensed & Insured", "Weekly & Monthly Plans Available", "Eco-Friendly Practices"],
    aboutLabel: "Our Landscaping Team",
    schemaType: "LandscapingBusiness",
    faqs: [
      { q: "Do you offer recurring service plans?",         a: (c) => `Yes — we offer weekly, bi-weekly, and monthly lawn care plans for ${c} homeowners and HOAs. Set it and forget it.` },
      { q: "What's included in a lawn care visit?",         a: () => "Standard visits include mowing, edging, blowing, and debris removal. Additional services like fertilization and weed control are available as add-ons." },
      { q: "Can you design and install a new landscape?",   a: () => "Absolutely — we offer full landscape design services from concept to installation, including plants, lighting, and hardscape elements." },
      { q: "Is the estimate free?",                         a: () => "Yes, free on-site consultation with no obligation." },
    ],
  },

  "Tree Services": {
    group: "Outdoor & Recurring Services",
    heroImage: IMG.tree,
    heroHeadlinePrefix: "Certified Tree Service Experts",
    ctaLabel: "Get a Free Tree Service Quote",
    urgencyText: "⚡ Storm emergency response available — 2-hour callback guaranteed.",
    servicesLabel: "Tree Services",
    services: [
      { icon: "fa-tree",           label: "Tree Removal"         },
      { icon: "fa-scissors",       label: "Tree Trimming"        },
      { icon: "fa-seedling",       label: "Stump Grinding"       },
      { icon: "fa-wind",           label: "Storm Cleanup"        },
      { icon: "fa-shield-halved",  label: "Health Assessment"    },
      { icon: "fa-leaf",           label: "Deep Root Feeding"    },
      { icon: "fa-house",          label: "Hazard Tree Removal"  },
      { icon: "fa-recycle",        label: "Log & Chip Haul-Away" },
    ],
    jobTypes: ["Tree Removal", "Tree Trimming / Pruning", "Stump Grinding / Removal", "Storm Damage Cleanup", "Tree Health Assessment", "Emergency Tree Service", "Lot Clearing", "Other"],
    trustBullets: ["ISA-Certified Arborists", "Fully Insured — $2M Liability", "Storm Emergency Service"],
    aboutLabel: "Our Arborist Team",
    schemaType: "LocalBusiness",
    faqs: [
      { q: "How do I know if a tree is hazardous?",         a: (c) => `Our certified arborists serve ${c} and provide free hazard assessments. Warning signs include dead branches, leaning, root damage, or fungal growth.` },
      { q: "Do you remove the debris after?",               a: () => "Yes — all branches, logs, and debris are hauled away. We leave your yard cleaner than we found it." },
      { q: "Do you handle emergency storm damage?",         a: () => "Yes — storm damage and fallen trees are treated as priority calls. Submit the form and we'll respond within 2 hours." },
      { q: "Is the estimate free?",                         a: () => "Yes, completely free. We assess the tree(s) in person and provide a written quote on the spot." },
    ],
  },

  "Pest Control": {
    group: "Outdoor & Recurring Services",
    heroImage: IMG.pest,
    heroHeadlinePrefix: "Pest Control & Extermination",
    ctaLabel: "Schedule Free Pest Inspection",
    urgencyText: "⚡ Same-week inspection available — response within 2 hours.",
    servicesLabel: "Pest Control Services",
    services: [
      { icon: "fa-bug",            label: "General Pest Control" },
      { icon: "fa-house-chimney",  label: "Termite Treatment"    },
      { icon: "fa-spider",         label: "Rodent Removal"       },
      { icon: "fa-leaf",           label: "Ant & Roach"          },
      { icon: "fa-shield-halved",  label: "Bed Bug Treatment"    },
      { icon: "fa-tree",           label: "Mosquito Control"     },
      { icon: "fa-calendar-check", label: "Quarterly Plans"      },
      { icon: "fa-star",           label: "Eco-Friendly Options" },
    ],
    jobTypes: ["General Pest Inspection", "Termite Inspection / Treatment", "Rodent Control", "Ant / Roach Extermination", "Bed Bug Treatment", "Mosquito Control", "Quarterly Maintenance Plan", "Other"],
    trustBullets: ["State-Licensed & Certified", "Pet & Child Safe Treatments Available", "Satisfaction Guaranteed"],
    aboutLabel: "Our Pest Control Team",
    schemaType: "LocalBusiness",
    faqs: [
      { q: "Are your treatments safe for kids and pets?",   a: () => "We offer pet and child-safe treatment options. Let us know your household needs when filling out the form and we'll recommend the right solution." },
      { q: "How soon can you come out?",                    a: (c) => `For most ${c} customers, we can schedule an inspection within 24–48 hours. Urgent infestations are prioritized.` },
      { q: "Do you offer recurring treatment plans?",       a: () => "Yes — quarterly prevention plans keep your home pest-free year-round at a significant discount versus single treatments." },
      { q: "Is the inspection free?",                       a: () => "Yes, free initial inspection and written treatment plan with no obligation." },
    ],
  },

  "Pool & Spa": {
    group: "Outdoor & Recurring Services",
    heroImage: IMG.pool,
    heroHeadlinePrefix: "Pool & Spa Service Specialists",
    ctaLabel: "Get a Free Pool Service Quote",
    urgencyText: "⚡ Weekly service plans available — response within 24 hours.",
    servicesLabel: "Pool & Spa Services",
    services: [
      { icon: "fa-water",          label: "Weekly Cleaning"      },
      { icon: "fa-flask",          label: "Chemical Balancing"   },
      { icon: "fa-wrench",         label: "Equipment Repair"     },
      { icon: "fa-gear",           label: "Pump & Filter"        },
      { icon: "fa-star",           label: "Pool Resurfacing"     },
      { icon: "fa-droplet",        label: "Leak Detection"       },
      { icon: "fa-hot-tub-person", label: "Spa Service"          },
      { icon: "fa-calendar-check", label: "Opening / Closing"    },
    ],
    jobTypes: ["Weekly Pool Cleaning Plan", "Chemical Balancing (One-Time)", "Equipment Repair / Replacement", "Pool Resurfacing", "Leak Detection & Repair", "Seasonal Opening / Closing", "Spa Service & Repair", "Other"],
    trustBullets: ["Certified Pool & Spa Operators", "Weekly Plans Starting from $X/mo", "All Equipment Brands Serviced"],
    aboutLabel: "Our Pool Team",
    schemaType: "LocalBusiness",
    faqs: [
      { q: "What's included in a weekly service visit?",    a: () => "We test and balance chemicals, skim the surface, brush walls and tile, vacuum the floor, and inspect equipment every visit." },
      { q: "Can you repair any brand of pool equipment?",   a: () => "Yes — we service all major brands of pumps, filters, heaters, and automation systems." },
      { q: "Do you handle green pool recovery?",            a: () => "Absolutely — green or cloudy pools are one of our most common service requests. We can typically restore clarity within 48–72 hours." },
      { q: "Is the quote free?",                            a: () => "Yes, completely free. We assess your pool and provide a clear service quote with no obligation." },
    ],
  },

  "Pressure Washing": {
    group: "Outdoor & Recurring Services",
    heroImage: IMG.house,
    heroHeadlinePrefix: "Professional Pressure Washing",
    ctaLabel: "Get a Free Pressure Wash Quote",
    urgencyText: "⚡ Often available this week — response within 24 hours.",
    servicesLabel: "Pressure Washing Services",
    services: [
      { icon: "fa-house",          label: "House Washing"        },
      { icon: "fa-car",            label: "Driveway & Concrete"  },
      { icon: "fa-tree",           label: "Deck & Fence"         },
      { icon: "fa-building",       label: "Commercial"           },
      { icon: "fa-square",         label: "Patio & Sidewalk"     },
      { icon: "fa-spray-can",      label: "Soft Washing"         },
      { icon: "fa-star",           label: "Roof Washing"         },
      { icon: "fa-recycle",        label: "Gutter Cleaning"      },
    ],
    jobTypes: ["House / Exterior Washing", "Driveway / Concrete Cleaning", "Deck / Fence Washing", "Roof Soft Washing", "Patio / Sidewalk", "Gutter Cleaning", "Commercial Property", "Other"],
    trustBullets: ["Fully Insured", "Eco-Friendly Cleaning Solutions", "Before & After Photos Provided"],
    aboutLabel: "Our Crew",
    schemaType: "LocalBusiness",
    faqs: [
      { q: "Will pressure washing damage my siding or roof?", a: () => "For delicate surfaces like roofs, painted wood, and vinyl, we use low-pressure soft washing with biodegradable cleaners that lift stains without causing damage." },
      { q: "How often should I have my house washed?",        a: (c) => `In ${c}'s climate, most homeowners benefit from once-per-year exterior washing to prevent mold, algae, and buildup.` },
      { q: "How long does a typical job take?",               a: () => "A standard single-family home takes 2–4 hours. Driveways can usually be done in under an hour." },
      { q: "Is the estimate free?",                           a: () => "Yes — free quote, and we often can give you an accurate price based on your address without needing to visit first." },
    ],
  },

  "Cleaning Services": {
    group: "Outdoor & Recurring Services",
    heroImage: IMG.cleaning,
    heroHeadlinePrefix: "Professional Cleaning Services",
    ctaLabel: "Book Your Free Cleaning Estimate",
    urgencyText: "⚡ First booking often available this week — response within 24 hours.",
    servicesLabel: "Cleaning Services",
    services: [
      { icon: "fa-broom",          label: "Regular Home Cleaning" },
      { icon: "fa-star",           label: "Deep Clean"            },
      { icon: "fa-building",       label: "Move In / Move Out"    },
      { icon: "fa-calendar-check", label: "Weekly Plans"          },
      { icon: "fa-building",       label: "Office Cleaning"       },
      { icon: "fa-spray-can",      label: "Post-Construction"     },
      { icon: "fa-couch",          label: "Upholstery Cleaning"   },
      { icon: "fa-window-maximize", label: "Window Cleaning"      },
    ],
    jobTypes: ["Regular Home Cleaning (Recurring)", "One-Time Deep Clean", "Move In / Move Out Clean", "Office / Commercial Cleaning", "Post-Construction Cleaning", "Airbnb / Short-Term Rental", "Other"],
    trustBullets: ["Background-Checked & Insured Staff", "Flexible Scheduling", "Eco-Friendly Products Available"],
    aboutLabel: "Our Cleaning Team",
    schemaType: "LocalBusiness",
    faqs: [
      { q: "Do I need to be home during the cleaning?",      a: () => "Not at all — many clients provide access and return to a spotless home. All staff are background-checked and insured." },
      { q: "Do you supply cleaning products?",               a: () => "Yes, we bring everything. If you prefer eco-friendly or specific products, just let us know and we'll accommodate." },
      { q: "What's the difference between a regular and deep clean?", a: () => "A deep clean covers areas typically skipped in routine maintenance — inside appliances, baseboards, grout, behind furniture, and more. We recommend it for first visits." },
      { q: "Is the estimate free?",                          a: () => "Yes, completely free with no commitment required." },
    ],
  },

  // ── Health, Wellness & Med Services ──────────────────────────────────────

  "Med Spa & Aesthetics": {
    group: "Health, Wellness & Med Services",
    heroImage: IMG.wellness,
    heroHeadlinePrefix: "Med Spa & Aesthetic Services",
    ctaLabel: "Book a Free Consultation",
    urgencyText: "✨ New clients welcome — consultations available this week.",
    servicesLabel: "Our Services",
    services: [
      { icon: "fa-syringe",        label: "Botox & Fillers"      },
      { icon: "fa-star",           label: "Laser Treatments"     },
      { icon: "fa-face-smile",     label: "Facials & Peels"      },
      { icon: "fa-spa",            label: "Body Contouring"      },
      { icon: "fa-sun",            label: "Skin Rejuvenation"    },
      { icon: "fa-leaf",           label: "IV Therapy"           },
      { icon: "fa-eye",            label: "Microneedling"        },
      { icon: "fa-heart",          label: "Wellness Packages"    },
    ],
    jobTypes: ["Botox / Fillers", "Laser Treatment", "Facial / Chemical Peel", "Body Contouring", "IV Therapy", "Microneedling", "Skin Consultation", "Other"],
    trustBullets: ["Board-Certified Providers", "New Clients Welcome", "Private & Confidential"],
    aboutLabel: "Our Practice",
    schemaType: "MedicalBusiness",
    faqs: [
      { q: "Do I need to schedule a consultation first?",    a: () => "Yes — all new patients start with a complimentary consultation so we can understand your goals and create a personalized treatment plan." },
      { q: "Are your providers licensed and certified?",     a: (c) => `All treatments in our ${c} practice are performed or supervised by board-certified medical providers.` },
      { q: "Is my information kept private?",               a: () => "Absolutely — all patient information is kept strictly confidential and HIPAA-compliant." },
      { q: "Is the consultation free?",                     a: () => "Yes, your initial consultation is completely complimentary with no obligation to proceed." },
    ],
  },

  "Dental & Orthodontics": {
    group: "Health, Wellness & Med Services",
    heroImage: IMG.dental,
    heroHeadlinePrefix: "Dental & Orthodontic Care",
    ctaLabel: "Book a Free Dental Consultation",
    urgencyText: "🦷 New patients welcome — same-week appointments available.",
    servicesLabel: "Dental Services",
    services: [
      { icon: "fa-tooth",          label: "Cleanings & Exams"    },
      { icon: "fa-star",           label: "Teeth Whitening"      },
      { icon: "fa-smile",          label: "Invisalign / Braces"  },
      { icon: "fa-syringe",        label: "Implants"             },
      { icon: "fa-shield-halved",  label: "Crowns & Veneers"     },
      { icon: "fa-circle-exclamation", label: "Emergency Care"   },
      { icon: "fa-child",          label: "Pediatric Dentistry"  },
      { icon: "fa-face-smile",     label: "Cosmetic Dentistry"   },
    ],
    jobTypes: ["New Patient Exam & Cleaning", "Teeth Whitening", "Braces / Invisalign Consultation", "Dental Implant Consultation", "Crowns / Veneers", "Emergency Dental", "Pediatric Dentistry", "Other"],
    trustBullets: ["Accepting New Patients", "Most Insurance Plans Accepted", "Emergency Appointments Available"],
    aboutLabel: "Our Practice",
    schemaType: "Dentist",
    faqs: [
      { q: "Are you accepting new patients?",               a: (c) => `Yes — we are actively accepting new patients in ${c} and surrounding areas. Same-week appointments are often available.` },
      { q: "Do you accept dental insurance?",               a: () => "We accept most major dental insurance plans. Our team will verify your benefits before your appointment." },
      { q: "Do you see children?",                          a: () => "Yes, we offer pediatric dentistry and welcome patients of all ages." },
      { q: "Is the initial consultation free?",             a: () => "New patient consultations are complimentary. Fill out the form and our team will reach out to schedule." },
    ],
  },

  "Physical Therapy": {
    group: "Health, Wellness & Med Services",
    heroImage: IMG.wellness,
    heroHeadlinePrefix: "Physical Therapy & Rehabilitation",
    ctaLabel: "Request a Free PT Consultation",
    urgencyText: "✨ New patients welcome — often same-week availability.",
    servicesLabel: "Physical Therapy Services",
    services: [
      { icon: "fa-person-walking",  label: "Orthopedic PT"       },
      { icon: "fa-heart-pulse",     label: "Sports Rehab"        },
      { icon: "fa-person-cane",     label: "Post-Surgery Rehab"  },
      { icon: "fa-bone",            label: "Back & Neck Pain"    },
      { icon: "fa-person",          label: "Balance & Fall Prev" },
      { icon: "fa-dumbbell",        label: "Strength & Function" },
      { icon: "fa-hand",            label: "Hand Therapy"        },
      { icon: "fa-house",           label: "Home Visit PT"       },
    ],
    jobTypes: ["Orthopedic Injury", "Post-Surgery Rehab", "Sports Injury / Performance", "Chronic Pain (Back, Neck, etc.)", "Balance & Fall Prevention", "Pre/Post Natal PT", "Home Visit Request", "Other"],
    trustBullets: ["Licensed & Certified PTs", "Accepting New Patients", "Most Insurance Plans Accepted"],
    aboutLabel: "Our Practice",
    schemaType: "MedicalBusiness",
    faqs: [
      { q: "Do I need a doctor's referral?",               a: (c) => `In most states, including those we serve in ${c}, patients can access physical therapy directly without a referral (direct access). We can also help coordinate with your doctor.` },
      { q: "How many sessions will I need?",               a: () => "This varies by condition and individual. After your initial evaluation, we'll provide a clear treatment plan with expected duration and goals." },
      { q: "Do you accept insurance?",                     a: () => "We accept most major insurance plans including Medicare. Our team will verify your coverage before your first visit." },
      { q: "Is the initial consultation free?",            a: () => "Yes — your initial consultation is complimentary. Fill out the form and we'll reach out to schedule." },
    ],
  },

  "Chiropractic Care": {
    group: "Health, Wellness & Med Services",
    heroImage: IMG.wellness,
    heroHeadlinePrefix: "Chiropractic Care & Spinal Health",
    ctaLabel: "Book Your Free Chiropractic Consult",
    urgencyText: "✨ New patients welcome — often same-week availability.",
    servicesLabel: "Chiropractic Services",
    services: [
      { icon: "fa-bone",           label: "Spinal Adjustments"   },
      { icon: "fa-person-walking", label: "Back & Neck Pain"     },
      { icon: "fa-heart-pulse",    label: "Sports Injuries"      },
      { icon: "fa-car-burst",      label: "Auto Accident Care"   },
      { icon: "fa-baby",           label: "Prenatal Care"        },
      { icon: "fa-dumbbell",       label: "Corrective Exercises" },
      { icon: "fa-hand",           label: "Massage Therapy"      },
      { icon: "fa-star",           label: "Wellness Plans"       },
    ],
    jobTypes: ["New Patient Exam", "Back / Neck Pain", "Auto Accident Injury", "Sports Injury", "Headaches / Migraines", "Prenatal Chiropractic", "Ongoing Wellness Care", "Other"],
    trustBullets: ["Licensed Doctor of Chiropractic", "Accepting New Patients", "Insurance Accepted"],
    aboutLabel: "Our Practice",
    schemaType: "MedicalBusiness",
    faqs: [
      { q: "Is chiropractic care safe?",                   a: () => "Yes — spinal manipulation performed by a licensed chiropractor is considered safe for most musculoskeletal conditions. We conduct a full health history before any treatment." },
      { q: "Do you handle auto accident injuries?",        a: (c) => `Yes — personal injury and auto accident cases are a specialty for our ${c} clinic. We document thoroughly to support your claim.` },
      { q: "Do you accept insurance?",                     a: () => "We accept most major insurance plans and can work with personal injury attorneys for accident cases." },
      { q: "Is the first visit free?",                     a: () => "Your initial consultation is complimentary. Fill out the form and we'll reach out to confirm your appointment." },
    ],
  },

  "Mental Health": {
    group: "Health, Wellness & Med Services",
    heroImage: IMG.wellness,
    heroHeadlinePrefix: "Mental Health & Counseling Services",
    ctaLabel: "Request a Free Consultation",
    urgencyText: "💙 Confidential — new clients welcome. Response within 24 hours.",
    servicesLabel: "Our Services",
    services: [
      { icon: "fa-comments",       label: "Individual Therapy"   },
      { icon: "fa-people-group",   label: "Couples Therapy"      },
      { icon: "fa-child",          label: "Child & Teen Therapy" },
      { icon: "fa-video",          label: "Telehealth Sessions"  },
      { icon: "fa-brain",          label: "Anxiety & Depression" },
      { icon: "fa-heart",          label: "Trauma / PTSD"        },
      { icon: "fa-moon",           label: "Stress & Burnout"     },
      { icon: "fa-star",           label: "Group Sessions"       },
    ],
    jobTypes: ["Individual Therapy", "Couples / Relationship Counseling", "Child or Teen Therapy", "Anxiety / Depression", "Trauma / PTSD", "Telehealth Session", "Other"],
    trustBullets: ["Licensed Therapists & Counselors", "HIPAA-Compliant & Confidential", "In-Person & Telehealth Available"],
    aboutLabel: "Our Practice",
    schemaType: "MedicalBusiness",
    faqs: [
      { q: "Is everything I share confidential?",          a: () => "Yes — all sessions are strictly confidential and HIPAA-compliant. Exceptions only exist where required by law (e.g., safety concerns)." },
      { q: "Do you offer telehealth / online sessions?",   a: (c) => `Yes — we offer both in-person sessions in ${c} and telehealth sessions so you can connect from anywhere.` },
      { q: "Do you accept insurance?",                     a: () => "We accept many major insurance plans. We can verify your benefits before your first session." },
      { q: "How do I get started?",                        a: () => "Simply fill out the form above and we'll reach out within 24 hours to schedule a complimentary introductory consultation." },
    ],
  },

  "Local Clinics": {
    group: "Health, Wellness & Med Services",
    heroImage: IMG.medical,
    heroHeadlinePrefix: "Local Medical Clinic",
    ctaLabel: "Request a Free Consultation",
    urgencyText: "✨ Accepting new patients — same-week appointments available.",
    servicesLabel: "Clinic Services",
    services: [
      { icon: "fa-stethoscope",    label: "Primary Care"         },
      { icon: "fa-syringe",        label: "Vaccinations"         },
      { icon: "fa-vial",           label: "Lab Testing"          },
      { icon: "fa-heart-pulse",    label: "Wellness Exams"       },
      { icon: "fa-circle-exclamation", label: "Urgent Care"      },
      { icon: "fa-weight-scale",   label: "Weight Management"    },
      { icon: "fa-pills",          label: "Chronic Disease Mgmt" },
      { icon: "fa-video",          label: "Telehealth"           },
    ],
    jobTypes: ["New Patient Appointment", "Annual / Wellness Exam", "Urgent Care Visit", "Vaccination / Immunization", "Lab Testing", "Telehealth Appointment", "Other"],
    trustBullets: ["Accepting New Patients", "Most Insurance Plans Accepted", "Telehealth Available"],
    aboutLabel: "Our Practice",
    schemaType: "MedicalClinic",
    faqs: [
      { q: "Are you accepting new patients?",               a: (c) => `Yes — we are actively welcoming new patients in ${c}. Same-week appointments are frequently available.` },
      { q: "Do you offer telehealth?",                      a: () => "Yes — virtual visits are available for many common conditions. Fill out the form to request a telehealth or in-person appointment." },
      { q: "What insurance do you accept?",                 a: () => "We accept most major insurance plans. Our team will verify your coverage before your visit." },
      { q: "Is the initial consultation free?",             a: () => "Fill out the form and our team will contact you within 24 hours to discuss your needs and schedule accordingly." },
    ],
  },

  "Veterinary": {
    group: "Health, Wellness & Med Services",
    heroImage: IMG.wellness,
    heroHeadlinePrefix: "Veterinary Care for Your Pets",
    ctaLabel: "Book a Free Vet Consultation",
    urgencyText: "🐾 New patients welcome — accepting dogs, cats & more.",
    servicesLabel: "Veterinary Services",
    services: [
      { icon: "fa-paw",            label: "Wellness Exams"       },
      { icon: "fa-syringe",        label: "Vaccinations"         },
      { icon: "fa-scissors",       label: "Spay & Neuter"        },
      { icon: "fa-tooth",          label: "Dental Cleaning"      },
      { icon: "fa-circle-exclamation", label: "Emergency Care"   },
      { icon: "fa-x-ray",          label: "Diagnostics / X-Ray"  },
      { icon: "fa-pills",          label: "Parasite Prevention"  },
      { icon: "fa-heart",          label: "Senior Pet Care"      },
    ],
    jobTypes: ["New Pet Wellness Exam", "Vaccination Visit", "Spay / Neuter", "Dental Cleaning", "Sick Pet Visit", "Emergency Care", "Other"],
    trustBullets: ["Licensed Veterinarians", "Accepting New Patients", "Compassionate, Fear-Free Care"],
    aboutLabel: "Our Veterinary Team",
    schemaType: "VeterinaryCare",
    faqs: [
      { q: "What animals do you see?",                     a: (c) => `Our ${c} clinic primarily sees dogs and cats. Fill out the form to let us know your pet and we'll confirm we can help.` },
      { q: "Do you handle emergencies?",                   a: () => "We accommodate urgent sick visits as quickly as possible. Fill out the form with \"Emergency Care\" selected and we'll call you back as a priority." },
      { q: "Do you accept pet insurance?",                 a: () => "We accept most major pet insurance plans and can provide itemized invoices for reimbursement claims." },
      { q: "Is the first consultation free?",              a: () => "Your first consultation is complimentary for new patients. Fill out the form and we'll reach out to schedule." },
    ],
  },
};

// ── Default config (fallback for unset / unknown industry) ────────────────────

export const DEFAULT_CONFIG: IndustryConfig = {
  group: "Home Services",
  heroImage: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  heroHeadlinePrefix: "Trusted Local Service Professionals",
  ctaLabel: "Get a Free Estimate",
  urgencyText: "⚡ Guaranteed 2-hour response — or we call you first, no questions asked.",
  servicesLabel: "Our Services",
  services: [
    { icon: "fa-house-chimney",  label: "Roofing"            },
    { icon: "fa-temperature-half", label: "HVAC"             },
    { icon: "fa-faucet",         label: "Plumbing"           },
    { icon: "fa-bolt",           label: "Electrical"         },
    { icon: "fa-kitchen-set",    label: "Kitchen Remodel"    },
    { icon: "fa-bath",           label: "Bathroom Remodel"   },
    { icon: "fa-leaf",           label: "Landscaping"        },
    { icon: "fa-paintbrush",     label: "Painting"           },
    { icon: "fa-layer-group",    label: "Flooring"           },
    { icon: "fa-ruler-combined", label: "Siding & Gutters"   },
    { icon: "fa-window-maximize", label: "Windows & Doors"   },
    { icon: "fa-person-digging", label: "General Contracting" },
  ],
  jobTypes: ["Roofing", "HVAC", "Plumbing", "Electrical", "Kitchen Remodel", "Bathroom Remodel", "Flooring", "Painting", "Landscaping", "Windows & Doors", "Siding & Gutters", "Other"],
  trustBullets: ["Licensed & Insured", "Free Estimates", "Local & Trusted"],
  aboutLabel: "About Us",
  schemaType: "HomeAndConstructionBusiness",
  faqs: [
    { q: "How quickly will I hear back?",  a: (c) => `We guarantee a response within 2 hours for customers in ${c}. If we miss that window, we'll call you first — no questions asked.` },
    { q: "Is the estimate really free?",   a: ()  => "Yes — 100% free and no obligation. We assess the job and give you a written quote. You decide if you want to move forward." },
    { q: "What areas do you serve?",       a: (c, sa) => `We serve ${sa || c} and surrounding areas. Fill out the form and we'll confirm we can help at your location.` },
    { q: "Are you licensed and insured?",  a: ()  => "Yes — all our technicians are fully licensed and insured. We carry full liability coverage on every job." },
  ],
};

export function getIndustryConfig(industry: string | null | undefined): IndustryConfig {
  if (!industry) return DEFAULT_CONFIG;
  return INDUSTRY_CONFIGS[industry] ?? DEFAULT_CONFIG;
}

export function getIndustryGroup(industry: string | null | undefined): string {
  if (!industry) return "";
  for (const g of INDUSTRY_GROUPS) {
    if (g.items.includes(industry)) return g.group;
  }
  return "";
}
