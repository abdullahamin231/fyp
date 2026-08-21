AUTO_LINK_CONFIDENCE = 0.9
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

ROLE_LABELS = {
    "designer": "Designer",
    "developer": "Developer",
    "pm": "Project Manager",
}
