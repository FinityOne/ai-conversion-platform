export type TemplateCategory =
  | "personal"
  | "promo"
  | "value"
  | "reengagement"
  | "referral"
  | "urgency"
  | "seasonal"
  | "series";

export interface EmailTemplate {
  id: string;
  category: TemplateCategory;
  title: string;
  subject: string;
  purpose: string;
  icon: string;
  color: string;
  suggestedHours: number;
  previewKey?: string; // maps to page.tsx HTML builder key
}

export const TEMPLATES: EmailTemplate[] = [
  // ── Personal Touch (15) ──────────────────────────────────────────────────────
  {
    id: "welcome", category: "personal", previewKey: "welcome",
    title: "Welcome & Inquiry Receipt", icon: "fa-bolt", color: "#ea580c", suggestedHours: 0,
    subject: "We received your inquiry — here's what happens next",
    purpose: "Confirms receipt instantly, sets expectations, and beats competitors to the inbox.",
  },
  {
    id: "followup-info", category: "personal", previewKey: "followup",
    title: "Tell Us More", icon: "fa-envelope-open-text", color: "#7c3aed", suggestedHours: 24,
    subject: "{First Name}, tell us a little more about what you're going through",
    purpose: "Opens a dialogue and captures qualifying details to personalize the care plan.",
  },
  {
    id: "checkin-d3", category: "personal", previewKey: "checkin",
    title: "Personal Check-In (Day 3)", icon: "fa-user-doctor", color: "#0891b2", suggestedHours: 72,
    subject: "Still thinking about it? We're here — {First Name}",
    purpose: "A warm, personal nudge that shows genuine care without pressure.",
  },
  {
    id: "checkin-d7", category: "personal",
    title: "Personal Check-In (Day 7)", icon: "fa-user-doctor", color: "#0891b2", suggestedHours: 168,
    subject: "Checking in one more time — {First Name}",
    purpose: "Second personal check-in for leads who haven't responded after a week.",
  },
  {
    id: "owner-note", category: "personal",
    title: "Personal Note from Owner", icon: "fa-pen-nib", color: "#be185d", suggestedHours: 48,
    subject: "A personal note from our practice — {First Name}",
    purpose: "A direct note from the owner or lead doctor establishes a personal connection and immediate trust.",
  },
  {
    id: "team-intro", category: "personal",
    title: "Meet Our Team", icon: "fa-people-group", color: "#0891b2", suggestedHours: 96,
    subject: "Meet the team that will take care of you",
    purpose: "Humanizes the practice and reduces anxiety about visiting unfamiliar providers.",
  },
  {
    id: "office-tour", category: "personal",
    title: "Virtual Office Tour Invite", icon: "fa-building", color: "#7c3aed", suggestedHours: 120,
    subject: "Want to see our office before your first visit?",
    purpose: "Reduces first-visit anxiety by letting leads preview the space virtually.",
  },
  {
    id: "not-forgotten", category: "personal",
    title: "We Haven't Forgotten You", icon: "fa-heart", color: "#ea580c", suggestedHours: 144,
    subject: "We haven't forgotten about you, {First Name}",
    purpose: "Keeps the lead warm with a gentle, non-pushy message showing the practice still cares.",
  },
  {
    id: "birthday", category: "personal",
    title: "Birthday Greeting", icon: "fa-cake-candles", color: "#be185d", suggestedHours: 0,
    subject: "Happy Birthday from all of us at {Practice Name}!",
    purpose: "Birthday email with a small gift offer converts leads who haven't booked yet.",
  },
  {
    id: "new-patient-welcome", category: "personal",
    title: "New Patient Welcome (Post-Booking)", icon: "fa-calendar-check", color: "#15803d", suggestedHours: 0,
    subject: "You're all set — here's what to expect at your first visit",
    purpose: "Sent after booking is confirmed to reduce no-shows and prepare the patient.",
  },
  {
    id: "returning-patient", category: "personal",
    title: "Welcome Back (Returning Lead)", icon: "fa-rotate-right", color: "#0891b2", suggestedHours: 0,
    subject: "Great to hear from you again, {First Name}!",
    purpose: "Personalizes the experience for leads who have previously inquired or visited.",
  },
  {
    id: "thank-you-visit", category: "personal",
    title: "Thank You for Visiting", icon: "fa-star", color: "#b45309", suggestedHours: 2,
    subject: "Thank you for coming in today — how are you feeling?",
    purpose: "Post-visit follow-up that checks in and naturally sets up the next appointment.",
  },
  {
    id: "experience-check", category: "personal",
    title: "How Was Your Experience?", icon: "fa-face-smile", color: "#15803d", suggestedHours: 24,
    subject: "How was your experience with us, {First Name}?",
    purpose: "Gathers feedback and gives unhappy patients a chance to respond before leaving a bad review.",
  },
  {
    id: "our-promise", category: "personal",
    title: "Our Practice Values", icon: "fa-shield-heart", color: "#7c3aed", suggestedHours: 48,
    subject: "What we stand for — and why it matters for your care",
    purpose: "Communicates the practice's mission and differentiators to build long-term trust.",
  },
  {
    id: "care-update", category: "personal",
    title: "Care Plan Update", icon: "fa-clipboard-list", color: "#0891b2", suggestedHours: 168,
    subject: "An update on your care plan from {Practice Name}",
    purpose: "Keeps active and prospective patients informed about their treatment options.",
  },

  // ── Promotions (15) ─────────────────────────────────────────────────────────
  {
    id: "new-patient-offer", category: "promo", previewKey: "discount",
    title: "New Patient Special ($29)", icon: "fa-tag", color: "#15803d", suggestedHours: 120,
    subject: "$29 New Patient Special — expires this Friday",
    purpose: "Converts hesitant leads with a low-risk offer before they go elsewhere.",
  },
  {
    id: "flash-promo", category: "promo", previewKey: "flash",
    title: "24-Hour Flash Promo", icon: "fa-fire", color: "#b45309", suggestedHours: 168,
    subject: "24 hours only: Book today and save $40 on your first visit",
    purpose: "Creates hard urgency for fence-sitters — a short window drives immediate action.",
  },
  {
    id: "free-consult", category: "promo",
    title: "Free Consultation Offer", icon: "fa-gift", color: "#7c3aed", suggestedHours: 72,
    subject: "Claim your free 15-minute consultation — no strings attached",
    purpose: "Zero-risk entry point for leads unsure about committing to a paid visit.",
  },
  {
    id: "first-month-discount", category: "promo",
    title: "First Month Discount", icon: "fa-percent", color: "#15803d", suggestedHours: 96,
    subject: "20% off your first month of care — this week only",
    purpose: "Reduces the financial barrier for leads interested in ongoing treatment.",
  },
  {
    id: "seasonal-sale", category: "promo",
    title: "Seasonal Promotion", icon: "fa-sun", color: "#b45309", suggestedHours: 0,
    subject: "Our biggest sale of the season — don't miss it",
    purpose: "Seasonal urgency drives bookings during slower periods or ahead of busy seasons.",
  },
  {
    id: "referral-discount", category: "promo",
    title: "Refer a Friend Discount", icon: "fa-users", color: "#0891b2", suggestedHours: 240,
    subject: "Bring a friend and you both save — here's how",
    purpose: "Incentivizes referrals while giving uncommitted leads a social reason to book.",
  },
  {
    id: "bundle-package", category: "promo",
    title: "Care Package Bundle", icon: "fa-boxes-stacked", color: "#7c3aed", suggestedHours: 192,
    subject: "Save with a care package — our best value deal",
    purpose: "Bundles multiple visits at a discount to increase commitment and reduce churn.",
  },
  {
    id: "limited-spots", category: "promo",
    title: "Limited Availability Offer", icon: "fa-calendar-xmark", color: "#be185d", suggestedHours: 144,
    subject: "Only a few appointment slots left this week",
    purpose: "Scarcity-based conversion for leads who have been warming up but haven't booked.",
  },
  {
    id: "weekend-special", category: "promo",
    title: "Weekend Appointment Special", icon: "fa-calendar-week", color: "#ea580c", suggestedHours: 0,
    subject: "Weekend appointments available — and we're offering a special rate",
    purpose: "Targets leads who can't visit during the week with a weekend-specific offer.",
  },
  {
    id: "last-chance", category: "promo",
    title: "Last Chance Reminder", icon: "fa-hourglass-end", color: "#b45309", suggestedHours: 216,
    subject: "Last chance — your special offer expires tomorrow",
    purpose: "Reminder for leads who received a promo but haven't acted yet.",
  },
  {
    id: "vip-offer", category: "promo",
    title: "VIP Exclusive Offer", icon: "fa-crown", color: "#b45309", suggestedHours: 336,
    subject: "An exclusive offer just for you, {First Name}",
    purpose: "Makes the lead feel special with a personalized offer not available to everyone.",
  },
  {
    id: "family-discount", category: "promo",
    title: "Family Plan Discount", icon: "fa-house-chimney-user", color: "#15803d", suggestedHours: 288,
    subject: "Bring the family — group pricing available for your household",
    purpose: "Converts a single lead into multiple bookings by offering a family rate.",
  },
  {
    id: "back-to-school", category: "promo",
    title: "Back-to-School Special", icon: "fa-school", color: "#0891b2", suggestedHours: 0,
    subject: "Back-to-school season is here — take care of your health first",
    purpose: "Seasonal promotion targeting parents and students at a high-intent time of year.",
  },
  {
    id: "new-year-promo", category: "promo",
    title: "New Year Health Goal Deal", icon: "fa-champagne-glasses", color: "#7c3aed", suggestedHours: 0,
    subject: "Start the new year right — your health goal begins here",
    purpose: "Captures leads in a goal-setting mindset who are ready to invest in their health.",
  },
  {
    id: "year-end-benefits", category: "promo",
    title: "Use Benefits Before Year-End", icon: "fa-wallet", color: "#15803d", suggestedHours: 0,
    subject: "Your insurance benefits reset soon — book before you lose them",
    purpose: "Financial urgency for leads with insurance who may not realize benefits expire annually.",
  },

  // ── Value Delivery (20) ─────────────────────────────────────────────────────
  {
    id: "exercises", category: "value", previewKey: "exercises",
    title: "5 At-Home Exercises", icon: "fa-dumbbell", color: "#0891b2", suggestedHours: 240,
    subject: "5 exercises to relieve back pain at home (do these today)",
    purpose: "Builds authority and goodwill — positions your practice as the trusted health resource.",
  },
  {
    id: "whentovisit", category: "value", previewKey: "whentovisit",
    title: "When to See a Specialist", icon: "fa-circle-question", color: "#7c3aed", suggestedHours: 336,
    subject: "How do you know when it's time to come in? (read this)",
    purpose: "Educational guide that helps the lead self-identify as a candidate for care.",
  },
  {
    id: "diet-inflammation", category: "value",
    title: "Diet & Inflammation Tips", icon: "fa-apple-whole", color: "#15803d", suggestedHours: 120,
    subject: "The foods quietly making your pain worse (and what to eat instead)",
    purpose: "Delivers immediate value on a topic every pain patient cares about — builds trust fast.",
  },
  {
    id: "sleep-posture", category: "value",
    title: "Sleep Posture Guide", icon: "fa-moon", color: "#7c3aed", suggestedHours: 144,
    subject: "Are you sleeping in a position that's hurting your spine?",
    purpose: "Highly relevant content that ties directly to the reason the lead reached out.",
  },
  {
    id: "ergonomic-desk", category: "value",
    title: "Ergonomic Workspace Setup", icon: "fa-computer", color: "#0891b2", suggestedHours: 192,
    subject: "Your desk setup might be causing your pain — here's how to fix it",
    purpose: "Resonates deeply with office workers, the most common chronic pain demographic.",
  },
  {
    id: "stress-pain", category: "value",
    title: "Stress & Pain Connection", icon: "fa-brain", color: "#be185d", suggestedHours: 216,
    subject: "The surprising link between stress and your back pain",
    purpose: "Connects emotional and physical health, broadening the lead's understanding of their condition.",
  },
  {
    id: "desk-stretches", category: "value",
    title: "Stretching Routine for Desk Workers", icon: "fa-person-walking", color: "#0891b2", suggestedHours: 168,
    subject: "5 stretches you can do at your desk (takes 4 minutes)",
    purpose: "Highly actionable content that earns a click and positions you as a helpful expert.",
  },
  {
    id: "chiro-101", category: "value",
    title: "Understanding Chiropractic Care", icon: "fa-book-open", color: "#7c3aed", suggestedHours: 264,
    subject: "What chiropractic care actually is — and what it isn't",
    purpose: "Addresses common misconceptions and lowers hesitation for first-time patients.",
  },
  {
    id: "myths-debunked", category: "value",
    title: "5 Common Myths Debunked", icon: "fa-magnifying-glass", color: "#ea580c", suggestedHours: 288,
    subject: "5 myths about chiropractic care (most people still believe #3)",
    purpose: "High-engagement curiosity hook that overcomes objections in a non-salesy way.",
  },
  {
    id: "first-visit-guide", category: "value",
    title: "What to Expect at First Visit", icon: "fa-map", color: "#15803d", suggestedHours: 312,
    subject: "What your first appointment will actually look like — step by step",
    purpose: "Removes uncertainty about the first visit and reduces no-show anxiety.",
  },
  {
    id: "regular-adjustments", category: "value",
    title: "Benefits of Regular Adjustments", icon: "fa-chart-line", color: "#0891b2", suggestedHours: 360,
    subject: "What happens to your body when you get regular adjustments",
    purpose: "Plants the seed for ongoing care beyond the first visit — increases patient LTV.",
  },
  {
    id: "headache-relief", category: "value",
    title: "Headache Relief Tips", icon: "fa-head-side-mask", color: "#be185d", suggestedHours: 96,
    subject: "Natural headache relief tips that actually work (from our doctors)",
    purpose: "Addresses a top pain complaint and naturally leads to a consultation.",
  },
  {
    id: "neck-pain-guide", category: "value",
    title: "Neck Pain Deep Dive", icon: "fa-person", color: "#7c3aed", suggestedHours: 108,
    subject: "Your complete guide to understanding neck pain — and solving it",
    purpose: "Deep-dive educational content for leads specifically dealing with neck issues.",
  },
  {
    id: "sciatica-explained", category: "value",
    title: "Sciatica Explained", icon: "fa-leg", color: "#ea580c", suggestedHours: 132,
    subject: "Is it sciatica? Here's how to tell — and what to do about it",
    purpose: "Helps leads self-diagnose and understand that chiropractic care can help.",
  },
  {
    id: "posture-check", category: "value",
    title: "Posture Self-Assessment", icon: "fa-ruler-vertical", color: "#0891b2", suggestedHours: 156,
    subject: "Take this 60-second posture self-assessment (it's eye-opening)",
    purpose: "Interactive-style email that drives engagement and surfaces the lead's specific pain point.",
  },
  {
    id: "hydration-joints", category: "value",
    title: "Hydration & Joint Health", icon: "fa-droplet", color: "#0891b2", suggestedHours: 180,
    subject: "How much water should you really drink for joint health?",
    purpose: "Simple, accessible health education that builds trust without overwhelming the reader.",
  },
  {
    id: "walking-form", category: "value",
    title: "Walking Form Tips", icon: "fa-shoe-prints", color: "#15803d", suggestedHours: 204,
    subject: "Are you walking correctly? Most people aren't.",
    purpose: "Counter-intuitive hook that gets opens and positions the practice as experts.",
  },
  {
    id: "signs-you-need", category: "value",
    title: "5 Signs You Need a Specialist", icon: "fa-triangle-exclamation", color: "#ea580c", suggestedHours: 228,
    subject: "5 signs your body is telling you to see a specialist",
    purpose: "Helps hesitant leads recognize their own symptoms as reasons to book.",
  },
  {
    id: "core-strengthening", category: "value",
    title: "Core Strengthening for Back Pain", icon: "fa-dumbbell", color: "#15803d", suggestedHours: 252,
    subject: "3 core exercises that protect your lower back (5 minutes a day)",
    purpose: "Actionable, safe content that delivers value while reinforcing your expertise.",
  },
  {
    id: "pain-scale", category: "value",
    title: "Pain Scale Self-Assessment", icon: "fa-sliders", color: "#be185d", suggestedHours: 276,
    subject: "On a scale of 1–10 — how serious is your pain really?",
    purpose: "Gets the lead thinking critically about their pain level, often prompting action.",
  },

  // ── Re-engagement (15) ──────────────────────────────────────────────────────
  {
    id: "we-miss-you", category: "reengagement",
    title: "We Miss You (30 Days)", icon: "fa-heart-crack", color: "#be185d", suggestedHours: 720,
    subject: "We miss you, {First Name} — is everything okay?",
    purpose: "Warm re-engagement for leads who went cold after 30 days of silence.",
  },
  {
    id: "is-everything-ok", category: "reengagement",
    title: "Checking In (45 Days)", icon: "fa-circle-question", color: "#ea580c", suggestedHours: 1080,
    subject: "Just wanted to check in — are you still in pain, {First Name}?",
    purpose: "Second re-engagement attempt that leads with empathy rather than sales.",
  },
  {
    id: "winback-offer", category: "reengagement",
    title: "Win-Back Offer", icon: "fa-rotate-left", color: "#15803d", suggestedHours: 1440,
    subject: "We want to help — here's a special offer just for you",
    purpose: "Re-engages cold leads with a financial incentive after organic nudges have failed.",
  },
  {
    id: "last-chance-connect", category: "reengagement",
    title: "Last Chance to Connect", icon: "fa-flag-checkered", color: "#b45309", suggestedHours: 1680,
    subject: "This will be our last message — unless you want to hear from us",
    purpose: "Final re-engagement that creates closure and often triggers a last-minute response.",
  },
  {
    id: "we-improved", category: "reengagement",
    title: "What's New at Our Practice", icon: "fa-sparkles", color: "#7c3aed", suggestedHours: 960,
    subject: "A lot has changed since you first reached out — take a look",
    purpose: "Re-engages leads by highlighting new services, staff, or hours since they last inquired.",
  },
  {
    id: "week2-checkin", category: "reengagement",
    title: "Week 2 No-Response Check-In", icon: "fa-envelope-circle-check", color: "#0891b2", suggestedHours: 336,
    subject: "Haven't heard back — just making sure you're okay",
    purpose: "Catch-all for leads who never responded to the early sequence.",
  },
  {
    id: "week3-checkin", category: "reengagement",
    title: "Week 3 No-Response Check-In", icon: "fa-envelope-circle-check", color: "#0891b2", suggestedHours: 504,
    subject: "One last check-in before we give you some space",
    purpose: "Third no-response follow-up with empathy — signals the end of the intensive sequence.",
  },
  {
    id: "still-struggling", category: "reengagement",
    title: "Still Struggling with Pain?", icon: "fa-hand-holding-heart", color: "#be185d", suggestedHours: 792,
    subject: "Still dealing with pain? We can help — {First Name}",
    purpose: "Direct empathetic message that surfaces pain as the reason to re-engage.",
  },
  {
    id: "slot-available", category: "reengagement",
    title: "Open Slot Available", icon: "fa-calendar-plus", color: "#15803d", suggestedHours: 864,
    subject: "A slot just opened up — want it, {First Name}?",
    purpose: "Opportunistic re-engagement using appointment availability as the hook.",
  },
  {
    id: "inquiry-still-open", category: "reengagement",
    title: "Your Inquiry Is Still Open", icon: "fa-folder-open", color: "#ea580c", suggestedHours: 432,
    subject: "Your inquiry is still open — we're holding your spot",
    purpose: "Creates an open loop that many leads feel compelled to close.",
  },
  {
    id: "final-followup", category: "reengagement",
    title: "Final Follow-Up", icon: "fa-door-open", color: "#b45309", suggestedHours: 1920,
    subject: "Our last message — we respect your decision, {First Name}",
    purpose: "Polite final message that closes the loop and often triggers a last-minute response.",
  },
  {
    id: "reactivation-special", category: "reengagement",
    title: "Reactivation Special", icon: "fa-bolt", color: "#15803d", suggestedHours: 1200,
    subject: "Come back and save — a special offer for returning leads",
    purpose: "Pairs financial incentive with re-engagement messaging for leads past 6 weeks.",
  },
  {
    id: "seasonal-reengage", category: "reengagement",
    title: "Seasonal Re-engagement", icon: "fa-leaf", color: "#15803d", suggestedHours: 0,
    subject: "A new season is a great time to start feeling better",
    purpose: "Uses a seasonal transition as a natural reason to re-open the conversation.",
  },
  {
    id: "whats-holding-back", category: "reengagement",
    title: "What's Holding You Back?", icon: "fa-lock-open", color: "#7c3aed", suggestedHours: 600,
    subject: "Can I ask — what's keeping you from moving forward?",
    purpose: "Direct question-based email that prompts replies and surfaces real objections.",
  },
  {
    id: "a-lot-has-changed", category: "reengagement",
    title: "We've Grown Since You Reached Out", icon: "fa-arrow-trend-up", color: "#0891b2", suggestedHours: 1344,
    subject: "Since you first reached out, a lot has changed at {Practice Name}",
    purpose: "Re-engagement that highlights growth, new services, or improved outcomes.",
  },

  // ── Referral & Reviews (10) ─────────────────────────────────────────────────
  {
    id: "google-review", category: "referral",
    title: "Request a Google Review", icon: "fa-star", color: "#b45309", suggestedHours: 48,
    subject: "Would you take 90 seconds to review us on Google?",
    purpose: "Turns happy patients into public social proof that influences every future lead who searches you.",
  },
  {
    id: "refer-friend", category: "referral",
    title: "Refer a Friend Program", icon: "fa-user-plus", color: "#0891b2", suggestedHours: 168,
    subject: "Know someone who's in pain? Send them our way — you both benefit",
    purpose: "Turns existing patients into your best marketing channel with a structured referral program.",
  },
  {
    id: "success-story", category: "referral",
    title: "Share Your Success Story", icon: "fa-trophy", color: "#b45309", suggestedHours: 336,
    subject: "Would you share your experience with others? (It only takes a minute)",
    purpose: "Collects testimonials for use in marketing, on the website, and in future campaigns.",
  },
  {
    id: "tag-social", category: "referral",
    title: "Tag Us on Social Media", icon: "fa-hashtag", color: "#be185d", suggestedHours: 120,
    subject: "Had a great visit? Tag us — and we'll feature you on our page",
    purpose: "Generates user-created social content and broadens organic reach to the patient's followers.",
  },
  {
    id: "referral-thank-you", category: "referral",
    title: "Thank You for the Referral", icon: "fa-heart", color: "#be185d", suggestedHours: 0,
    subject: "Thank you for sending your friend our way — here's your reward",
    purpose: "Closes the referral loop and rewards the behavior to encourage it again.",
  },
  {
    id: "review-reminder", category: "referral",
    title: "Review Follow-Up Reminder", icon: "fa-star-half-stroke", color: "#b45309", suggestedHours: 72,
    subject: "Still haven't had a chance to review us? It takes 60 seconds",
    purpose: "Gentle second ask for patients who intended to leave a review but forgot.",
  },
  {
    id: "nps-score", category: "referral",
    title: "How Likely to Recommend?", icon: "fa-chart-bar", color: "#0891b2", suggestedHours: 96,
    subject: "Quick question — how likely are you to recommend us?",
    purpose: "NPS-style email that identifies promoters to ask for reviews and detractors to recover.",
  },
  {
    id: "testimonial-request", category: "referral",
    title: "Testimonial Request", icon: "fa-quote-left", color: "#7c3aed", suggestedHours: 240,
    subject: "Can we feature your story on our website?",
    purpose: "Requests a longer testimonial from a satisfied patient for use in marketing materials.",
  },
  {
    id: "tell-your-friends", category: "referral",
    title: "Tell Your Friends", icon: "fa-share-nodes", color: "#ea580c", suggestedHours: 192,
    subject: "If we've helped you, share the love — help a friend feel better too",
    purpose: "Simple, warm referral ask that doesn't feel transactional — works best after a positive outcome.",
  },
  {
    id: "vip-referral-reward", category: "referral",
    title: "VIP Referral Rewards Club", icon: "fa-crown", color: "#b45309", suggestedHours: 720,
    subject: "Join our VIP referral club — earn rewards every time you send someone our way",
    purpose: "Long-term referral incentive program that keeps engaged patients actively sending leads.",
  },

  // ── Urgency & FOMO (10) ─────────────────────────────────────────────────────
  {
    id: "only-3-spots", category: "urgency",
    title: "Only 3 Spots Left This Week", icon: "fa-fire-flame-curved", color: "#dc2626", suggestedHours: 96,
    subject: "Heads up — we only have 3 openings left this week",
    purpose: "Scarcity-based urgency for leads in the consideration phase who just need a push.",
  },
  {
    id: "high-demand", category: "urgency",
    title: "High Demand This Month", icon: "fa-arrow-trend-up", color: "#ea580c", suggestedHours: 144,
    subject: "We're booking up fast — here's what's left",
    purpose: "Social proof + scarcity combination that validates the practice's popularity.",
  },
  {
    id: "almost-full", category: "urgency",
    title: "Nearly at Capacity", icon: "fa-calendar-minus", color: "#dc2626", suggestedHours: 168,
    subject: "Our schedule is almost full for this month",
    purpose: "Creates genuine urgency without fabricating a special offer — works well for popular practices.",
  },
  {
    id: "spot-released", category: "urgency",
    title: "Your Spot May Be Released", icon: "fa-calendar-xmark", color: "#b45309", suggestedHours: 192,
    subject: "We're holding a spot for you — but we can't hold it much longer",
    purpose: "Psychological urgency that feels personal and prompts immediate action.",
  },
  {
    id: "price-increase", category: "urgency",
    title: "Before Our Price Increase", icon: "fa-arrow-up-right-dots", color: "#dc2626", suggestedHours: 216,
    subject: "Book before our pricing updates on [date] — lock in today's rate",
    purpose: "Price anchoring that rewards early action and creates genuine financial urgency.",
  },
  {
    id: "others-booking", category: "urgency",
    title: "Others in Your Area Are Booking", icon: "fa-location-dot", color: "#ea580c", suggestedHours: 48,
    subject: "Others in {City} are booking fast — don't wait",
    purpose: "Community-based FOMO using local social proof to create action.",
  },
  {
    id: "offer-expires-midnight", category: "urgency",
    title: "Offer Expires at Midnight", icon: "fa-clock", color: "#dc2626", suggestedHours: 240,
    subject: "⏰ Midnight deadline — your offer disappears tonight",
    purpose: "Hard deadline creates maximum urgency for leads who have been sitting on an offer.",
  },
  {
    id: "dont-let-pain-worsen", category: "urgency",
    title: "Don't Let Pain Get Worse", icon: "fa-triangle-exclamation", color: "#b45309", suggestedHours: 120,
    subject: "Waiting usually makes pain worse — here's why",
    purpose: "Medical urgency framing that positions delayed action as harmful to the lead's health.",
  },
  {
    id: "cost-of-waiting", category: "urgency",
    title: "The Cost of Waiting", icon: "fa-money-bill-wave", color: "#dc2626", suggestedHours: 288,
    subject: "What waiting another month might actually cost you",
    purpose: "Frames inaction as more expensive than action — tackles the 'I'll wait' objection head-on.",
  },
  {
    id: "health-goal-deadline", category: "urgency",
    title: "Health Goal Deadline", icon: "fa-bullseye", color: "#b45309", suggestedHours: 336,
    subject: "The year is half over — how's that health goal going?",
    purpose: "Time-based accountability that connects the lead's stated goals to booking an appointment.",
  },

  // ── Seasonal (10) ───────────────────────────────────────────────────────────
  {
    id: "new-year-health", category: "seasonal",
    title: "New Year Health Goals", icon: "fa-champagne-glasses", color: "#7c3aed", suggestedHours: 0,
    subject: "New year, new you — let's start with your health",
    purpose: "Capitalizes on the resolution mindset of January to convert leads who've been delaying.",
  },
  {
    id: "valentines-self-care", category: "seasonal",
    title: "Valentine's Day Self-Care", icon: "fa-heart", color: "#be185d", suggestedHours: 0,
    subject: "This Valentine's Day, treat yourself — your body will thank you",
    purpose: "Repositions Valentine's Day as a self-care occasion, making booking feel like a gift to yourself.",
  },
  {
    id: "spring-reset", category: "seasonal",
    title: "Spring Health Reset", icon: "fa-seedling", color: "#15803d", suggestedHours: 0,
    subject: "Spring is here — time to reset, refresh, and feel your best",
    purpose: "Uses the energy of spring renewal to prompt leads to take action on their health.",
  },
  {
    id: "back-to-school-health", category: "seasonal",
    title: "Back-to-School Health Check", icon: "fa-school-flag", color: "#0891b2", suggestedHours: 0,
    subject: "School season is here — make sure the whole family is feeling their best",
    purpose: "Targets parent leads during the back-to-school transition with a family-health hook.",
  },
  {
    id: "fall-wellness", category: "seasonal",
    title: "Fall Wellness Check", icon: "fa-leaf", color: "#b45309", suggestedHours: 0,
    subject: "Fall is the perfect time to check in with your health",
    purpose: "Seasonal transition used as a natural prompt to book a wellness visit.",
  },
  {
    id: "thanksgiving-gratitude", category: "seasonal",
    title: "Thanksgiving Gratitude Note", icon: "fa-hand-holding-heart", color: "#b45309", suggestedHours: 0,
    subject: "Grateful for you — wishing you and your family a healthy holiday",
    purpose: "Relationship-building seasonal email that keeps the practice top-of-mind during holidays.",
  },
  {
    id: "holiday-stress-relief", category: "seasonal",
    title: "Holiday Season Stress Relief", icon: "fa-star", color: "#dc2626", suggestedHours: 0,
    subject: "The holidays are stressful on your body — here's how we can help",
    purpose: "Positions the practice as relief during a naturally high-stress time of year.",
  },
  {
    id: "year-end-benefits-reminder", category: "seasonal",
    title: "Year-End Insurance Reminder", icon: "fa-wallet", color: "#15803d", suggestedHours: 0,
    subject: "Your insurance benefits expire Dec 31 — use them or lose them",
    purpose: "Financial urgency tied to the calendar that gets insurance-holding leads to finally book.",
  },
  {
    id: "summer-recovery", category: "seasonal",
    title: "Summer Activity Recovery", icon: "fa-sun", color: "#b45309", suggestedHours: 0,
    subject: "Summer can be hard on your body — here's how to recover",
    purpose: "Targets active leads post-summer with recovery-focused messaging.",
  },
  {
    id: "mothers-fathers-day", category: "seasonal",
    title: "Mother's / Father's Day Special", icon: "fa-gift", color: "#be185d", suggestedHours: 0,
    subject: "Give the gift of feeling great — our Mother's Day offer is live",
    purpose: "Gift-angle seasonal promotion that converts both the recipient and the gift-giver.",
  },

  // ── Email Series (5) ────────────────────────────────────────────────────────
  {
    id: "series-intro", category: "series",
    title: "Series Day 1: Your Pain Guide", icon: "fa-list-ol", color: "#7c3aed", suggestedHours: 48,
    subject: "Your 5-day guide to understanding and overcoming pain — Day 1",
    purpose: "Kicks off a nurture series that delivers value daily and keeps the lead engaged all week.",
  },
  {
    id: "series-day2", category: "series",
    title: "Series Day 2: Root Causes", icon: "fa-magnifying-glass-chart", color: "#7c3aed", suggestedHours: 72,
    subject: "Day 2: The hidden root causes of your chronic pain",
    purpose: "Builds on Day 1 by diving deeper into why pain persists, positioning care as the solution.",
  },
  {
    id: "series-day3", category: "series",
    title: "Series Day 3: Why Meds Fall Short", icon: "fa-pills", color: "#7c3aed", suggestedHours: 96,
    subject: "Day 3: Why pain medication often makes things worse long-term",
    purpose: "Challenges conventional approaches and positions your practice as the superior alternative.",
  },
  {
    id: "series-day4", category: "series",
    title: "Series Day 4: What Care Actually Does", icon: "fa-stethoscope", color: "#7c3aed", suggestedHours: 120,
    subject: "Day 4: What actually happens during a chiropractic adjustment",
    purpose: "Demystifies the process and eliminates fear or skepticism about the first visit.",
  },
  {
    id: "series-day5", category: "series",
    title: "Series Day 5: Your Next Step", icon: "fa-flag", color: "#7c3aed", suggestedHours: 144,
    subject: "Day 5: You've learned a lot this week — here's your next step",
    purpose: "Closes the series with a strong CTA after 5 days of trust-building value delivery.",
  },
];
