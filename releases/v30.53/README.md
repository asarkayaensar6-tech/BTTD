# BTDD V30.53

This focused patch and executable regression bundle builds on the complete verified V30.52 package. Apply `BTDD_V30_53.patch` from the package root. It updates the existing app and release metadata, then adds two V30.53 regression tests. The complete V30.53 ZIP is available separately.

## Changes

- Overdue service warnings use full yellow or red occupied-table cards with strong contrast, regardless of theme/glass surface overlays. Open duration and last-service duration receive clear labels and visual emphasis. Existing user controls for table details and service warnings remain respected.
- Sales Analysis includes a selectable business date and a product-searchable unit breakdown. Each product shows units for the selected day, Monday-to-selected-day week, month-to-selected-day, and year-to-selected-day. This is derived only from saved sales and does not mutate sales or stock.

## Validation

10 unit-window, sort and immutability checks; 7 status/theme checks plus rendered table-state checks; 53 frontend, 8 sync status, 15 revenue comparison, 7 navigation/sync, 8 assistant, 112 chart geometry/compatibility and 18 day-safety checks passed. Static checks and ZIP integrity passed. No browser screenshot or physical device test is claimed.

The repository main branch is currently a README-only placeholder; this draft adds a versioned patch bundle rather than presenting it as the full application source tree.
