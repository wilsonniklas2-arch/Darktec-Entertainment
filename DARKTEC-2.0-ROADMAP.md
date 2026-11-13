# DARKTEC 2.0 — Platform Upgrade Plan

Status: Phase 1 foundation committed on branch `darktec-2.0`.
Production branch: `main` (unchanged).

## Phase 1 — Shared quality foundation
- Additive shared CSS layer for keyboard focus, visible focus states, touch targets, responsive media, form controls, mobile layout safeguards and reduced-motion preferences.
- Apply the shared layer to pages that were previously missing it: Services, Enquiry, Imprint, Privacy and Festival World Map.
- Preserve existing page-specific styling and content.

## Phase 2 — Functional and trust audit
- Verify every navigation destination and internal link.
- Test enquiry form submission end-to-end; do not claim delivery until confirmed.
- Review legal pages for complete, current provider and privacy disclosures; flag placeholders instead of inventing legal facts.
- Check image credits, alt text, broken remote assets and loading weight.
- Validate mobile navigation, keyboard-only operation, contrast and reduced-motion behavior.

## Phase 3 — Discover and data quality
- Validate festival JSON structure, duplicate records, status definitions, source URLs and date provenance.
- Keep unverified 2027 festival entries clearly marked; never promote HOLD entries without official confirmation.
- Test map markers, filters, search and event detail navigation.

## Phase 4 — Performance and launch readiness
- Add page-specific metadata, social preview metadata and consistent language declarations.
- Optimize oversized images and lazy-load below-the-fold media.
- Run HTML/CSS/JS checks and GitHub Actions quality workflow.
- Prepare a release checklist and merge only after review.

## Guardrails
- No deletion of existing sections or data during the redesign.
- No fabricated testimonials, clients, credentials, addresses, legal details or business claims.
- No publishing to production until the preview is reviewed.
