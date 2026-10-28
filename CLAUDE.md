# French Aesthetic: website project brief

This is the working brief for the new website of two related Pakistani businesses:

- **French Medical Aesthetics (FMA)**: a medical aesthetics clinic with 4 branches (3 in Lahore, 1 in Karachi).
- **French Aesthetics Academy (FAA)**: the clinic's aesthetics training academy, in Lahore only.

It replaces the current, unfinished WordPress/Elementor site on frenchaesthetic.com.

Compiled 2026-10-28 from three owner briefs, kept in `C:\Users\DELL\Downloads`:

1. *French Aesthetic Website Project Handoff Brief (1).docx*: hosting, stack, audit of the live site, data model, build plan.
2. *FMA Website Content Master Brief.docx*: every clinic fact, brand system, compliance rules.
3. *French Aesthetics Academy Website Content & Build Brief.docx*: every academy fact, page copy, WhatsApp codes.

## How to use this file

- **Order of authority.** When sources disagree, follow this order:
  1. The owner's later answers, recorded in "Owner answers log" at the end of this file.
  2. The two content briefs (FMA, FAA). They are the source of truth for facts, copy, brand and claims.
  3. The handoff brief. It is the source of truth for stack, hosting, data model and build phases.
- Brand guidelines override every design placeholder.
- **Stress-test before building.** If something here is wrong or risky, say so before writing code.
- **Never invent facts.** That covers prices, doctors, degrees, PMDC numbers, addresses, hours, accreditation, device brands and patient numbers. A missing fact becomes a CMS field left empty, or a visible "[CONFIRM]" placeholder in staging. Never fill it with plausible text.
- **Never put secrets in this repo.** Use `.env` for API keys, database URLs and Payload secrets, and keep `.env` in `.gitignore`. Internal finance, revenue targets, ad budgets, CSR performance and funnel figures must never appear in the code, seed data or site.

### Status labels (from the content briefs)

Only items marked READY or CONFIRMED may go live without the owner's sign-off.

| Label | Meaning | On the site? |
| --- | --- | --- |
| READY / CONFIRMED / DECISION | Owner-confirmed for public use | Yes |
| CONFIRM | Known internally, but wording, number or address not signed off | Only after sign-off |
| OWNER CLAIM | Owner said it, no proof seen | Only with proof |
| HISTORICAL | Older source, not reconfirmed | No |
| CONFLICT | Sources disagree | No, until the owner picks one |
| UNVERIFIED | Not checked | No |
| INTERNAL | Confidential | Never |
| MISSING | Not provided | Placeholder only |

Seed data should carry the status, so unconfirmed items can be kept unpublished. For example, add a `status` field or set `_status: draft` in Payload.

## 1. Architecture decision: one site or two (OPEN)

The handoff brief plans **one site** on frenchaesthetic.com, with `/clinic` and `/academy`. The FAA brand rules pull the other way:

- Never show the FMA and FAA logos side by side.
- Never use the clinic tagline "Beauty Heaven" with the academy logo.
- Mention the clinic only through the endorsement line "The training academy of French Medical Aesthetics clinic".

The FMA content brief treats the Academy as a separate business. The owner also holds frenchaestheticsacademy.com.

**Build so either answer works.** Use one Next.js + Payload codebase, where the Clinic and the Academy each have:
- their own layout, header, logo, menu, footer and mobile sticky bar
- no shared logo lockup
- a neutral shared home (`/`) that shows two doors, and does not use the clinic logo as the master brand

If the owner chooses two sites later, frenchaestheticsacademy.com can serve the `/academy` tree through host-based routing in middleware. No content model changes are needed. Until the owner decides, the default is one site, with frenchaestheticsacademy.com 301-redirecting to `/academy`. Keep its email working.

