# Confidence a textual-reference auto-link must reach before it is trusted
# without manual confirmation (Section 4.1: automation vs human verification).
# Reference-based links are assigned AUTO_LINK_CONFIDENCE; when that falls
# below the trust threshold they degrade to suggestions instead of links.
AUTO_LINK_CONFIDENCE = 0.9
AUTO_LINK_TRUST_THRESHOLD = 0.8
MANUAL_LINK_CONFIDENCE = 1.0

ROLE_FOR_RULE = {
    "design_changed_after_code": "designer",
    "ticket_stale_in_progress": "pm",
    "done_without_code": "developer",
}

SEVERITY_FOR_RULE = {
    "design_changed_after_code": "warning",
    "ticket_stale_in_progress": "warning",
    "done_without_code": "info",
}

# Simulated delivery channels per role (Slack channels in the full build).
ROLE_CHANNELS = {
    "designer": ["dashboard", "slack:#design"],
    "developer": ["dashboard", "slack:#dev"],
    "pm": ["dashboard", "slack:#pm"],
}

# Noise threshold (Section 8.1): max alert deliveries per role per run;
# excess deliveries are logged as suppressed rather than sent.
MAX_ALERTS_PER_ROLE_PER_RUN = 5

# A tool unreachable longer than this marks its linked entities
# stale/unverified instead of treating them as up to date (Section 13).
STALE_AFTER_MINUTES = 30

ROLE_LABELS = {
    "designer": "Designer",
    "developer": "Developer",
    "pm": "Project Manager",
}
