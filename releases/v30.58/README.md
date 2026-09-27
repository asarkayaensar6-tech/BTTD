# ASARKAYA / BTDD V30.58

V30.58 improves repeated product-sales analysis and reduces sync polling while the app is in a background tab.

- Analysis results are reused only while local/server revisions, state timestamp, record counts, and date selection remain unchanged.
- Visible-tab sync remains at 900 ms; returning to the app invokes the existing immediate resume sync.
- The full verified package remains the installable source; this repository release adds a versioned patch and validation notes, following prior release PRs.

Apply `BTDD_V30_58.patch` to the complete V30.57 package. Validation details and device-test limitations are in `TEST_RAPORU_V30_58.txt`. The patch is not a standalone app source tree.
