Factory.define(:person) do |f|
  f.first_name                      "John"
  f.middle_name                     "Q"
  f.last_name                       "Smith"
  f.title                           "Jr."
  f.gender                          Person::GENDERS.sample
  f.department                      Person::DEPARTMENTS.sample
  f.job_title                       "Developer"
  f.hire_date                       Date.today
  f.hire_date_vacation_adjustment   Date.today
  f.departure_date                  Date.today
  f.pay_type                        Person::PAY_TYPES.sample
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
  f.bio                             'I am an employee'
  f.nick_name                       'John'
  f.personal_email_address          'johnsmith@yahoo.com'
  f.home_phone_number               '123-456-7890'
  f.home_fax_number                 '123-456-7890'
  f.home_mobile_number              '123-456-7890'
  f.home_address                    '1060 W. Addison St.'
  f.home_city                       'Chicago'
  f.home_state                      'IL'
  f.home_zip                        '60613'
  f.home_country                    Person::COUNTRIES.sample
  f.emergency_contact_name          'Joan Smith'
  f.emergency_contact_number        '123-456-7890'
  f.emergency_contact_relation      'Mom'
  f.employee_photo                  ''
  f.seating_floor                   '1'
  f.seating_number                  '50'
  f.building_card                   '123456'
  f.garage_card                     '566789'
  f.fed_ex_account                  '234298356234'
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
  f.password            'password'
  f.association         :person
end