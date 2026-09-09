#!/usr/bin/env python3
"""Wire navigation between all Stitch HTML pages."""
import re
import os

BASE = os.path.dirname(os.path.abspath(__file__))

# Map data-path values to actual file paths (relative to each page's folder)
PATH_MAP = {
    "onboarding": "../unify_workspace_onboarding/code.html",
    "conflict-inbox": "../unify_conflict_inbox/code.html",
    "conflict-detail": "../unify_conflict_detail/code.html",
    "graph-explorer": "../unify_artifact_graph_explorer/code.html",
    "policy-configuration": "../unify_policy_configuration/code.html",
    "policy-simulation": "../unify_policy_simulation/code.html",
    "link-management": "../unify_link_management/code.html",
    "search": "../unify_search_advanced_filtering/code.html",
    "evaluation": "../unify_evaluation_dashboard_internal/code.html",
    "admin": "../unify_workspace_administration/code.html",
    "audit-trail": "../unify_audit_trail_compliance_export/code.html",
    "user-profile": "../unify_user_profile_watcher_preferences/code.html",
    "slack-config": "../unify_slack_configuration/code.html",
    "notifications": "../unify_notification_preferences/code.html",
    "study": "../unify_manual_workflow_study_interface/code.html",
}

# Page titles
TITLES = {
    "unify_workspace_onboarding": "Workspace Onboarding",
    "unify_conflict_inbox": "Conflict Inbox",
    "unify_conflict_detail": "Conflict Detail",
    "unify_artifact_graph_explorer": "Artifact Graph Explorer",
    "unify_policy_configuration": "Policy Configuration",
    "unify_policy_simulation": "Policy Simulation",
    "unify_link_management": "Link Management",
    "unify_search_advanced_filtering": "Advanced Search",
    "unify_evaluation_dashboard_internal": "Evaluation Dashboard",
    "unify_workspace_administration": "Workspace Administration",
    "unify_audit_trail_compliance_export": "Audit Trail & Compliance",
    "unify_user_profile_watcher_preferences": "User Profile & Settings",
    "unify_slack_configuration": "Slack Configuration",
    "unify_notification_preferences": "Notification Preferences",
    "unify_manual_workflow_study_interface": "Workflow Study Interface",
}

# Which data-path is active for each page folder
ACTIVE_MAP = {
    "unify_workspace_onboarding": "onboarding",
    "unify_conflict_inbox": "conflict-inbox",
    "unify_conflict_detail": "conflict-detail",
    "unify_artifact_graph_explorer": "graph-explorer",
    "unify_policy_configuration": "policy-configuration",
    "unify_policy_simulation": "policy-simulation",
    "unify_link_management": "link-management",
    "unify_search_advanced_filtering": "search",
    "unify_evaluation_dashboard_internal": "evaluation",
    "unify_workspace_administration": "admin",
    "unify_audit_trail_compliance_export": "audit-trail",
    "unify_user_profile_watcher_preferences": "user-profile",
    "unify_slack_configuration": "slack-config",
    "unify_notification_preferences": "notifications",
    "unify_manual_workflow_study_interface": "study",
}