## 2. Tech stack (decided)

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS; Framer Motion for subtle scroll motion only |
| CMS + admin | Payload CMS 3, inside the Next.js app, admin at `/admin` |
| Database | MongoDB Atlas or Neon Postgres, free tier. **Ask the owner which before installing.** Hostinger Business offers MySQL only, which Payload does not support. Neon's free tier scales to zero, so the first request after idle is slow. |
| Media | Cloudinary or Cloudflare R2. **Ask which.** The app's disk does not survive a redeploy. |
| Booking / enrollment | Saved in Payload; staff alerted by email and WhatsApp |
| Enrollment payment | Phase 1: bank transfer / JazzCash with a proof upload. Phase 2: Safepay or PayFast. Stripe does not serve Pakistan-based merchants. |
| Reviews | Google reviews widget (real third-party proof) |
| Node | 22.23.4+ or 24.22.1+ (Payload 3.92's own minimum, so Node 20 no longer works). Pin Hostinger to Node 22. |

Rejected options: SQLite on Hostinger (data lost on redeploy), static export (loses forms, admin and image optimisation), WordPress, Sanity.

### Hostinger Business constraints (the build must respect all of these)

- Node.js apps run only on Business and Cloud plans, with up to 5 Node.js websites on Business.
- Deploy from GitHub ("Import Git Repository", which rebuilds on every push) or a .zip upload. One GitHub account per hosting plan.
- A Node.js site must be added as a **new website**. It cannot replace the existing WordPress site in place.
- There are 120 processes, threads included, shared across the plan. Hitting the limit returns 503 errors.
- Every request is cut off at 120 seconds. Long jobs go to cron, not to request handlers.
- No custom ports, Docker, Redis or Python services. Background workers and timers stop on redeploy, so send notifications inside the request, or from cron.
- Only the last 2 successful builds are kept, and there is no Stop button.
- `package.json` must have working `build` and `start` scripts, and `start` must respect the `PORT` env var.
- If the app outgrows this, move to a Hostinger Cloud plan.

### Domains and accounts

| Item | Where | Notes |
| --- | --- | --- |
| frenchaesthetic.com | GoDaddy | Main domain. Currently serves the WordPress site. |
| Business Web Hosting | Hostinger | Active, auto-renews 2027-05-24 |
| frenchaestheticsacademy.com | Hostinger | Active, auto-renews 2027-06-23. Role undecided (see section 1). |
| Starter Business Email on frenchaestheticsacademy.com | Hostinger | Trial, auto-renews 2027-08-02 |

**Cut-over plan:**
1. Back up WordPress.
2. Build and test the Node.js app on a temporary domain or subdomain.
3. On launch day, remove the WordPress site, attach frenchaesthetic.com to the Node.js app, and put the 301 redirects live.
4. Before switching nameservers, re-create any MX records for info@frenchaesthetic.com in the new DNS, or email will stop.

## 3. Brand design system (applies to both sides)

The brand guidelines in both content briefs agree. They replace the handoff brief's placeholder palette (ivory-led, Inter).

### Colour tokens

| Token | Hex | Use |
| --- | --- | --- |
| `--charcoal` | #0D0D0D | Main background, header, footer, headings on ivory |
| `--deep-charcoal` | #1C1C1E | Cards, panels, price/offer boxes |
| `--gold` | #C9A96E | Logo, accents, CTA buttons, lines, icons |
| `--ivory` | #F7F4EF | Text on dark; light section backgrounds |
| `--slate` | #4A4A4A | Body text on ivory only |
| `--warm-gray` | #9B9B9B | Footer text, captions on dark |
| `--dusty-rose` | #C5A49B | Photo tint only, never text |

- Balance: about 60% charcoal, 25% ivory, 10% gold, 5% slate/gray. Gold stays under 15% of any screen.
- No purple, maroon, plum, neon or pastel. Those are competitor colours.
- Contrast pairs that pass: ivory on charcoal 17.7, gold on charcoal 8.7, gold on deep charcoal 7.6, charcoal on gold (buttons) 8.7, slate on ivory 8.1.
- Pairs that must never be used: gold text on ivory (2.0), warm gray on ivory (2.5), slate on charcoal (2.2). Gold on ivory is allowed for lines only.

### Typography (Google Fonts, via `next/font`)

- **Headings:** Cormorant Garamond Bold / Bold Italic. A second line in gold italic is the signature style. Fallback: Cambria, serif.
- **Everything else:** Nunito Sans (Regular, SemiBold, Bold, ExtraBold), covering body, nav, buttons, forms, prices and phone numbers. Fallback: Arial, sans-serif.
- All numbers go in Nunito Sans, because Cormorant has old-style numerals.
- Labels are caps with 3–4 px letter spacing. Body text is never below 16 px. No third font.

### Components

- **Primary CTA:** gold fill, charcoal text, Nunito Sans Bold/ExtraBold, 6 px radius. One primary CTA per section.
- **Treatment chips:** a pill with a 1.5 px gold outline and ivory caps text.
- **Price / offer panel:** deep-charcoal fill with a 1.5 px gold border. Prices appear only inside these panels.

### Logos

- **FMA:** master file `brand/FMA_Logo_Master.svg` (monogram + wordmark + "BEAUTY HEAVEN"). The header uses the horizontal version, gold on charcoal; the favicon uses the monogram. Minimum sizes: horizontal 240 px, stacked 160 px, monogram 40 px. Never put the gold logo on ivory. Still missing: the designer's vector originals.
- **FAA:** the only official mark is a rectangle with a knocked-out serif "F" plus the wordmark "FRENCH AESTHETICS / ACADEMY". The gold "F with face profile" is not an academy logo. Files come from `11_FAA_Logo_Pack.zip` (stacked / horizontal / monogram × white / black / gold; check whether the zip has SVGs). The header uses horizontal, the footer stacked, the favicon the monogram. Minimum sizes: horizontal 220 px, monogram 40 px.
- **Both:** never stretch, rotate, recolour, add shadows, glows or gradients, or redraw a logo with AI.
- **Old logo PNGs** on the WordPress site, useful as a stopgap only: `wp-content/uploads/2025/08/FMAwhite-vertical-Logo.png`, `FMA-white-Logo.png`, `/2026/06/FMA-01.png`, `FMA-Logo-300x300.png`.

### Layout, motion and photography

- Generous whitespace, large serif headings, thin dividers and editorial image crops. Mobile first.
- Subtle fade-ins under 400 ms, switched off when the visitor prefers reduced motion.
- **Never:** popups, prize draws, sale banners, red sale bursts, strike-through prices, animated counters, "0" stat counters, stock-photo collages, or a live chat widget that competes with WhatsApp.
- **Photos** are real clinic, doctor, staff, student and machine-in-use shots only, with a warm grade (slightly desaturated, lifted shadows) and written consent from every identifiable person.
  - No stock faces and no AI-generated people. The current site's doctor photos are AI-made and must not be reused.
  - No needle close-ups near the eye.
  - No visible machine brand names.
  - Academy: no certificate-holding poses.
- **Performance:** Lighthouse 90+ on mobile; under 3 s on 4G. Use `next/image` or a Cloudinary loader, and serve WebP/AVIF.

## 4. Lead flow (resolved across the briefs)

The handoff brief says "form first, WhatsApp fallback". Both content briefs say "WhatsApp first". The CSR teams already work from WhatsApp and a shared lead sheet. **The build therefore does both:**

- The primary CTA everywhere is a WhatsApp deep link with a pre-filled message and a tracking code.
- A booking or enrollment form is offered beside it, saved to Payload, with the same source/tracking fields.
- Every WhatsApp click and form submit fires a GA4 event and a Meta Pixel "Contact"/"Lead" event, with the page, the branch or course, and the code. Capture UTM parameters into a cookie and save them with each form record.
- Link format: `https://wa.me/92XXXXXXXXXX?text=<url-encoded message>`. Keep the numbers in the `SiteSettings` global and the `Branches` collection, never hard-coded.

## 5. Clinic: French Medical Aesthetics

### Identity

| Item | Value | Status |
| --- | --- | --- |
| Brand name | French Medical Aesthetics (short form FMA). Do not use "French Aesthetic" or "French Aesthetics" for the clinic. | READY |
| Tagline | Beauty Heaven (clinic only) | READY |
| Domain | frenchaesthetic.com | READY |
| Positioning | Premium aesthetic care with fair, transparent prices; latest technology | READY |
| Personality | Refined, modern, warm, accessible | READY |
| Founder & CEO | Fahad Nazeer (as stated on the current site) | CONFIRM title and bio |
| Founding year, mission, licences (PHC / SHCC), awards | Not provided | MISSING. Do not invent. |

**Draft About copy** (awaiting owner approval):

> French Medical Aesthetics brings advanced aesthetic treatments to Lahore and Karachi, delivered by qualified doctors in a calm, premium clinic setting. We combine modern technology with a personal consultation, so every treatment plan starts with your skin, your goals and an honest assessment of what will suit you. Our belief is simple: premium care should be within reach. We keep our pricing fair and transparent, without compromising on technology, hygiene or medical oversight.

### Branches (all 4 confirmed active on 21 Oct 2026)

| Branch | City | Address on record | Consultation | Status |
| --- | --- | --- | --- | --- |
| DHA Phase 4 | Lahore | Plaza No. 10, CCA, Block DD, Phase IV, DHA, Lahore 54800 | Free + AI skin analysis | CONFIRM formatting |
| Allama Iqbal Town | Lahore | Not in the FMA brief. The FAA brief gives "Plaza No. 10, Main Boulevard, Hunza Block, Allama Iqbal Town, Lahore" for the academy campus, which may be the same building. | Paid (fee MISSING) | CONFIRM |
| MM Alam Road, Gulberg III | Lahore | 92-A/B, 1 MM Alam Road, Block B1, Gulberg III, Lahore. Newest branch, opened about 16 Oct 2026. | Free + AI skin analysis | CONFIRM |
| Bahadurabad | Karachi | Main Bahadurabad, Char Minar Chowrangi, Karachi (short form). Older full form: 30-C, 1st Floor, Qazi Court, above Soneri Bank, BMCHS Sharafabad, Bahadurabad. | Free + AI skin analysis | CONFIRM full address |

- Each branch gets its own location page, which helps local search.
- "Free consultation" wording appears only on the DHA, MM Alam and Karachi pages. Allama Iqbal Town shows "Consultation fee applies".
- Never imply every service or doctor is at every branch.
- Missing for every branch: hours, branch WhatsApp, Google Maps pin, Google Business Profile link, photos, services available, doctors on duty, parking and landmark notes.
- Hours on the current site are "Mon–Sat, 11 AM or 12 PM to 8 PM; Sunday closed or by appointment". These contradict each other, so CONFIRM them per branch.

### Numbers and channels

| Number / channel | Use | Status |
| --- | --- | --- |
| 0311-1171788 (UAN) | The only number in the header and footer | CONFIRM WhatsApp-enabled and used by all branches |
| 0311 2749975 | Karachi branch WhatsApp | CONFIRM |
| 0311 2748805 | Lahore DHA WhatsApp | CONFIRM |
| 0311 1131555 | Lahore WhatsApp | CONFIRM |
| +92 333 4486010 | On the current site; role unknown | CONFIRM clinic vs admissions |
| 0316-6660505, +92 311 2749972, 0311 2748804, +92 370 4135008 | Old or unknown | Do not use for the clinic |
| 0311 2748801 | Recruitment | Careers page only, if still active |
| info@frenchaesthetic.com | Email | Use this. Not the typo frencaesthetic.com or the gmail address. |
| Instagram | @frenchmedicalaesthetics vs @frenchaestheticsofficial | CONFLICT |
| Facebook | Page name "French Aesthetics" | CONFIRM URL |

The floating WhatsApp button opens a pre-filled message: "Hi, I want to book a consultation at [branch]. (Website)".

### Treatments

Publish only READY services. The current site's 38 service pages are **not** the source list. Many of them are historical or off-brand.

**READY at launch:**

| Group | Treatments | Price on record (PKR) |
| --- | --- | --- |
| Face lifting & tightening | HIFU 22D skin tightening (hero); Non-Surgical Face Lifting, shown as "EMFACE" only once the genuine device is confirmed (hero); Morpheus8 RF microneedling; Thread lift | HIFU 40,000–50,000 per session (display CONFIRM). EMFACE: CONFLICT between 40,000 and 50,000. |
| Skin & facials | HydraFacial; Carbon (charcoal) laser facial; Chemical peels; Laser skin treatments (face) | Facials from about 6,000 |
| Injectables | Botox (anti-wrinkle); Dermal fillers; Liquid rhinoplasty; Fat dissolving | Not provided |
| Diagnostic | AI Skin Analysis | Free with consultation, at participating branches |

**HISTORICAL. Model these in the CMS but leave them unpublished until the owner reconfirms:** microneedling, acne scar, open pores, CO2 fractional, Pico, Q-Switch, Erbium YAG, LED therapy, PDRN, laser hair removal, tattoo removal, PRP hair, hair restoration, hair transplant (only with the surgeon named), HIFU 7D, fat freezing, body contouring, weight management, Hijama.

**Do not publish without medical sign-off:** exosome scalp treatment, IV glutathione, and any skin whitening or lightening.

**Only on the current WordPress site, in neither content brief. Ask the owner before including:** Profhilo, mesotherapy, skin boosters, keloid treatment, mole removal, dark circles, melasma, stretch marks, stem cell therapy, beard growth, dandruff, medical dermatology (fungal infection, nail infection, skin allergy, vitiligo), and a wellness group (acupuncture, hijama, physiotherapy, reflexology, erectile dysfunction).
- The wellness group dilutes the luxury medical-aesthetics position. The owner must decide whether it stays, moves to its own section, or goes.

**Categories:** Skin & Facials · Laser Treatments · Face Lifting & Tightening · Injectables · Hair · Body. "Hydra Facial" is a treatment, not a category.

**Technology:** describe treatments by technology type (focused ultrasound, RF microneedling, laser, AI skin analysis), not device models. Owner decision D-005 bans machine names and model numbers.
- Do not claim FDA approval, CE marking or "latest in Pakistan".
- Trademarked names (EMFACE, Morpheus8, HydraFacial) appear only if the clinic uses the genuine branded system.

**Draft descriptions** for each service are in FMA brief §4.2. They are neutral drafts and still need a doctor's review. Reusable facts from the current site's Botox FAQ: onset in 3–7 days, full effect in 10–14 days, lasts 3–4 months.

**Every treatment page needs from the owner:** branch availability, performing doctor, session duration, typical sessions, downtime, approved price or "from" price, contraindications, aftercare, and consented real photos.

### Doctors (publish nothing undocumented)

The current team is these three (owner, 28 Oct 2026). Dr. Kashmala and Dr. Sarah have left the clinic: never publish them.

| Name | Title on record | Status |
| --- | --- | --- |
| Dr. Iqra Fatima | Dermatologist (also the Academy's Lead Trainer) | Current. Ready to use the title. CONFIRM degree (FCPS/MCPS?), PMDC number, consented photo. |
| Dr. Maria (possibly Maria Massood) | **Aesthetic Physician** (owner, 28 Oct 2026) | Current. Title CONFIRMED. Degree (MBBS or BDS) and PMDC number still to confirm. |
| Dr. Sadaf (possibly Sadaf Arif) | **DPT · Physical Therapist** (owner, 28 Oct 2026) | Current. CONFIRMED. A physical therapist: never show her as an injector or performing doctor for medical procedures. |

### Pricing

The recommended option, pending the owner's decision, is **"From PKR X"** on approved hero treatments and "Ask for a quote on WhatsApp" everywhere else.
- **Tone:** say "fair price", "transparent pricing", "consultation included". Never say "cheap", "sasta", "lowest price" or "half price", and never show competitor prices.
- Remove the current "20% Off All Treatments This Month" promo bar.

### Booking

The fields are a merge of both briefs:
- name · mobile (+92, WhatsApp) · email (optional) · **branch** (dropdown of 4) · treatment or concern (dropdown from published treatments only) · preferred date and time slot · notes
- "How did you hear about us" (Instagram, Facebook, Google, Friend, Walk-in)
- a consent tickbox for WhatsApp contact
- hidden source/UTM fields

Gender and age (in the handoff model) are optional; keep them optional.

**Flow:**
1. The record is saved with status "new".
2. The branch CSR gets an email and a WhatsApp alert.
3. The patient sees a confirmation page with the branch's WhatsApp button.
4. Staff confirm the slot and update the status.

Also offer "Send a photo on WhatsApp for a free assessment". A booking deposit is for later; test it first on high-ticket treatments.

## 6. Academy: French Aesthetics Academy

### Identity

| Item | Detail | Status |
| --- | --- | --- |
| Name | French Aesthetics Academy, only this name | CONFIRMED |
| Relationship | The training academy of French Medical Aesthetics clinic (endorsement line only) | CONFIRMED |
| Brand line | Real practice. Real confidence. | CONFIRMED |
| Positioning | Proof over promises: real practice, named faculty, small batches. Never cheap price or borrowed foreign authority. | CONFIRMED |
| City | Lahore. Students travel from Gujranwala, Sialkot, Kasur and Daska. | CONFIRMED |
| Batch rules | Max 20 students per batch, max 2 batches per month, no training on Sundays | DECISION |
| Accreditation | **None held.** ACTD was rejected and must never be used. CPD and USA / Belgium / Pakistan registrations are UNVERIFIED, so show no badges. | CONFIRMED |

**USPs, strongest first:**
1. A 2-week supervised internship is included at no extra fee.
2. Doctors perform procedures themselves on real patients.
3. Max 20 seats per batch.
4. A dermatologist-led team, with Lead Trainer Dr. Iqra.
5. The academy of a working clinic.
6. Flexible timing for doctors.

Do not use these as USPs: "affordable", "most comprehensive", "latest machines".

**Language:** hooks in Roman Urdu, details in English. Never repeat the same line in both languages.

### Courses

| | Non-Invasive Aesthetics | Invasive Aesthetics |
| --- | --- | --- |
| For | Salon owners, beauticians, makeup artists, hair stylists, nail technicians, skin care specialists, cosmetology students, beginners, career changers. **No experience and no PMDC needed.** Copy stays gender-neutral. | **MBBS and BDS doctors only, PMDC registered:** house officers, MOs, GPs, dentists, clinic owners, career-break doctors |
| Format | 1 week hands-on training + 2 weeks internship on live clients, supervised by doctors (3 weeks / 21 days) | 1 week intensive training + 2 weeks clinical internship; doctors perform procedures on real patients, supervised |
| Fee (PKR) | 120,000 (regular). Display decision: CONFIRM. | 180,000–200,000 range (OWNER CLAIM). One number needed. |
| Batch start | **15th of each month** (owner, 28 Oct 2026). A Sunday start moves to Monday (CONFIRM this still applies). | **20th of each month** (owner, 28 Oct 2026; replaces the 22nd). Same Sunday rule. |
| Campus | Iqbal Town | Iqbal Town (assumed for Nov; CONFIRM) |
| Timing | 1:00–5:00 PM (Aug 2026 batch); CONFIRM current hours | Flexible; exact slots CONFIRM |
| Featured | HydraFacial, BB Glow, Chemical Peels, HIFU, Laser Hair Removal, AI Skin Analysis & consultation | Facial anatomy, injectables, fillers, PDO threads, PRP, skin boosters, complication management |
| Syllabus | 20 modules (FAA brief §5) | 15 modules (FAA brief §6) |
| Open | Certificate issuer and wording; installments; refund / reschedule policy | Cases per doctor in internship; patient consent process |

**Non-Invasive syllabus (20 modules):**
- Anatomy & Physiology of Skin
- Skin Types & Analysis
- Ageing of the Face
- Patient Assessment & Selection
- Ethical Considerations
- Chemical Peels
- Laser Therapies
- Microneedling
- HydraFacial
- BB Glow
- HIFU (Face & Body)
- Business Development & Marketing
- Infection Control, Hygiene & Safety
- AI Skin Analyzer
- Fat Freezing (Cryolipolysis)
- Pico Laser
- Q-Switch Laser
- EMS Body Contouring
- Client Consultation & Treatment Planning
- Practical Hands-On Training

Regulatory risk (Punjab Healthcare Commission): list Pico, Q-Switch and Microneedling as "overview / theory" unless the owner confirms the practical work is done only under a doctor. Do not list PRP in this course.

**Invasive syllabus (15 modules, website-safe wording):**
- Facial Anatomy & Physiology
- Patient Assessment & Selection
- Neuromodulator (anti-wrinkle) injections
- Dermal Fillers
- Threads (PDO)
- Platelet Rich Plasma (PRP)
- Skin Boosters & Mesotherapy
- Fat Dissolving Injections
- Advanced Injection Techniques
- Complication Management & Emergency Protocols
- Combination Treatments
- Case Studies & Live Demonstrations
- Aseptic Technique & Safety Standards
- Post-Treatment Care
- Business Development & Marketing

Never write "Botulinum Toxin" or "Botox" on pages that ads point to, because Meta reviews landing pages. Use the original name only in the downloadable PDF syllabus.

**Journey (both courses):**
- Week 1: hands-on training.
- Week 2: internship, where you perform treatments yourself under supervision.
- Week 3: supervised practice until you work with confidence.

**Internship details still to CONFIRM:** where it happens, supervisor names (with PMDC numbers for invasive), and cases per trainee. "Each trainee performs X supervised cases" would be the single strongest proof point.

### Batches

Batch data is editable in the CMS (`Batches` collection). Never hard-code dates.

| Month | Course | Start | Campus | Seats | Status |
| --- | --- | --- | --- | --- | --- |
| Nov 2026 | Non-Invasive | Mon 16 Nov | Iqbal Town | 20 | CONFIRMED |
| Nov 2026 | Invasive | Mon 23 Nov | Iqbal Town (assumed) | 20 | CONFIRMED date. The new 15th/20th rule would put it on Fri 20 Nov: CONFIRM which date applies. |
| Dec 2026 | Non-Invasive / Invasive | Tue 15 Dec / Sun 20 Dec (Mon 21 Dec under the Sunday rule) | CONFIRM | 20 | New 15th/20th rule. 25 Dec (public holiday) falls in the second batch's training week. |
| Jan 2027 | Non-Invasive / Invasive | Fri 15 Jan / Wed 20 Jan | CONFIRM | 20 | New 15th/20th rule |
| Feb 2027 | Non-Invasive / Invasive | Mon 15 Feb / Sat 20 Feb | CONFIRM | 20 | New 15th/20th rule |

- The start days live in Site settings → Academy → Batch start days (now 15 and 20). The academy pages state the rule from there; Phase 3 checks batch dates against it.
- Show "X seats left" only if the CSR updates it daily. A fake counter destroys trust.
- Still open: minimum students to run a batch (estimated 6–8), seat deposit, installments, refund / reschedule policy.

### Campuses and contact

| Campus | Address | Status |
| --- | --- | --- |
| Iqbal Town (main) | Plaza No. 10, Main Boulevard, Hunza Block, Allama Iqbal Town, Lahore | Open. CONFIRM the address. |
| DHA Phase 4 | Academy address not given (clinic: 10 CCA, DD Block, DHA Phase 4) | Open. CONFIRM. |
| MM Alam Road, Gulberg III | Not open | Planned. Show "Coming soon" only once a date is set. |

- **One admissions number on every academy page:** WhatsApp 0311 2748804 (+92 311 2748804). Do not show clinic numbers or the second CSR line (0311 2748801) on academy pages.
- Academy Instagram, Facebook and email: CONFIRM. A Google Business Profile, separate from the clinic's, is to be created at Iqbal Town.

### Faculty

| Trainer | Title to publish | Status |
| --- | --- | --- |
| Dr. Iqra Fatima | Dermatologist · Lead Trainer | CONFIRMED. Add FCPS/MCPS if she holds it; photo consent needed. |
| Dr. Maria | Aesthetic Physician | CONFIRMED (owner, 28 Oct 2026). Degree still to confirm. |
| Dr. Sadaf | DPT · Physical Therapist | CONFIRMED (owner, 28 Oct 2026). Not an injectables trainer. |
| Male trainer (IN-1 photo) | CONFIRM | Name and role needed, or do not use the photo |

Faculty copy says "Dermatologist-led team", not "lady doctors only". Do not claim "1 trainer per 5 students" unless all trainers attend every batch.

### WhatsApp codes (academy)

| Button | Pre-filled message |
| --- | --- |
| Home: Non-Invasive | Assalam o Alaikum! Website se aaya/aayi hoon. Non-Invasive course ki details chahiye. (WEB-HOME-NI) |
| Home: Invasive | Assalam o Alaikum! Main MBBS/BDS doctor hoon. Website se Invasive course ki details chahiye. (WEB-HOME-IN) |
| Non-Invasive page | Assalam o Alaikum! Non-Invasive Aesthetics course ki fee aur batch details chahiye. (WEB-NI) |
| Invasive page | Assalam o Alaikum! Main MBBS/BDS doctor hoon. Invasive course ka syllabus aur details chahiye. (WEB-IN) |
| Internship page | Assalam o Alaikum! Internship wale course ki details chahiye. (WEB-INT) |
| Batches page | Assalam o Alaikum! Agle batch mein seat ke bare mein poochna hai. (WEB-BATCH) |
| Other pages | Assalam o Alaikum! Website se course ki details chahiye. (WEB-[PAGE]) |

**Filter line** at the bottom of every academy page: "Ye training course hai, treatment booking nahi. Treatments ke liye French Medical Aesthetics clinic se rabta karein."

**Ready copy:** the full home, about, course, internship and FAQ copy (Roman Urdu + English) is in FAA brief §3–§7 and §11. Use it verbatim, and keep [CONFIRM] lines unpublished.

### Enrollment

1. The student picks a course and batch (pre-filled from the calendar).
2. They enter name, phone, email, city and profession.
3. **Invasive track only:** PMDC number and a degree / registration upload are required. Non-Invasive asks for neither.
4. The record is saved as "applied", and admissions get an alert.
5. Admissions verify the details and mark "verified". The student receives payment instructions (bank / JazzCash).
6. The student uploads proof of payment. Admissions mark "paid", then "confirmed", and the batch's seats taken goes up by one.

Phase 2 adds an online gateway. Uploads (PMDC documents, receipts) go to **private** storage, never to a public URL.

## 7. Sitemap

The handoff IA is adapted to the content briefs.

**Shared**
- `/`: neutral brand intro, two doors (Clinic / Academy), trust strip, Google reviews
- `/about`, `/contact`, `/blog` and `/blog/[slug]`, `/gallery` (clinic ambiance)
- `/policies/privacy`, `/policies/terms`, `/policies/refunds`, `/policies/cancellations`, and a medical disclaimer
- `/careers` (optional, clinic hiring)
- `/admin` (Payload, staff only)

**Clinic.** It has its own header and menu, and a mobile sticky bar with Book + WhatsApp.
- `/clinic`: concern finder, hero treatments (HIFU 22D, Non-Surgical Face Lifting, Morpheus8, Facials), categories, Why FMA, doctors preview, branch selector, FAQ preview
- `/clinic/treatments`, `/clinic/treatments/[category]`, `/clinic/treatments/[category]/[slug]`
- `/clinic/concerns`, `/clinic/concerns/[slug]`
- `/clinic/doctors`, `/clinic/doctors/[slug]`
- `/clinic/branches`, `/clinic/branches/[slug]` (one page per branch; not in the handoff IA, required by the FMA brief)
- `/clinic/technology`
- `/clinic/results`: consented before/afters only, each labelled "individual results vary". Keep it out of ad landing pages.
- `/clinic/faq`, `/clinic/book`

**Academy.** It has its own header, the FAA logo, a "WhatsApp Karein" button, and a mobile sticky bar with WhatsApp + Enroll.
- `/academy` (home), `/academy/non-invasive-aesthetics-course`, `/academy/invasive-aesthetics-course-for-doctors`
- `/academy/internship`, `/academy/faculty`, `/academy/batches` (calendar + how to enrol), `/academy/about`, `/academy/contact`, `/academy/faq`, `/academy/enroll`
- **Not in v1:** `/academy/accreditation` (none exists) and `/academy/fees` (until the fee display is decided; fees may sit on the course pages).
- These slugs follow the FAA brief. Alternatively, keep `/academy/courses/[slug]` from the handoff brief and redirect to it. Pick one and keep it consistent.

### 301 redirects from the WordPress site (in `next.config` redirects)

| Old | New |
| --- | --- |
| `/service/[slug]` | `/clinic/treatments/[category]/[slug]`, mapped explicitly per slug |
| `/service-category/[slug]` | `/clinic/treatments/[category]`, mapped explicitly (e.g. `laser-treatements` → `laser-treatments`) |
| `/our-services` | `/clinic/treatments` |
| `/our-doctors` | `/clinic/doctors` |
| `/training-programs` | `/academy` |
| `/accreditations` | `/academy/about` (no accreditation page in v1) |
| `/make-appointment` | `/clinic/book` |
| `/about-us`, `/contact-us` | `/about`, `/contact` |
| `/cart` | `/` |

Old service slugs for unpublished treatments redirect to their category page, or to `/clinic/treatments`.

## 8. Payload data model

The handoff model is used, plus the fields both content briefs need.

| Collection | Key fields |
| --- | --- |
| **Branches** (new) | name, slug, business (clinic / academy / both), city, address, map URL, Google Business Profile URL, hours[], WhatsApp number, phone, consultation (free / paid + fee), photos[], parking / landmark notes, status (active / planned) |
| TreatmentCategories | name, slug, description, image, order |
| Treatments | name, slug, category, concerns[], hero image, promise line, quick facts (session time, downtime, sessions, results visible, results last), benefits[], how it works, steps[], timeline[], suits[], avoid[], price from (PKR, optional), price factors, doctors[], **branches[]**, FAQs[], related[], **contentStatus** (ready / confirm / historical), **medical sign-off** (yes/no), SEO |
| Concerns | name, slug, description, image, treatments[] |
| Doctors | name, slug, photo, **photo consent** (yes/no), title, degrees, PMDC number, bio, treatments[], **branches[]**, also trainer (yes/no), trainer role |
| Results | treatment, before image, after image, sessions, time between, consent on file (required yes) |
| Courses | name, slug, track (invasive / non-invasive), duration, internship, CPD hours (optional, empty), fee (PKR, optional) + **feeDisplay** (show / from / WhatsApp), eligibility, **requiresPMDC** (yes/no), skills[], modules[] (title, topics[], theoryOnly flag), timetable[], included[], trainers[], FAQs[], **WhatsApp code**, SEO |
| Batches | course, **campus** (→ Branches), start date, end date, total seats, seats taken, **showSeatsLeft** (yes/no), status (open / full / completed) |
| Bookings | name, phone, email, gender (optional), age (optional), **branch**, treatment or concern, preferred date, time slot, notes, **heardFrom**, **source / UTM**, WhatsApp consent, status (new / confirmed / done / cancelled / no-show) |
| Enrollments | name, phone, email, city, profession, **track**, PMDC number (required if track requiresPMDC), degree upload (private), batch, payment method, payment proof (private), **source / WEB code / UTM**, status (applied / verified / paid / confirmed / rejected) |
| Reviews | name, text, rating, treatment or course, source, consent (yes/no) |
| Posts | title, slug, author (doctor), reviewedBy (doctor), cover, body, SEO |
| Media | in Cloudinary / R2; private bucket or folder for uploads |

**Globals:**
- `SiteSettings`: UAN, admissions WhatsApp, emails, socials (per business), Google reviews link, GA4 and Pixel IDs, and the medical disclaimer text.
- `Policies`: refund, cancellation, privacy, terms.

**Access:**
- The public can create Bookings and Enrollments only.
- Staff roles:
  - owner: everything
  - clinic coordinator: bookings and clinic content
  - academy coordinator: enrollments, batches and courses
  - editor: posts and page text

**Spam protection:** a honeypot field plus rate limiting on both forms.

## 9. Compliance (website copy follows a stricter standard than ads)

**Banned on both sides:**
- Superlatives: "Best", "No. 1", "Top 5", "Pakistan's first" / "first in Pakistan". For the clinic these need a proof document on file first.
- Promises:
  - guaranteed, permanent, instant or painless outcomes
  - money-back guarantees
  - "10x results" comparisons
  - fixed session counts stated as promises
- Fake proof:
  - AI-made or unconsented before/afters
  - fake or generic testimonials (the current site has Western-named template testimonials)
  - unverified device approvals (FDA, CE)
  - fake device brand names
- Competitors: their names, their prices, look-alike slogans ("Learn. Practice. Excel.")
- **Academy only:** "Certified Aesthetician", "Globally recognised", "International standard", income or earnings numbers, whitening / glutathione language, before/after images, drug names on ad landing pages, any accreditation badge.

**Doctor sign-off required per page:** injectables, liquid rhinoplasty, lasers, PRP, exosomes, hair regrowth, fat dissolving and fat loss, IV glutathione, skin lightening.

**Required:**
- Site-wide medical disclaimer: "Information on this website is general and not medical advice. All treatments are subject to an in-person medical assessment. Results vary from person to person."
- On every treatment page: "Results vary from person to person. Treatment is subject to medical assessment."
- A consent note on every before/after image.
- Practitioner credentials exactly as documented.
- A privacy policy covering form, upload and WhatsApp data.
- A cookie notice; marketing tags load only after consent.

**Regulators:**
- Punjab Healthcare Commission covers the Lahore branches; Sindh Healthcare Commission covers Karachi.
- Licence display and advertising rules are not yet researched. The owner must confirm licence numbers and whether they must appear on the site.
- Internship patients and clients are treated by trainees. Confirm the consent and disclosure process before publishing internship claims.

## 10. SEO

- Per-page metadata and Open Graph images, `sitemap.xml`, `robots.txt`, Google Search Console.
- All meta text in PKR, with no unapproved prices. The old site had a hidden "from $250".
- JSON-LD:
  - Clinic: `MedicalClinic` per branch, `Physician`, `MedicalProcedure`
  - Academy: `EducationalOrganization`, `LocalBusiness` (Iqbal Town), `Course` per course with `courseMode: onsite`
  - `FAQPage` on FAQ pages
- Local SEO targets, e.g. "aesthetic clinic DHA Lahore", "aesthetic clinic Bahadurabad Karachi", "aesthetics course Lahore", "aesthetic course for doctors Lahore". Starter meta titles and descriptions for the academy are in FAA brief §14.
- Use the same name, address and phone on the site, Google, Facebook and Instagram.

## 11. Build plan

Five phases. Each ends with a working build pushed to GitHub. **Do not start a phase until the owner confirms the previous one is live.**

1. **Foundation:**
   - Next.js + Payload + database adapter + media adapter. Ask about the DB and media choice first.
   - Brand design tokens (section 3).
   - Layout shells: neutral Home with two doors, a Clinic header/menu/footer, an Academy header/menu/footer (each with its own logo), and mobile sticky bars.
   - `start` uses `PORT`; Node 22 compatible (see the Node row in section 2).
   - Deploy the skeleton to Hostinger early, to prove that Payload builds and runs within the plan's limits.
2. **Clinic:** Branches, categories, treatments, concerns, doctors, results and reviews; the treatment template; clinic pages; booking form + notifications + WhatsApp links with tracking.
3. **Academy:** courses, batches and enrollments; the course template; the batch calendar; internship, faculty, FAQ and the enrollment flow with private uploads; WhatsApp codes.
4. **Shared + SEO:** about, gallery, blog, contact, policies; metadata, JSON-LD, sitemap, robots, redirects; a performance pass (Lighthouse 90+ mobile); GA4 + Pixel events.
5. **Content + launch:** load the confirmed content, QA on real phones, cut over from WordPress (section 2), SSL, Search Console.

**Deploy on Hostinger:**
1. Push the repo to GitHub.
2. In hPanel, go to Websites > Add Website > Node.js Web App > Import Git Repository.
3. Choose the Next.js framework and Node 22 (22.23.4 or newer).
4. Add the env vars: DB URL, Payload secret, media keys, notification keys, `NEXT_PUBLIC_SITE_URL` (the site's own address, used in the sitemap and share links) and `SITE_STAGE` (`staging` until launch day, then `production`). The server reads `SITE_STAGE` at run time as well as at build time, so set it for both.
5. Deploy, attach the domain, enable SSL.

**Time pressure:** the next academy batches start on 16 and 23 Nov 2026. The academy pages are the simplest part, since they are WhatsApp-led with no payments. If the owner needs them live first, Phase 3 can ship before Phase 2.

## 12. Open questions for the owner

### Blocking design or build

- [ ] One site with /clinic and /academy, or two domains (frenchaestheticsacademy.com for the Academy)?
- [ ] Database: MongoDB Atlas or Neon Postgres? Media: Cloudinary or Cloudflare R2?
- [ ] Brand guideline and logo files: FMA master SVG, FAA logo pack (SVG?), designer vectors.
- [ ] Clinic pricing: "From PKR X", WhatsApp-only, or a full price list?
- [ ] Academy fee display: show the fee, "from", or "Fee on WhatsApp"? One fixed Invasive fee.
- [ ] Final list of clinic services and which branch offers each. Do the wellness services and the off-list services stay?
- [ ] Doctor and trainer titles, degrees, PMDC numbers and consented photos. Dr Maria's degree (MBBS or BDS) and PMDC numbers; identify the male trainer. (Titles confirmed 28 Oct; Dr Kashmala and Dr Sarah have left.)

### Blocking launch

- [ ] Full addresses for all 4 clinic branches and the 2 open academy campuses. Is the "Plaza No. 10" in both the DHA and Iqbal Town addresses correct?
- [ ] Opening hours per branch.
- [ ] UAN 0311-1171788: WhatsApp-enabled, and used by all branches? WhatsApp number per branch.
- [ ] Role of +92 333 4486010 (on the current site).
- [ ] 0311 2748804 appears on an old clinic Morpheus8 ad and is now the academy admissions number. Confirm it is academy-only.
- [ ] Official clinic Instagram (@frenchmedicalaesthetics vs @frenchaestheticsofficial); academy Instagram, Facebook and email.
- [ ] Clinic domain on the academy brief says frenchmedicalaesthetics.com. Confirm the clinic uses frenchaesthetic.com only.
- [ ] Is laser hair removal (featured in the Non-Invasive course) still offered and equipped at the clinic? Are Pico, Q-Switch, fat freezing and EMS machines still in use, as the academy syllabus implies?
- [ ] Is practical Pico / Q-Switch / Microneedling done by non-medical students?
- [ ] Refund, cancellation, privacy and terms text; academy installments, deposit and refund / reschedule rules.
- [ ] Internship: location, supervisors, cases per trainee, patient consent process. Certificate issuer and wording.

### Phase 2 / nice to have

- [ ] Approved "From" prices per treatment and branch; the EMFACE price and device confirmation; the Allama Iqbal Town consultation fee.
- [ ] Founding year, founder bio, mission and vision; PHC / SHCC licence numbers.
- [ ] Google Business Profile links per branch (clinic) and for the academy.
- [ ] Real photos (branches, doctors, students on machines with a trainer), consented before/afters, consented reviews, the Dr Kajal testimonial video with consent.
- [ ] Overseas students (multi-currency fees) or Pakistan only? Phase 1 payment methods: bank transfer, JazzCash, Easypaisa?
- [ ] CPD provider number, if it is ever obtained.

## Owner answers log

Record each answer here with its date. It overrides anything above.

- 2026-10-28: Database is **MongoDB Atlas** (cluster `french`, database `frenchaesthetic`). Connection string lives only in `.env` as `DATABASE_URI`. Atlas Network Access must allow Hostinger's outbound IP before deploy.
- 2026-10-28: Local machine has Node 24 and Git 2.55. Keep code compatible with Node 20/22, and pin Hostinger to Node 22.
- 2026-10-28: Payload 3.92 requires Node ^22.23.4 or >=24.22.1, so Node 20 is out (this replaces the line above). Hostinger: Node 22, version 22.23.4 or newer.
- 2026-10-28: The wellness group (acupuncture, hijama, physiotherapy, reflexology, erectile dysfunction) is **removed** from the website. Do not model it.
- 2026-10-28: **No treatment prices** on the website, not even "starting from". The price is given at consultation or on WhatsApp. The academy fee display is a separate question and still open.
- 2026-10-28: Light **and** dark mode, with a toggle. Built with dark (the brand lead) as the default; header, footer, sticky bars and offer panels stay charcoal in both.
- 2026-10-28: Clinic number **0311-1171788** (the UAN; the FMA brand guide labels it "UAN / WhatsApp" and puts it on every branch board). Academy admissions number **+92 311 2748804**.
- 2026-10-28: Instagram https://www.instagram.com/frenchaestheticsofficial/ and Facebook https://www.facebook.com/frenchaestheticsofficial, which resolves the clinic Instagram conflict. Academy socials and email are still to confirm, so the academy footer shows none yet.
- 2026-10-28: **Nothing about Fahad Nazeer** on the website: no name, title, bio or photo.
- 2026-10-28: The clinic's doctors are **Dr. Iqra, Dr. Sadaf and Dr. Maria**. **Dr. Sarah and Dr. Kashmala have left**: they are not on the website and must not be added. Titles, the same day: **Dr. Sadaf: DPT (Physical Therapist)**; **Dr. Maria: Aesthetic Physician**. Both are now published as trainers.
- 2026-10-28: Academy batches start on the **15th or the 20th** of every month: these are the two possible start days. This replaces the 15th (Non-Invasive) / 22nd (Invasive) rule. The owner then confirmed: **Non-Invasive on the 15th, Invasive on the 20th** (stored per course as "Batch start day"). Still to confirm: whether a Sunday start still moves to Monday (20 Dec 2026 is a Sunday), and whether the November Invasive batch stays on Mon 23 Nov or moves to Fri 20 Nov (seeded as Fri 20 Nov, marked to confirm).
- 2026-10-28: Brand files received: `FMA_Brand_Guidelines_2026.pptx` and `FMA_Logo_Pack.zip` (includes SVGs) in `D:\French Aesthetics Content\Clinic Content\design system files`; the FAA brand guidelines PDF and logo pack (PNG only, no SVG) in `D:\French Aesthetics Content\Academy Content\Design system files`. The website's copies live in `public/brand`.

### Build decisions (Phase 1, 2026-10-28)

The owner's website prompt of 28 Oct was built against this brief. Where the two disagreed, the content briefs won, as "How to use this file" requires. The owner can override any of these:

- Names: "French Medical Aesthetics" for the clinic and "French Aesthetics Academy" for the academy, never "French Aesthetic".
- The academy has two tracks. Non-Invasive is open to beauty professionals and beginners; only Invasive needs MBBS/BDS and PMDC.
- Four clinic branches, not DHA only, each with its own consultation wording.
- The brand palette and fonts (Cormorant Garamond + Nunito Sans), not the prompt's placeholder ivory palette and Inter.
- Academy URLs: course pages at `/academy/<course-slug>` (`non-invasive-aesthetics-course`, `invasive-aesthetics-course-for-doctors`), the list at `/academy/courses`, the calendar at `/academy/batches`, trainers at `/academy/faculty`. No `/academy/fees` or `/academy/accreditation` in v1. `next.config.ts` redirects `/academy/calendar`, `/academy/trainers` and `/academy/courses/:slug` to these, and `/academy/fees` and `/academy/accreditation` (temporarily) to the course list and About.
- Home `/` is neutral: two doors with the names set in type and no logos, because the two logos must never sit side by side.

### Academy build notes (Phase 3, 2026-10-28)

- **Enrollment workflow:** the website form (`/academy/enroll`) saves an Enrollment as "applied" with its source (page, WEB code, UTM cookie) and emails admissions. Admissions verify it in `/admin`, set "verified", and send the student the **payment link** shown on the enrollment (private, one per application) on WhatsApp. The student uploads the payment proof there; admissions then set "paid" and "confirmed", which adds one to the batch's seats taken.
- **Private documents** (PMDC certificates, payment proofs) are in the `enrollment-files` collection: readable only by the owner and academy coordinators, renamed on upload, stored as Cloudinary authenticated files once the keys are set (untested until then; locally they sit in the gitignored `private-uploads/`).
- **Needed from the owner before launch:** SMTP details for the alert emails (Hostinger mailbox) and the recipients (Site settings → Academy → Enrollment alert emails); the bank / JazzCash payment details (Site settings → Academy → Payment instructions); Cloudinary keys.
- **Batches** live in the CMS (Academy → Batches). A start date must follow the course's start day (or the Monday after a Sunday) unless "Exception to the start-day rule" is ticked. The calendar shows open and full batches from today on; unconfirmed ones only on staging.

### Clinic and shared pages build notes (Phases 2 and 4, 2026-10-28)

- **A treatment page is live only when it is "Ready" and "Medical sign-off" is ticked** (Clinic → Treatments). No treatment is signed off yet, so on the live site the treatment, category, concern and technology pages stay hidden and drop out of the menus, the sitemap and the clinic home. Staging shows everything, with a marker saying why each page is not live. A hidden treatment's address redirects to its category, or to `/clinic/treatments`.
- **Trademarked device names** (EMFACE, Morpheus8, HydraFacial) are not used: the pages say "Non-surgical face lifting", "RF microneedling" and "Hydrating facial" until the owner confirms the genuine branded systems. `/clinic/technology` describes technology types only.
- **Booking** (`/clinic/book`): saved as "new" with its source, and emailed to the branch's own alert emails plus Site settings → Clinic → Booking alert emails. The thank-you page offers the branch's WhatsApp, or the UAN when the branch has no approved number.
- **Doctors** are listed as documented ("Clinic team" ticked in the admin). Structured data uses `Person`, not `Physician`, because the team includes a physical therapist. Nobody is linked to a treatment until the owner says who performs it.
- **Shared pages:** `/about` (the clinic's About copy is the brief's draft, shown on staging only; the live site shows confirmed facts), `/contact` (a form saved to Contact messages: a patient's message goes to the clinic inbox, a student's to admissions), `/policies/*` (a privacy policy draft is seeded for the owner to review; unconfirmed policies show a short notice on the live site), `/policies/medical-disclaimer`, `/blog` and `/gallery` (empty, so 404 until content is added).
- **SEO:** `sitemap.xml` lists only pages that are shown; the old WordPress addresses 301 to the new ones (`next.config.ts`); share images are in `public/og` (rebuild with `node scripts/og-images.mjs`).
- **Analytics:** GA4 and the Meta Pixel load only after the visitor accepts the cookie notice, and the notice appears only once their IDs are set in Site settings → Tracking. WhatsApp and phone clicks send "Contact" events; sent bookings, enrollments and messages send "Lead" events.
- 2026-10-29: **Staging is live** on Hostinger at https://mediumorchid-caribou-170902.hostingersite.com (Web App, Node 22, India data centre, auto-deploy from GitHub `dxbfa1-collab/frenchaesthetic`, branch `main`). Atlas Network Access allows `0.0.0.0/0` for Hostinger; the database password and `PAYLOAD_SECRET` were replaced on 28–29 Oct after they appeared in screenshots. The first Hostinger build stopped after 15 minutes (Turbopack starts a thread per core; the plan caps threads), so `npm run build` uses webpack and one worker.
- 2026-10-29: **Redesign decisions (owner).** All website content in **English**, including the pre-filled WhatsApp messages (replaces the FAA brief's Roman Urdu hooks and codes' wording; the WEB codes stay). Fonts: **Montserrat** headings + **Nunito Sans** text (replaces Cormorant Garamond, found hard to read). A simpler shared home (two photo doors). **Hero sliders** of 2–3 slides on the clinic and academy homes, changing every 4–5 seconds. More animation, icons and a running strip of treatments. **Free-licence stock photos** (Unsplash / Pexels) are allowed for treatments and courses, each chosen for what the treatment really does (sources in `public/images/CREDITS.md`); still never AI-made people, never a stock face shown as one of our doctors, no visible device brands, no needles near the eye. Doctor photos will come from the owner.
- 2026-10-29: **Doctor photos:** the owner confirmed that the photos of Dr. Iqra, Dr. Maria and Dr. Sadaf on the previous site are real (not AI-made), so they are used (`public/images/doctors`). Dr. Kashmala's photo is not used. Still to confirm: the previous site lists Dr. Sadaf as "MS in Gyne" and Dr. Maria as "MBBS", while the owner gave Dr. Sadaf as "DPT · Physical Therapist" (published) and Dr. Maria's degree as unknown.
- 2026-10-29: **Dr. Sadaf holds both a DPT and an MS in Gyne** (owner). Published as "DPT, MS in Gyne · Physical Therapist". **Dr. Maria holds a BDS** (owner, 29 Oct 2026; the previous site's "MBBS" was wrong). Published as "BDS · Aesthetic Physician".
- 2026-10-29: **All 13 "Ready" treatments are approved** by the owner; medical sign-off ticked in the CMS, so they show on the live site.
- 2026-10-29: **The clinic uses the genuine BTL EMFACE device** (owner). The treatment is now "EMFACE (non-surgical face lifting)"; its address stays `/clinic/treatments/face-lifting-and-tightening/non-surgical-face-lifting`. Morpheus8 and HydraFacial are still shown generically.
- 2026-10-29: **All four branch addresses are confirmed** as shown on the website (owner). Opening hours are still to confirm.

