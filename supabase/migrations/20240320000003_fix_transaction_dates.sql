-- Add one day to all transaction dates
update transactions
set 
  date = date + interval '1 day',
  due_date = case 
    when due_date is not null then due_date + interval '1 day'
    else null
  end,
  service_period_start = case 
    when service_period_start is not null then service_period_start + interval '1 day'
    else null
  end,
  service_period_end = case 
    when service_period_end is not null then service_period_end + interval '1 day'
    else null
  end;