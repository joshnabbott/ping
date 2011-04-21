When /^(?:|I )select "([^\"]*)" as the date$/ do |date|
  date = Chronic.parse(date)
  prefix = "date"

  select date.year.to_s, :from => "#{prefix}_#{dt_suffix[:year]}"
  select date.strftime('%B'), :from => "#{prefix}_#{dt_suffix[:month]}"
  select date.day.to_s, :from => "#{prefix}_#{dt_suffix[:day]}"
end

When /^(?:|I )select "([^\"]*)" as the date for "([^\"]*)"$/ do |date, prefix|
  date = Chronic.parse(date)

  select date.year.to_s, :from => "#{prefix}_#{dt_suffix[:year]}"
  select date.strftime('%B'), :from => "#{prefix}_#{dt_suffix[:month]}"
  select date.day.to_s, :from => "#{prefix}_#{dt_suffix[:day]}"
end

When /^(?:|I )select "([^\"]*)" as the date and time$/ do |date|
  date = Chronic.parse(date)
  prefix = "date"

  select date.year.to_s, :from => "#{prefix}_#{dt_suffix[:year]}"
  select date.strftime('%B'), :from => "#{prefix}_#{dt_suffix[:month]}"
  select date.day.to_s, :from => "#{prefix}_#{dt_suffix[:day]}"
  select date.hour.to_s, :from => "#{prefix}_#{dt_suffix[:hour]}"
  select date.min.to_s, :from => "#{prefix}_#{dt_suffix[:minute]}"
end

When /^(?:|I )select "([^\"]*)" as the date and time for "([^\"]*)"$/ do |date, prefix|
  date = Chronic.parse(date)

  select date.year.to_s, :from => "#{prefix}_#{dt_suffix[:year]}"
  select date.strftime('%B'), :from => "#{prefix}_#{dt_suffix[:month]}"
  select date.day.to_s, :from => "#{prefix}_#{dt_suffix[:day]}"
  select date.hour.to_s, :from => "#{prefix}_#{dt_suffix[:hour]}"
  select date.min.to_s, :from => "#{prefix}_#{dt_suffix[:minute]}"
end

def dt_suffix
   {
    :year   => '1i',
    :month  => '2i',
    :day    => '3i',
    :hour   => '4i',
    :minute => '5i'
  }
end