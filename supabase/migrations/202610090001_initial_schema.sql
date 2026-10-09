create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(), name text not null, states text[] not null default '{}', active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade, name text not null, email text, phone text, created_at timestamptz not null default now()
);
create table if not exists public.client_inquiries (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id), date_received timestamptz not null default now(), inquiry_type text not null, client_question text not null, assigned_employee uuid references auth.users(id), status text not null check (status in ('New','In Progress','Waiting','Resolved')), answer_category text, answer_provided text, client_action text not null default 'None', client_action_note text, follow_up_date date, resolved_date timestamptz, related_prior_inquiry_id uuid references public.client_inquiries(id), created_by uuid references auth.users(id), updated_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.operations_reviews (
  id uuid primary key default gen_random_uuid(), inquiry_id uuid not null unique references public.client_inquiries(id) on delete cascade, review_status text not null default 'Pending' check (review_status in ('Pending','Completed')), reviewer_id uuid references auth.users(id), root_cause text, root_cause_notes text, corrective_action text, corrective_action_override boolean not null default false, override_reason text, reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.daily_reports (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id), report_date date not null, status text not null default 'Draft' check (status in ('Draft','Finalized')), narrative text, finalized_at timestamptz, finalized_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (client_id, report_date)
);
create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id), month_start date not null, status text not null default 'Draft' check (status in ('Draft','Finalized')), generated_at timestamptz not null default now(), generated_by uuid references auth.users(id), finalized_at timestamptz, finalized_by uuid references auth.users(id), unique (client_id, month_start)
);
create table if not exists public.trend_snapshots (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id), as_of_date date not null, root_cause text not null, total_inquiries integer not null, root_cause_count integer not null, percentage numeric(6,2) not null, trend_status text not null, corrective_action text, created_at timestamptz not null default now(), unique (client_id, as_of_date, root_cause)
);
create table if not exists public.client_work_items (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id), status text not null default 'Active', assigned_owner uuid references auth.users(id), education_resource_notes text, follow_up_notes text, first_detected_at timestamptz not null default now(), last_recalculated_at timestamptz not null default now()
);
create unique index if not exists one_active_client_work_item on public.client_work_items(client_id) where status='Active';
create table if not exists public.management_escalations (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id), inquiry_id uuid not null references public.client_inquiries(id), reason text not null, responsible_employee_ids uuid[] not null default '{}', prior_inquiry_dates date[] not null default '{}', response_history jsonb not null default '[]'::jsonb, elapsed_response_minutes integer[] not null default '{}', internal_notes text, status text not null default 'Open', created_at timestamptz not null default now(), unique (inquiry_id, reason)
);
create table if not exists public.client_sme_assignments (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id), specialty text not null check (specialty in ('eligibility','authorization','credentialing','ar','payment','client_education','operations')), user_id uuid references auth.users(id), active boolean not null default true, unique (client_id, specialty)
);
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(), entity_type text not null, entity_id uuid not null, action text not null, actor_id uuid references auth.users(id), before_data jsonb, after_data jsonb, created_at timestamptz not null default now()
);

create or replace function public.queue_operations_review() returns trigger language plpgsql security invoker as $$
begin
  if new.status='Resolved' and old.status is distinct from 'Resolved' then
    insert into public.operations_reviews(inquiry_id) values(new.id) on conflict (inquiry_id) do nothing;
    if new.resolved_date is null then new.resolved_date = now(); end if;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_queue_operations_review on public.client_inquiries;
create trigger trg_queue_operations_review before update of status on public.client_inquiries for each row execute function public.queue_operations_review();

alter table public.clients enable row level security;
alter table public.client_contacts enable row level security;
alter table public.client_inquiries enable row level security;
alter table public.operations_reviews enable row level security;
alter table public.daily_reports enable row level security;
alter table public.monthly_reports enable row level security;
alter table public.trend_snapshots enable row level security;
alter table public.client_work_items enable row level security;
alter table public.management_escalations enable row level security;
alter table public.client_sme_assignments enable row level security;
alter table public.audit_events enable row level security;
create policy "employees read clients" on public.clients for select to authenticated using (true);
create policy "employees write clients" on public.clients for all to authenticated using (true) with check (true);
create policy "employees read contacts" on public.client_contacts for select to authenticated using (true);
create policy "employees write contacts" on public.client_contacts for all to authenticated using (true) with check (true);
create policy "employees read inquiries" on public.client_inquiries for select to authenticated using (true);
create policy "employees write inquiries" on public.client_inquiries for all to authenticated using (true) with check (true);
create policy "employees read operations reviews" on public.operations_reviews for select to authenticated using (true);
create policy "employees write operations reviews" on public.operations_reviews for all to authenticated using (true) with check (true);
create policy "employees read daily reports" on public.daily_reports for select to authenticated using (true);
create policy "employees write daily reports" on public.daily_reports for all to authenticated using (true) with check (true);
create policy "employees read monthly reports" on public.monthly_reports for select to authenticated using (true);
create policy "employees write monthly reports" on public.monthly_reports for all to authenticated using (true) with check (true);
create policy "employees read trends" on public.trend_snapshots for select to authenticated using (true);
create policy "employees write trends" on public.trend_snapshots for all to authenticated using (true) with check (true);
create policy "employees read work items" on public.client_work_items for select to authenticated using (true);
create policy "employees write work items" on public.client_work_items for all to authenticated using (true) with check (true);
create policy "employees read escalations" on public.management_escalations for select to authenticated using (true);
create policy "employees write escalations" on public.management_escalations for all to authenticated using (true) with check (true);
create policy "employees read sme assignments" on public.client_sme_assignments for select to authenticated using (true);
create policy "employees write sme assignments" on public.client_sme_assignments for all to authenticated using (true) with check (true);
create policy "employees read audit events" on public.audit_events for select to authenticated using (true);
create policy "employees insert audit events" on public.audit_events for insert to authenticated with check (true);
