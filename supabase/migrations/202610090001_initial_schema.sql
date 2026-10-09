begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'frontline' check (role in ('frontline','operations','admin','management')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role_title text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.config_options (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('inquiry_type','answer_category','status','root_cause','client_action','corrective_action','sme_specialty')),
  code text not null,
  label text not null,
  parent_option_id uuid references public.config_options(id),
  sort_order integer not null default 0,
  active boolean not null default true,
  successor_id uuid references public.config_options(id),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  unique(kind, code)
);

create table if not exists public.inquiry_root_cause_mappings (
  inquiry_type_id uuid not null references public.config_options(id) on delete cascade,
  root_cause_id uuid not null references public.config_options(id) on delete cascade,
  primary key (inquiry_type_id, root_cause_id)
);

create table if not exists public.corrective_action_mappings (
  root_cause_id uuid primary key references public.config_options(id) on delete cascade,
  corrective_action_id uuid not null references public.config_options(id)
);

create table if not exists public.client_sme_assignments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  specialty text not null check (specialty in ('eligibility','authorization','credentialing','ar','payment','general_client_education','operational_owner')),
  profile_id uuid references public.profiles(id),
  queue_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(client_id, specialty)
);

create table if not exists public.client_inquiries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id),
  date_received timestamptz not null default now(),
  inquiry_type_id uuid not null references public.config_options(id),
  question_text text not null,
  assigned_employee_id uuid not null references public.profiles(id),
  status_id uuid not null references public.config_options(id),
  answer_category_id uuid references public.config_options(id),
  answer_text text,
  client_action_id uuid references public.config_options(id),
  client_action_note text,
  follow_up_date date,
  resolved_at timestamptz,
  related_prior_inquiry_id uuid references public.client_inquiries(id),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id)
);

create table if not exists public.operations_reviews (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null unique references public.client_inquiries(id) on delete cascade,
  review_status text not null default 'pending' check (review_status in ('pending','completed')),
  reviewer_id uuid references public.profiles(id),
  root_cause_id uuid references public.config_options(id),
  root_cause_notes text,
  corrective_action_id uuid references public.config_options(id),
  corrective_action_overridden boolean not null default false,
  corrective_action_override_reason text,
  routed_profile_id uuid references public.profiles(id),
  routed_queue text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id),
  report_date date not null,
  inquiries_received jsonb not null default '[]'::jsonb,
  issues_resolutions jsonb not null default '[]'::jsonb,
  pending_items jsonb not null default '[]'::jsonb,
  client_actions jsonb not null default '[]'::jsonb,
  recurring_trends jsonb not null default '[]'::jsonb,
  follow_ups jsonb not null default '[]'::jsonb,
  narrative text,
  status text not null default 'draft' check (status in ('draft','finalized')),
  finalized_at timestamptz,
  finalized_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(client_id, report_date)
);

create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id),
  month_start date not null,
  narrative text,
  status text not null default 'draft' check (status in ('draft','finalized')),
  generated_at timestamptz not null default now(),
  generated_by uuid references auth.users(id),
  finalized_at timestamptz,
  finalized_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(client_id, month_start)
);

create index if not exists monthly_reports_client_month_idx on public.monthly_reports(client_id, month_start desc);
create index if not exists daily_reports_client_date_idx on public.daily_reports(client_id, report_date desc);
create index if not exists client_inquiries_client_received_idx on public.client_inquiries(client_id, date_received desc);

create table if not exists public.trend_snapshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id),
  root_cause_id uuid not null references public.config_options(id),
  as_of_date date not null,
  total_inquiries integer not null,
  root_cause_count integer not null,
  percentage numeric(6,2) not null,
  trend_status text not null check (trend_status in ('normal','watch','trend','high_priority')),
  corrective_action_id uuid references public.config_options(id),
  created_at timestamptz not null default now(),
  unique(client_id, root_cause_id, as_of_date)
);

create table if not exists public.client_work_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id),
  status text not null default 'active' check (status in ('active','closed')),
  assigned_profile_id uuid references public.profiles(id),
  assigned_queue text,
  education_resource_notes text,
  follow_up_notes text,
  first_detected_at timestamptz not null default now(),
  last_recalculated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists one_active_client_work_item on public.client_work_items(client_id) where status='active';

create table if not exists public.client_work_item_trends (
  work_item_id uuid not null references public.client_work_items(id) on delete cascade,
  root_cause_id uuid not null references public.config_options(id),
  percentage numeric(6,2) not null,
  root_cause_count integer not null,
  corrective_action_id uuid references public.config_options(id),
  active boolean not null default true,
  primary key(work_item_id, root_cause_id)
);