# Full sidebar HTML template - replaces existing aside
SIDEBAR_TEMPLATE = '''<aside class="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant z-50 flex flex-col justify-between select-none"><div class="flex flex-col"><div class="h-14 px-margin-page flex items-center justify-between border-b border-outline-variant"><div class="flex items-center gap-unit"><div class="w-6 h-6 rounded bg-primary flex items-center justify-center"><span class="material-symbols-outlined text-on-primary text-[16px]">token</span></div><span class="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface ml-1">UNIFY</span></div><span class="px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant font-mono-code text-[10px] text-on-surface-variant font-medium">v2.4</span></div><div class="p-gutter border-b border-outline-variant bg-surface-container-lowest/50"><button class="w-full flex items-center justify-between px-3 py-2 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant text-left transition-colors"><div class="flex items-center gap-stack-compact overflow-hidden"><div class="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-on-secondary text-[13px]">domain</span></div><span class="font-body-sm text-body-sm font-semibold text-on-surface truncate">Acme Eng</span></div><span class="material-symbols-outlined text-outline text-[18px]">unfold_more</span></button></div><div class="px-stack-comfortable pt-stack-comfortable pb-stack-compact"><span class="font-label-caps text-label-caps text-outline uppercase tracking-wider">Navigation</span></div><nav class="px-stack-compact flex flex-col gap-unit" data-active-classes="bg-primary-container text-on-primary-container font-semibold"><a class="NAV_CLASS_ONBOARDING" data-path="onboarding" href="ONBOARDING_HREF"><div class="flex items-center gap-stack-comfortable"><span class="material-symbols-outlined text-[18px]">rocket_launch</span><span class="font-body-sm text-body-sm">Onboarding</span></div></a><a class="NAV_CLASS_CONFLICT_INBOX" data-path="conflict-inbox" href="CONFLICT_INBOX_HREF"><div class="flex items-center gap-stack-comfortable"><span class="material-symbols-outlined text-[18px]">inbox</span><span class="font-body-sm text-body-sm">Conflict Inbox</span></div><span class="px-1.5 py-0.5 rounded bg-error-container text-error font-mono-code text-[11px] font-bold">14</span></a><a class="NAV_CLASS_CONFLICT_DETAIL" data-path="conflict-detail" href="CONFLICT_DETAIL_HREF"><span class="material-symbols-outlined text-[18px]">troubleshoot</span><span class="font-body-sm text-body-sm">Conflict Detail</span></a><a class="NAV_CLASS_POLICY_CONFIG" data-path="policy-configuration" href="POLICY_CONFIG_HREF"><span class="material-symbols-outlined text-[18px]">rule</span><span class="font-body-sm text-body-sm">Policy Configuration</span></a><a class="NAV_CLASS_POLICY_SIM" data-path="policy-simulation" href="POLICY_SIM_HREF"><div class="flex items-center gap-stack-comfortable"><span class="material-symbols-outlined text-[18px]">labs</span><span class="font-body-sm text-body-sm">Policy Simulation</span></div><span class="px-1.5 py-0.5 rounded bg-tertiary-container text-on-tertiary-container font-mono-code text-[10px]">TEST</span></a><a class="NAV_CLASS_GRAPH" data-path="graph-explorer" href="GRAPH_HREF"><span class="material-symbols-outlined text-[18px]">account_tree</span><span class="font-body-sm text-body-sm">Graph Explorer</span></a><a class="NAV_CLASS_LINKS" data-path="link-management" href="LINKS_HREF"><span class="material-symbols-outlined text-[18px]">link</span><span class="font-body-sm text-body-sm">Link Management</span></a><a class="NAV_CLASS_SEARCH" data-path="search" href="SEARCH_HREF"><span class="material-symbols-outlined text-[18px]">search</span><span class="font-body-sm text-body-sm">Search</span></a><a class="NAV_CLASS_AUDIT" data-path="audit-trail" href="AUDIT_HREF"><span class="material-symbols-outlined text-[18px]">history</span><span class="font-body-sm text-body-sm">Audit Trail</span></a></nav><div class="px-stack-comfortable pt-stack-comfortable pb-stack-compact mt-2"><span class="font-label-caps text-label-caps text-outline uppercase tracking-wider">Admin & Settings</span></div><nav class="px-stack-compact flex flex-col gap-unit" data-active-classes="bg-primary-container text-on-primary-container font-semibold"><a class="NAV_CLASS_ADMIN" data-path="admin" href="ADMIN_HREF"><span class="material-symbols-outlined text-[18px]">admin_panel_settings</span><span class="font-body-sm text-body-sm">Administration</span></a><a class="NAV_CLASS_EVAL" data-path="evaluation" href="EVAL_HREF"><span class="material-symbols-outlined text-[18px]">monitoring</span><span class="font-body-sm text-body-sm">Evaluation</span></a><a class="NAV_CLASS_USER" data-path="user-profile" href="USER_HREF"><span class="material-symbols-outlined text-[18px]">person</span><span class="font-body-sm text-body-sm">User Profile</span></a><a class="NAV_CLASS_SLACK" data-path="slack-config" href="SLACK_HREF"><span class="material-symbols-outlined text-[18px]">tag</span><span class="font-body-sm text-body-sm">Slack Config</span></a><a class="NAV_CLASS_NOTIF" data-path="notifications" href="NOTIF_HREF"><span class="material-symbols-outlined text-[18px]">notifications</span><span class="font-body-sm text-body-sm">Notifications</span></a><a class="NAV_CLASS_STUDY" data-path="study" href="STUDY_HREF"><span class="material-symbols-outlined text-[18px]">science</span><span class="font-body-sm text-body-sm">Study Interface</span></a></nav></div></aside>'''

