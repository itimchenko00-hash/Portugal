# MMW-COMPANY — ETALON 7.0 LAUNCH AUDIT

Date: 2026-10-09
Repository: https://github.com/itimchenko00-hash/Portugal
Production service: https://mmw-company.onrender.com
Production branch: main
Release candidate branch: RELEASE/ETALON-7.0-LAUNCH-2026-10-09

## Scope
- Company homepage and service catalog
- Six project pages: ALADIN RESIDENCE, CARPATHIA ECO LODGE, NEXUS WORK, AGROHUB, NEXUS LOGISTICS, ENERGY PARK
- Navigation and primary order/contact links
- Local media references
- Mobile/responsive markup and inline JavaScript syntax
- Production URL metadata and health endpoint identity
- Render deployment status and available logs

## Findings fixed in this release candidate
1. Canonical URLs on all eight public HTML pages pointed at the separate mmw-company-2 service instead of the actual Portugal production service. Canonical and Open Graph/Twitter URLs have been corrected to https://mmw-company.onrender.com.
2. The /healthz response identified the service as mmw-company-2 / MMW-COMPANY/2. It now identifies the deployed service as mmw-company, release Etalon 7.0.
3. The company homepage, catalog and all six project pages were checked for inline JavaScript syntax; all extracted inline scripts compile successfully.
4. The homepage's ten referenced project-category photos exist in the repository as local assets.
5. Hero image assets for all six project pages were confirmed to exist in the repository.
6. The six project detail pages and catalog are present in public/; navigation targets are consistent with these files.
7. Main page/catalog CTA links point to the production MMW-ORDER URL; project pages retain direct contact links to itimchenko00@gmail.com.

## Production configuration observed
- Render service: mmw-company
- Render service ID: srv-daa9ofss728c73fpvd90
- Repository: itimchenko00-hash/Portugal
- Branch: main
- Runtime: Node
- Build command: npm install
- Start command: node server.js
- Plan: Free
- Latest observed deployment before this release candidate: commit b925c13b997eba0b8d63c10c9fb4c18d888ac806, status Live.

## Explicit limitations / acceptance items
- Direct HTTP/browser access to the Render production URL was unavailable to the audit tooling. Therefore visual rendering on desktop/mobile, live HTTP status for every page/image, and the /healthz response have not been independently confirmed by an external browser.
- No real customer application was submitted; no production order or database data was created.
- A physical-phone visual pass and one owner-approved end-to-end CTA-to-order test remain required for final acceptance.
- The site uses a static catalog and project concept pages. The catalog CTA routes to MMW-ORDER; the project pages use email contact CTAs. This is intentional in the current release and does not claim a fully integrated per-project cart.
- No secrets, production database settings, order data, or MMW-ORDER server code were changed.

## Rollback
Use the pre-change branch:
https://github.com/itimchenko00-hash/Portugal/tree/BACKUP/PORTUGAL-BEFORE-ETALON7-2026-10-09

## Release candidate
This branch contains the URL/metadata and health endpoint corrections for the Etalon 7.0 launch. Merge to main only after reviewing the diff; Render auto-deploys commits on main.
