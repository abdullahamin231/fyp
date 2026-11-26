-- UNIFY — FR-14: an admin's changes to who routing can reach are audited.
alter type public.audit_action add value if not exists 'person_role_changed';
alter type public.audit_action add value if not exists 'person_identity_merged';
