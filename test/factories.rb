Factory.define(:person) do |f|
  f.association                     :hr_profile
  f.association                     :it_profile
  f.association                     :facilities_profile
  f.association                     :public_profile
  f.association                     :emergency_profile
  f.employee_photo                  ''
end

Factory.define(:facilities_profile) do |f|
  f.seating_floor                   FacilitiesProfile::SEATING_FLOORS.sample
  f.seating_number                  FacilitiesProfile::SEATING_NUMBERS.sample
  f.building_card                   '123456'
  f.garage_card                     '566789'
  f.fed_ex_account                  '234298356234'
end

Factory.define(:public_profile) do |f|
  f.bio                             'I am an employee'
  f.personal_email_address          'johnsmith@yahoo.com'
  f.home_phone_number               '123-456-7890'
  f.home_fax_number                 '123-456-7890'
  f.home_mobile_number              '123-456-7890'
  f.home_address                    '1060 W. Addison St.'
  f.home_city                       'Chicago'
  f.home_state                      'IL'
  f.home_zip                        '60613'
  f.home_country                    Person::COUNTRIES.sample
end

Factory.define(:emergency_profile) do |f|
  f.name                            'Joan Smith'
  f.phone_number                    '123-456-7890'
  f.relation                        'Mom'
end

Factory.define(:hr_profile) do |f|
  f.first_name                      "John"
  f.middle_name                     "Q"
  f.last_name                       "Smith"
  f.title                           "Jr."
  f.gender                          HrProfile::GENDERS.sample
  f.department                      HrProfile::DEPARTMENTS.sample
  f.job_title                       "Developer"
  f.hire_date                       Date.today
  f.hire_date_vacation_adjustment   Date.today
  f.departure_date                  Date.today
  f.pay_type                        HrProfile::PAY_TYPES.sample
  f.status                          HrProfile::STATUSES.sample
  f.employment_type                 HrProfile::EMPLOYMENT_TYPES.sample
  f.birthday                        30.years.ago
  f.work_email_address              'john.smith@factorylabs.com'
  f.work_phone_number               '123-456-7890'
  f.work_fax_number                 '123-456-7890'
  f.work_mobile_number              '123-456-7890'
  f.work_extension                  '456'
  f.work_address                    '158 Fillmore'
  f.work_city                       'Denver'
  f.work_state                      'CO'
  f.work_zip                        '80206'
  f.work_country                    Person::COUNTRIES.sample
end

Factory.define(:it_profile) do |f|
  f.default_username                'john.smith'
  f.chat_gtalk                      'john.smith@factorylabs.com'
  f.chat_aim                        'factoryjsmith'
  f.chat_skype                      'factoryjsmith'
  f.email_account_active            true
end

Factory.define(:group) do |f|
  f.sequence(:name) { |n| "Group #{n}" }
end

Factory.define(:credential) do |f|
  f.sequence(:username) { |n| "user_#{n}" }
  f.password            'Password1'
  f.association         :person
end