# Map folder names to nav class keys and data-paths
FOLDER_TO_NAV = {
    "unify_workspace_onboarding": ("ONBOARDING", "onboarding"),
    "unify_conflict_inbox": ("CONFLICT_INBOX", "conflict-inbox"),
    "unify_conflict_detail": ("CONFLICT_DETAIL", "conflict-detail"),
    "unify_artifact_graph_explorer": ("GRAPH", "graph-explorer"),
    "unify_policy_configuration": ("POLICY_CONFIG", "policy-configuration"),
    "unify_policy_simulation": ("POLICY_SIM", "policy-simulation"),
    "unify_link_management": ("LINKS", "link-management"),
    "unify_search_advanced_filtering": ("SEARCH", "search"),
    "unify_evaluation_dashboard_internal": ("EVAL", "evaluation"),
    "unify_workspace_administration": ("ADMIN", "admin"),
    "unify_audit_trail_compliance_export": ("AUDIT", "audit-trail"),
    "unify_user_profile_watcher_preferences": ("USER", "user-profile"),
    "unify_slack_configuration": ("SLACK", "slack-config"),
    "unify_notification_preferences": ("NOTIF", "notifications"),
    "unify_manual_workflow_study_interface": ("STUDY", "study"),
}

ACTIVE_STYLE = "flex items-center justify-between px-3 py-2 rounded transition-colors bg-primary-container text-on-primary-container font-semibold"
INACTIVE_STYLE = "flex items-center gap-stack-comfortable px-3 py-2 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"


def get_relative_path(from_folder, to_file):
    """Get relative path from one folder's code.html to another."""
    return to_file


def build_sidebar(active_data_path):
    """Build the sidebar HTML with the correct active item."""
    sidebar = SIDEBAR_TEMPLATE

    # For each nav item, compute the relative href and set active class
    for folder, (nav_key, data_path) in FOLDER_TO_NAV.items():
        target_file = PATH_MAP[data_path]
        is_active = (data_path == active_data_path)

        # Determine active class
        if is_active:
            cls = ACTIVE_STYLE
        else:
            cls = INACTIVE_STYLE

        # Replace nav class placeholder
        sidebar = sidebar.replace(f"NAV_CLASS_{nav_key}", cls)

        # Replace href placeholder
        sidebar = sidebar.replace(f"{nav_key}_HREF", target_file)

    return sidebar


def extract_existing_sidebar(content):
    """Extract the existing sidebar aside element."""
    start = content.find('<aside class="fixed left-0 top-0')
    if start == -1:
        return None, None, None

    # Find the matching closing aside
    depth = 0
    i = start
    end = start
    while i < len(content):
        if content[i:i+6] == '<aside':
            depth += 1
        elif content[i:i+7] == '</aside':
            depth -= 1
            if depth == 0:
                end = i + 7
                break
        i += 1

    return start, end, content[start:end]


def wire_page(folder_name):
    """Wire up a single page."""
    filepath = os.path.join(BASE, folder_name, "code.html")
    with open(filepath, 'r') as f:
        content = f.read()

    active_path = ACTIVE_MAP[folder_name]
    title = TITLES[folder_name]

    # 1. Update page title
    content = re.sub(
        r'<title>[^<]+</title>',
        f'<title>{title} | Unify Platform</title>',
        content
    )

    # 2. Replace existing sidebar
    start, end, old_sidebar = extract_existing_sidebar(content)
    if start is not None:
        new_sidebar = build_sidebar(active_path)
        content = content[:start] + new_sidebar + content[end:]

    # 3. Wire up specific buttons based on page
    content = wire_buttons(folder_name, content)

    with open(filepath, 'w') as f:
        f.write(content)

    print(f"  Wired: {folder_name}")


