-- Drop the demo fault switch (00021). The /demo control page and the worker's
-- per-job read of this table are removed; T10 stays covered by the worker's
-- gate tests, which configure the stub model directly.

drop table if exists public.demo_controls;
