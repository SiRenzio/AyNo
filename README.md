# AyNo

Personal Reminder Checklist

# Design Instructions:

    1. Use blue, black, and white as the primary colors.
    2. Keep the design minimalist.
    3. Gradients should be used sparingly.

# Code Instructions:

    1. Always make code readable and easy to understand.
    2. Make use of comments.
    3. Always make use of components for the frontend.
    4. Use Models for queries and Controllers for functions.
    5. Always take note of the best practices when coding.

# Business rules

    - Event ownership controls access to the event, its checklist, and its reminders.
    - An event may exist without checklist items or reminders, but the interface should encourage both.
    - A reminder can be delivered successfully only once.
    - Completed and cancelled events cannot generate new reminder deliveries.
    - Deleting an event deletes or cancels its associated items and reminders.
    - Checklist completion and event completion remain separate actions.
    - Template items are copied into events rather than permanently linked.
    - Changing an event time recalculates offset-based reminders; exact custom reminders require user review if
    invalidated.

# Non-functional requirements

    Security
        - All protected routes require authentication; Laravel policies enforce ownership.
        - All request data is validated server-side and forms use CSRF protection.
        - Passwords and secrets are never stored or logged in plain text.
        - Authentication and password-reset endpoints are rate-limited.
        - User-provided content is escaped when rendered.
    Reliability
        - Reminder delivery uses queued, retry-safe jobs with duplicate prevention.
        - Failed jobs are logged and can be inspected.
        - Related multi-record changes use database transactions where appropriate.
    Performance
        - Common pages target a two-second load under normal MVP conditions.
        - Dashboard lists are limited or paginated; queried foreign keys and dates are indexed.
        - Email sending never blocks the user's web request.
    Accessibility
        - Inputs have visible labels and validation messages explain how to fix errors.
        - Core flows are keyboard accessible.
        - Text and controls meet reasonable color-contrast expectations.
        - Checkboxes and buttons have accessible names and adequate touch targets.
    Compatibility
        Support current versions of Chrome, Edge, Firefox, Safari, Mobile Chrome, and Mobile Safari.
    Operations
        - Production runs Laravel's scheduler every minute.
        - At least one monitored queue worker processes reminder jobs.
        - Mail credentials and application secrets are environment variables.
        - Application and failed-job logs are available for troubleshooting.
        - Database backups and a basic restore procedure exist before public release.

# Tasks Completed Summary

    - 20/08/2026
        - Scaffolded Laravel, React, Inertia, and MySQL project structure.
        - Added MVP database migrations.
        - Designed the login and registration pages.
        - Added the grouped application sidebar and navigation placeholders.
        - Resolved starter-kit diagnostics and excluded dependency test fixtures from the workspace.
        - Built the empty-state dashboard and summary cards.
        - Added the responsive mobile dashboard navigation and sidebar refinements.
        - Built event creation with searchable templates, event details, dynamic checklist items, reminders, validation, and database persistence.
        - Built event management with search, status filtering, sorting, card-list view, and monthly calendar view.
        - Connected the dashboard to event data and added event details with interactive checklist and reminder management.
        - Added responsive light and dark themes, higher-contrast text, scalable management menus, and dashboard-style event labels.

# TODO

    - Build notification management.