create table if not exists public.management_escalations (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null unique references public.client_inquiries(id),
  client_id uuid not null references public.clients(id),
  responsible_employee_ids uuid[] not null default '{}',
  prior_inquiry_dates date[] not null default '{}',
  response_history jsonb not null default '[]'::jsonb,
  elapsed_response_minutes integer[] not null default '{}',
  internal_notes text,
  status text not null default 'open' check (status in ('open','in_progress','closed')),
  owner_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

insert into public.config_options(kind,code,label,sort_order) values
('status','new','New',10),('status','in_progress','In Progress',20),('status','waiting','Waiting',30),('status','resolved','Resolved',40),
('inquiry_type','claim_status','Claim Status',10),('inquiry_type','denial_question','Denial Question',20),('inquiry_type','authorization_question','Authorization Question',30),('inquiry_type','credentialing_question','Credentialing Question',40),('inquiry_type','eligibility_question','Eligibility Question',50),('inquiry_type','payment_question','Payment Question',60),('inquiry_type','patient_balance_question','Patient Balance Question',70),('inquiry_type','documentation_question','Documentation Question',80),('inquiry_type','payer_question','Payer Question',90),('inquiry_type','complaint_concern','Complaint / Concern',100),
('client_action','none','None',10),('client_action','send_information','Send Information',20),('client_action','correct_information','Correct Information',30),('client_action','review_confirm','Review / Confirm',40),('client_action','complete_required_step','Complete Required Step',50),('client_action','other','Other',60),
('corrective_action','client_education','Client Education',10),('corrective_action','client_process_change','Client Process Change',20),('corrective_action','internal_process_change','Internal Process Change',30),('corrective_action','system_configuration_change','System / Configuration Change',40),('corrective_action','information_access_needed','Information Access Needed',50),('corrective_action','management_escalation','Management Escalation',60),('corrective_action','payer_escalation','Payer Escalation',70),('corrective_action','no_corrective_action','No Corrective Action',80),('corrective_action','further_investigation_needed','Further Investigation Needed',90),
('root_cause','eligibility_not_verified','Eligibility Not Verified',10),('root_cause','patient_ineligible','Patient Ineligible',20),('root_cause','authorization_missing_expired','Authorization Missing / Expired',30),('root_cause','authorization_pending','Authorization Pending',40),('root_cause','credentialing_pending','Credentialing Pending',50),('root_cause','provider_not_credentialed','Provider Not Credentialed',60),('root_cause','provider_affiliation_missing','Provider Affiliation Missing',70),('root_cause','edi_era_enrollment_missing','EDI / ERA Enrollment Missing',80),('root_cause','payment_issued_paper_check','Payment Issued by Paper Check',90),('root_cause','claim_processing_delay','Claim Processing Delay',100),('root_cause','claim_submission_error','Claim Submission Error',110),('root_cause','payer_processing_error','Payer Processing Error',120),('root_cause','documentation_missing','Documentation Missing',130),('root_cause','client_workflow_error','Client Workflow Error',140),('root_cause','internal_follow_up_failure','Internal Follow-Up Failure',150),('root_cause','no_root_cause_yet','No Root Cause Identified Yet',160),('root_cause','other','Other',170)
on conflict(kind,code) do nothing;

insert into public.config_options(kind,code,label,parent_option_id,sort_order)
select 'answer_category', v.code, v.label, i.id, v.sort_order
from (values ('acknowledged','Acknowledged',10),('received','Received',20),('processing','Processing',30),('adjudicated','Adjudicated',40),('denied','Denied',50),('rejected','Rejected',60),('payment_mailed','Payment Mailed',70),('posting_error','Posting Error',80)) v(code,label,sort_order)
cross join (select id from public.config_options where kind='inquiry_type' and code='claim_status') i
on conflict(kind,code) do nothing;

insert into public.corrective_action_mappings(root_cause_id, corrective_action_id)
select rc.id, ca.id
from (values
 ('eligibility_not_verified','client_education'),
 ('edi_era_enrollment_missing','system_configuration_change'),
 ('payment_issued_paper_check','system_configuration_change'),
 ('credentialing_pending','information_access_needed'),
 ('internal_follow_up_failure','management_escalation'),
 ('payer_processing_error','payer_escalation'),
 ('no_root_cause_yet','further_investigation_needed')
) m(root_code, action_code)
join public.config_options rc on rc.kind='root_cause' and rc.code=m.root_code
join public.config_options ca on ca.kind='corrective_action' and ca.code=m.action_code
on conflict(root_cause_id) do update set corrective_action_id=excluded.corrective_action_id;

insert into public.inquiry_root_cause_mappings(inquiry_type_id, root_cause_id)
select it.id, rc.id
from public.config_options it cross join public.config_options rc
where it.kind='inquiry_type' and rc.kind='root_cause'
on conflict do nothing;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_contacts enable row level security;
alter table public.config_options enable row level security;
alter table public.inquiry_root_cause_mappings enable row level security;
alter table public.corrective_action_mappings enable row level security;
alter table public.client_sme_assignments enable row level security;
alter table public.client_inquiries enable row level security;
alter table public.operations_reviews enable row level security;
alter table public.daily_reports enable row level security;
alter table public.monthly_reports enable row level security;
alter table public.trend_snapshots enable row level security;
alter table public.client_work_items enable row level security;
alter table public.client_work_item_trends enable row level security;
alter table public.management_escalations enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_employee_read on public.profiles for select to authenticated using (true);
create policy clients_employee_read on public.clients for select to authenticated using (true);
create policy client_contacts_employee_read on public.client_contacts for select to authenticated using (true);
create policy config_options_employee_read on public.config_options for select to authenticated using (true);
create policy inquiry_root_cause_mappings_employee_read on public.inquiry_root_cause_mappings for select to authenticated using (true);
create policy corrective_action_mappings_employee_read on public.corrective_action_mappings for select to authenticated using (true);
create policy client_sme_assignments_employee_read on public.client_sme_assignments for select to authenticated using (true);
create policy client_inquiries_employee_read on public.client_inquiries for select to authenticated using (true);
create policy operations_reviews_employee_read on public.operations_reviews for select to authenticated using (true);
create policy daily_reports_employee_read on public.daily_reports for select to authenticated using (true);
create policy monthly_reports_employee_read on public.monthly_reports for select to authenticated using (true);
create policy trend_snapshots_employee_read on public.trend_snapshots for select to authenticated using (true);
create policy client_work_items_employee_read on public.client_work_items for select to authenticated using (true);
create policy client_work_item_trends_employee_read on public.client_work_item_trends for select to authenticated using (true);
create policy audit_events_employee_read on public.audit_events for select to authenticated using (true);

create policy clients_employee_insert on public.clients for insert to authenticated with check (true);
create policy clients_employee_update on public.clients for update to authenticated using (true) with check (true);
create policy contacts_employee_all on public.client_contacts for all to authenticated using (true) with check (true);
create policy inquiries_employee_insert on public.client_inquiries for insert to authenticated with check ((select auth.uid()) = created_by);
create policy inquiries_employee_update on public.client_inquiries for update to authenticated using (true) with check (true);
create policy reports_employee_insert on public.daily_reports for insert to authenticated with check (true);
create policy reports_employee_update on public.daily_reports for update to authenticated using (true) with check (true);
create policy monthly_reports_employee_insert on public.monthly_reports for insert to authenticated with check (true);
create policy monthly_reports_employee_update on public.monthly_reports for update to authenticated using (true) with check (true);
create policy trends_employee_all on public.trend_snapshots for all to authenticated using (true) with check (true);
create policy work_items_employee_all on public.client_work_items for all to authenticated using (true) with check (true);
create policy work_item_trends_employee_all on public.client_work_item_trends for all to authenticated using (true) with check (true);
create policy audit_employee_insert on public.audit_events for insert to authenticated with check ((select auth.uid()) = actor_id);

create policy operations_review_write on public.operations_reviews for all to authenticated
using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role in ('operations','admin','management')))
with check (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role in ('operations','admin','management')));

create policy config_admin_write on public.config_options for all to authenticated
using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role='admin'))
with check (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role='admin'));
create policy root_mapping_admin_write on public.inquiry_root_cause_mappings for all to authenticated
using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role='admin'))
with check (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role='admin'));
create policy corrective_mapping_admin_write on public.corrective_action_mappings for all to authenticated
using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role='admin'))
with check (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role='admin'));
create policy sme_admin_write on public.client_sme_assignments for all to authenticated
using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role='admin'))
with check (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role='admin'));

create policy escalations_management_read on public.management_escalations for select to authenticated
using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role in ('admin','management')));
create policy escalations_management_write on public.management_escalations for all to authenticated
using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role in ('admin','management')))
with check (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.active and p.role in ('admin','management')));

commit;
