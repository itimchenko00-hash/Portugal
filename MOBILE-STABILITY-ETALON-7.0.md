# MMW-COMPANY — ETALON 7.0 MOBILE STABILITY

Date: 2026-10-09
Production URL: https://mmw-company.onrender.com
Repository: https://github.com/itimchenko00-hash/Portugal
Production branch: main
Stabilization branch: RELEASE/ETALON-7.0-MOBILE-STABLE-2026-10-09
Rollback branch: BACKUP/BEFORE-MOBILE-STABILITY-ETALON7-2026-10-09

## Scope
- public/index.html — company homepage
- public/catalog.html — catalog
- public/aladin.html — ALADIN RESIDENCE
- public/carpathia.html — CARPATHIA ECO LODGE
- public/nexus-work.html — NEXUS WORK
- public/agrohub.html — AGROHUB
- public/logistics.html — NEXUS LOGISTICS
- public/energy.html — ENERGY PARK

## Changes
Added a shared cross-page responsive safety layer to the existing inline styles without replacing project-specific design:
- predictable box sizing and protection against horizontal overflow;
- media elements constrained to viewport width;
- long labels, links and content can wrap rather than expand the page;
- single-column layout for common card/grid patterns on narrow screens;
- minimum 44px tap targets for common interactive controls;
- mobile navigation safe-area padding and modal/sheet height constraints;
- reduced-motion accessibility handling.

Existing project-specific palettes, content, image mapping and navigation logic were retained. The company/catalog CTAs continue to use https://mmw-order.onrender.com. The project detail pages continue to use the existing direct contact flow; no per-project cart was introduced.

## Static checks
- All eight pages have a viewport meta tag.
- All eight pages contain the stabilization CSS layer.
- All extracted inline JavaScript blocks compile successfully.
- CSS brace balance is zero in every style block.
- No references to the old mmw-company-2.onrender.com host remain in these pages.
- Main navigation targets point to the expected company/catalog/project HTML files.
- Existing local image assets are retained; no new third-party runtime image dependency was added.

## Production/deployment notes
This is a static-code audit, not a substitute for real-device visual acceptance. The audit tooling could not independently render the live site in a browser. After promotion to main, verify the homepage, catalog and all six project pages on a physical phone at narrow widths, including opening/closing navigation and modal sheets. Confirm order CTA routing, but do not submit a production test order without owner approval.

No MMW-ORDER source code, order database, credentials, environment variables, or schema were changed.

## Rollback
Restore the code from:
https://github.com/itimchenko00-hash/Portugal/tree/BACKUP/BEFORE-MOBILE-STABILITY-ETALON7-2026-10-09
