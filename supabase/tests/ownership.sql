-- Execute after migration using an administrative SQL session. Rolls back fixtures.
begin;
insert into auth.users(id,email) values ('00000000-0000-4000-8000-000000000001','qe-test-a@example.invalid'),('00000000-0000-4000-8000-000000000002','qe-test-b@example.invalid');
insert into public.backtest_runs(user_id,name,settings,summary,provenance,is_synthetic) values ('00000000-0000-4000-8000-000000000001','A','{}','{}','{}',true),('00000000-0000-4000-8000-000000000002','B','{}','{}','{}',true);
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ begin
 if (select count(*) from public.backtest_runs) <> 1 then raise exception 'Cross-user read isolation failed'; end if;
 delete from public.backtest_runs where user_id='00000000-0000-4000-8000-000000000002';
 if found then raise exception 'Cross-user deletion succeeded'; end if;
 begin
  insert into public.backtest_runs(user_id,name,settings,summary,provenance,is_synthetic) values ('00000000-0000-4000-8000-000000000002','forged','{}','{}','{}',true);
  raise exception 'Cross-user insertion succeeded';
 exception when insufficient_privilege then null;
 end;
 delete from public.backtest_runs where user_id='00000000-0000-4000-8000-000000000001';
 if not found then raise exception 'Owner deletion failed'; end if;
end $$;
rollback;
