# BTDD V30.52

This is a focused source patch and regression-test bundle for the verified V30.51 package. The main GitHub branch currently contains only a repository placeholder, so this draft stores the incremental patch without pretending to replace the complete application source tree.

Apply `BTDD_V30_52.patch` from the extracted package parent directory. It updates `BTDD_KULLANIMA_HAZIR/index.html`, release version metadata, and the focused regression tests. The ready-to-use complete ZIP is distributed separately in the user's Library.

## Changes

- The online connection chip says only “Bağlı”, regardless of transient write/conflict text. Offline and explicit authentication messages remain visible.
- Sales Analysis compares the selected graph range against the preceding equal-length range: 14 days, 8 calendar weeks, or 12 months. It avoids inventing a percentage when the preceding range has no sales.

## Validation

Eight connection-state tests, 15 analysis assertions, 53 frontend checks, 7 navigation/sync checks, 8 assistant checks, 112 chart geometry/compatibility checks, 18 day-safety tests, static integrity checks, and ZIP integrity all passed. Geometry checks are not browser screenshots; no physical device verification is claimed.
