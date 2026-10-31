# AI Usage Disclosure

- **AI tool used:** OpenAI Codex.
- **Assistance provided:** Reviewed the assessment implementation, diagnosed API-to-UI association mismatches, and assisted with focused updates to work-order details, status history, validation, filters, and dashboard links.
- **AI-generated code reviewed/modified:** The status-history model and transaction-backed history writes, API query aliases/search, association rendering, creation/assignment behavior, and dashboard work-order links were reviewed and adjusted in this project.
- **Issues identified:** Sequelize returns `Asset` and `Technician` associations with numeric `id` fields, while the detail view expected lowercase Mongo-style objects and `_id`; the dashboard also used `_id`. Existing status timeline entries were inferred from the current status instead of being stored as events. Schedule validation needed to be required and compared using local calendar dates.
- **Technical decisions:** Preserve the existing React pages and styles; add a relational `work_order_history` table with a foreign key and index; write status changes in the same transaction as the work-order update; retain legacy API response compatibility where practical; avoid fabricating historical transitions for existing rows because their prior event timestamps are unavailable.

The implementation and behavior should be reviewed and verified before submission.
