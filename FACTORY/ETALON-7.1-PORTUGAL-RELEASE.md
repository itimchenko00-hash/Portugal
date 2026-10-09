# MMW-COMPANY — Etalon 7.1 production release candidate

Date: 2026-10-09  
Repository: https://github.com/itimchenko00-hash/Portugal  
Target branch: `main`  
Candidate branch: `RELEASE/ETALON-7.1-PRODUCTION-2026-10-09`  
Production host: https://mmw-company.onrender.com

## Scope applied

- Added a standalone company information page at `/about.html`, using only substantiated descriptions and clearly identifying portfolio items as concepts.
- Added a privacy-information page at `/privacy.html` that reflects the inspected production server: static public pages, email links, external order-service links, hosting-level technical request processing, and no embedded Google OAuth, analytics, feedback form, or persistent order store in the company server.
- Added Schema.org structured data to the homepage, catalog and six project pages. Project records are explicitly described as concepts that require further validation.
- Added project-specific email subjects to the six project pages.
- Added links to company and privacy information pages across the public-page footers and homepage navigation.
- Aligned `robots.txt`, `sitemap.xml`, canonical/schema URLs with the production host `https://mmw-company.onrender.com`; added the two new pages to the sitemap.
- Updated `/healthz` and the startup log to identify Etalon 7.1.
- Preserved existing project page content, media assets, catalog price values, and the current external order-service URL. No MMW-ORDER or commercial service code was changed.

## Release gates

- Source-level consistency checks: PASS for all eight existing public pages plus the two new information pages; all ten pages use the production canonical host; JSON-LD parses on all ten pages; the old `mmw-company-2.onrender.com` host is absent from checked public pages, `robots.txt` and `sitemap.xml;` company/privacy links are present; all six project pages retain project-specific email subjects.
- Sitemap contains the homepage, catalog, six projects, company information and privacy page; `robots.txt` points to the production sitemap.
- Existing project HTML and media references were preserved rather than replaced wholesale; no image binaries were changed.
- Browser/mobile visual QA, live page/image loading, external order registration/handling, accessibility, performance, and legal review remain separate production gates.
- Privacy content is an implementation-level description, not a substitute for jurisdiction-specific legal review. Legal operator details were not invented.

## Rollback

Revert the Etalon 7.1 release commit(s) on the candidate/release branch, or redeploy the last known-good main deployment. Existing media assets and order-service code were not altered.
