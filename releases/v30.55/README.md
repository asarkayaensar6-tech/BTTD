# BTDD V30.55

This patch applies to the complete verified V30.54 package (the cleanup release). Apply `BTDD_V30_55.patch` from that package root. The complete V30.55 ZIP is available separately in ChatGPT Library.

## Product Sales Analysis

- Select a business day and review day, week, month, year-to-date, or a custom date range. Per-product rows retain day/week/month/year unit counts for the selected reference day.
- Inspect units, recorded-price revenue, weighted average selling price, observed price range, recorded product cost, gross profit and margin. Missing historical costs remain explicitly incomplete; they are never treated as zero.
- Expand a product to see its most recent 30 sale lines with business date/time, unit price, quantity, line value, table and payment method.
- Compare with the immediately preceding equal-length date range, see category revenue mix, filter by product/category, and sort by revenue, units, profit, margin or days since last sale.
- Show current recorded stock, average unit movement per day and an estimated days-of-stock figure based on the selected window. Results are paginated at 40 products and do not modify sales or stock.

## Validation

Product-analysis aggregation, custom-window/date-boundary, price history, incomplete-cost, previous-period, stock-pace, dormant-product and non-mutation tests passed, as did an actual renderer markup check with a DOM stub. The existing frontend, table warning, sales analysis, sync, navigation, assistant, chart compatibility and day-close safety suites passed. Static checks and ZIP integrity passed. No real browser screenshot or physical device test is claimed.

The repository main branch is a README placeholder. This draft proposes a versioned patch bundle rather than claiming the whole app source tree has been migrated.