def wire_buttons(folder_name, content):
    """Wire up page-specific buttons to navigate to other pages."""
    inbox = PATH_MAP["conflict-inbox"]
    detail = PATH_MAP["conflict-detail"]
    policy = PATH_MAP["policy-configuration"]
    sim = PATH_MAP["policy-simulation"]
    audit = PATH_MAP["audit-trail"]
    admin = PATH_MAP["admin"]
    eval_ = PATH_MAP["evaluation"]
    onboarding = PATH_MAP["onboarding"]
    search = PATH_MAP["search"]
    links = PATH_MAP["link-management"]
    graph = PATH_MAP["graph-explorer"]
    user = PATH_MAP["user-profile"]
    slack = PATH_MAP["slack-config"]
    notif = PATH_MAP["notifications"]
    study = PATH_MAP["study"]

    if folder_name == "unify_workspace_onboarding":
        # "Save & Continue" / completeStep -> go to conflict inbox
        content = content.replace(
            "completeStep()",
            f"window.location.href='{inbox}'"
        )

    elif folder_name == "unify_conflict_inbox":
        # "Review 3 Blockers" button -> conflict detail
        content = content.replace(
            'id="batch-resolve-btn"',
            f'id="batch-resolve-btn" onclick="window.location.href=\'{detail}\'"'
        )
        # "Configure Rules" -> policy config
        content = re.sub(
            r'(<button[^>]*>[\s\S]*?Configure Rules[\s\S]*?</button>)',
            lambda m: m.group(0).replace(
                'href="#"',
                f'onclick="window.location.href=\'{policy}\'"'
            ).replace(
                'class="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-medium transition flex items-center gap-1.5 shadow-sm"',
                f'class="px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm font-medium transition flex items-center gap-1.5 shadow-sm cursor-pointer" onclick="window.location.href=\'{policy}\'"'
            ),
            content
        )
        # "New Policy Rule" -> policy config
        content = re.sub(
            r'(<button[^>]*>[\s\S]*?New Policy Rule[\s\S]*?</button>)',
            lambda m: m.group(0).replace(
                'class="px-3.5 py-1.5 rounded-lg bg-primary-container hover:brightness-110 text-on-primary-container font-body-sm text-body-sm font-semibold transition flex items-center gap-1.5 shadow-md"',
                f'class="px-3.5 py-1.5 rounded-lg bg-primary-container hover:brightness-110 text-on-primary-container font-body-sm text-body-sm font-semibold transition flex items-center gap-1.5 shadow-md cursor-pointer" onclick="window.location.href=\'{policy}\'"'
            ),
            content
        )

    elif folder_name == "unify_conflict_detail":
        # Breadcrumb "Conflict Inbox" link -> inbox
        content = content.replace(
            f'<a class="hover:text-primary transition-colors flex items-center gap-1" href="#">\n<span class="material-symbols-outlined text-[16px]">inbox</span>\n<span>Conflict Inbox</span>\n</a>',
            f'<a class="hover:text-primary transition-colors flex items-center gap-1" href="{inbox}">\n<span class="material-symbols-outlined text-[16px]">inbox</span>\n<span>Conflict Inbox</span>\n</a>'
        )
        # Also handle minified version
        content = content.replace(
            f'<a class="hover:text-primary transition-colors flex items-center gap-1" href="#"><span class="material-symbols-outlined text-[16px]">inbox</span><span>Conflict Inbox</span></a>',
            f'<a class="hover:text-primary transition-colors flex items-center gap-1" href="{inbox}"><span class="material-symbols-outlined text-[16px]">inbox</span><span>Conflict Inbox</span></a>'
        )
        # "Back to Inbox" button
        content = content.replace(
            'onclick="history.back()"',
            f'onclick="window.location.href=\'{inbox}\'"'
        )

    elif folder_name == "unify_policy_configuration":
        # "Global Audit" button -> audit trail
        content = re.sub(
            r'(id="btn-create-policy")',
            r'\1',
            content
        )
        # Find and wire "Global Audit" button
        content = re.sub(
            r'(<button[^>]*>[\s\S]*?Global Audit[\s\S]*?</button>)',
            lambda m: m.group(0).replace(
                '#',
                audit
            ) if 'href="#"' in m.group(0) else m.group(0),
            content
        )
        # Add onclick to Global Audit if not already wired
        if 'Global Audit' in content and audit not in content.split('Global Audit')[0][-200:]:
            content = re.sub(
                r'(>[\s]*Global Audit[\s]*</button>)',
                f' onclick="window.location.href=\'{audit}\'"\\1',
                content,
                count=1
            )
        # "View Analytics" -> evaluation dashboard
        content = re.sub(
            r'(View Analytics)',
            f'\\1',
            content
        )

    elif folder_name == "unify_policy_simulation":
        # Breadcrumb "Policy Configuration" -> policy config
        content = content.replace(
            f'href="#">\n<span class="material-symbols-outlined text-[14px]">arrow_back</span>\n<span>Policy Configuration</span>',
            f'href="{policy}">\n<span class="material-symbols-outlined text-[14px]">arrow_back</span>\n<span>Policy Configuration</span>'
        )
        # Minified version
        content = content.replace(
            f'href="#"><span class="material-symbols-outlined text-[14px]">arrow_back</span><span>Policy Configuration</span>',
            f'href="{policy}"><span class="material-symbols-outlined text-[14px]">arrow_back</span><span>Policy Configuration</span>'
        )
        # "Apply v2.2 to Policy" -> policy config
        content = content.replace(
            'id="applyPolicyBtn"',
            f'id="applyPolicyBtn" onclick="window.location.href=\'{policy}\'"'
        )

    elif folder_name == "unify_workspace_administration":
        # "Compliance Audit" -> audit trail
        content = re.sub(
            r'(>[\s]*Compliance Audit[\s\S]*?</button>)',
            f' onclick="window.location.href=\'{audit}\'"\\1',
            content,
            count=1
        )

    elif folder_name == "unify_audit_trail_compliance_export":
        # Breadcrumb "Governance" -> admin
        content = content.replace(
            f'href="#">\n<span class="material-symbols-outlined text-[14px]">arrow_back</span>\n<span>Governance</span>',
            f'href="{admin}">\n<span class="material-symbols-outlined text-[14px]">arrow_back</span>\n<span>Governance</span>'
        )
        # Minified
        content = content.replace(
            f'href="#"><span class="material-symbols-outlined text-[14px]">arrow_back</span><span>Governance</span>',
            f'href="{admin}"><span class="material-symbols-outlined text-[14px]">arrow_back</span><span>Governance</span>'
        )

    elif folder_name == "unify_search_advanced_filtering":
        # Wire result links
        pass  # Results are dynamic, sidebar handles navigation

    elif folder_name == "unify_link_management":
        # "Create New Link" button scrolls to wizard (keep as-is)
        pass

    elif folder_name == "unify_user_profile_watcher_preferences":
        # "Test Sync" buttons already work inline
        pass

    elif folder_name == "unify_slack_configuration":
        # Breadcrumb "Integrations" -> admin
        content = content.replace(
            f'href="#">\n<span class="material-symbols-outlined text-[14px]">arrow_back</span>\n<span>Integrations</span>',
            f'href="{admin}">\n<span class="material-symbols-outlined text-[14px]">arrow_back</span>\n<span>Integrations</span>'
        )
        # Minified
        content = content.replace(
            f'href="#"><span class="material-symbols-outlined text-[14px]">arrow_back</span><span>Integrations</span>',
            f'href="{admin}"><span class="material-symbols-outlined text-[14px]">arrow_back</span><span>Integrations</span>'
        )

    elif folder_name == "unify_notification_preferences":
        # "Apply Routing Rules" -> save preferences (keep inline)
        pass

    elif folder_name == "unify_manual_workflow_study_interface":
        # Standalone study tool
        pass

    elif folder_name == "unify_artifact_graph_explorer":
        # Breadcrumb workspace -> admin
        content = content.replace(
            'href="#">Workspace',
            f'href="{admin}">Workspace'
        )

    return content


def main():
    print("Wiring navigation for all pages...")
    for folder in PATH_MAP:
        if os.path.isdir(os.path.join(BASE, folder)):
            wire_page(folder)
    print("Done! All pages wired.")


if __name__ == "__main__":
    main()
