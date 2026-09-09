# Unify - Cross-Tool Collaboration Hub

A system for monitoring and reconciling consistency across Figma, GitHub, and Jira. Detects design-code drift, ticket staleness, and cross-tool conflicts in real time.

## Project Structure

```
.
├── frontend/               # Stitch-generated UI prototypes (15 screens)
│   ├── unify_workspace_onboarding/
│   ├── unify_conflict_inbox/
│   ├── unify_conflict_detail/
│   ├── unify_artifact_graph_explorer/
│   ├── unify_policy_configuration/
│   ├── unify_policy_simulation/
│   ├── unify_link_management/
│   ├── unify_search_advanced_filtering/
│   ├── unify_evaluation_dashboard_internal/
│   ├── unify_workspace_administration/
│   ├── unify_audit_trail_compliance_export/
│   ├── unify_user_profile_watcher_preferences/
│   ├── unify_slack_configuration/
│   ├── unify_notification_preferences/
│   ├── unify_manual_workflow_study_interface/
│   ├── wire_navigation.py  # Navigation wiring script
│   └── docs/               # Design documentation
├── unify_poc/              # Python proof-of-concept engine
│   ├── run.py              # CLI entrypoint
│   ├── src/unify/          # Core library
│   ├── data/               # Fixtures
│   └── tests/              # Test suite
└── docs/                   # FYP documentation
```

## Frontend Demo

The `frontend/` directory contains 15 interconnected screens built with Google Stitch. All screens share a sidebar navigation and key buttons are wired to navigate between pages.

```bash
cd frontend
python3 -m http.server 8080
# Open http://localhost:8080/unify_workspace_onboarding/code.html
```

To re-wire navigation after editing screens:

```bash
cd frontend
python3 wire_navigation.py
```

## POC Engine

See [unify_poc/README.md](unify_poc/README.md) for setup and usage.

```bash
cd unify_poc
pip install -r requirements.txt
PYTHONPATH=src python3 run.py
```
