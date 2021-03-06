Factory.define(:person) do |f|
  f.association                     :hr_profile
  f.association                     :it_profile
  f.association                     :facilities_profile
  f.association                     :public_profile
  f.association                     :emergency_profile
  f.association                     :work_profile
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
  f.home_mobile_number              '123-456-7890'
  f.home_address                    '1060 W. Addison St.'
  f.home_city                       'Chicago'
  f.home_state                      'IL'
  f.home_zip                        '60613'
  f.home_country                    Person::COUNTRIES.sample
  f.chat_aim                        'factoryjsmith'
  f.chat_skype                      'factoryjsmith'
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
  f.is_active                       true
  f.employment_type                 HrProfile::EMPLOYMENT_TYPES.sample
  f.birthday                        30.years.ago
end

Factory.define(:work_profile) do |f|
  f.work_phone_number               '123-456-7890'
  f.work_fax_number                 '123-456-7890'
  f.work_extension                  '456'
  f.work_address                    '158 Fillmore'
  f.work_city                       'Denver'
  f.work_state                      'CO'
  f.work_zip                        '80206'
  f.work_country                    Person::COUNTRIES.sample
  f.email_address                   'john.smith@factorylabs.com'
  f.email_account_active            true
end

Factory.define(:it_profile) do |f|
  f.default_username                'john.smith'
  f.chat_gtalk                      'john.smith@factorylabs.com'
end

Factory.define(:group) do |f|
  f.sequence(:name) { |n| "Group #{n}" }
end

Factory.define(:service) do |f|
  f.sequence(:name) { |n| "Service #{n}" }
end

Factory.define(:credential) do |f|
  f.sequence(:username) { |n| "user_#{n}" }
  f.password            'Password1'
  f.association         :person
end

Factory.define(:asset) do |f|
  f.association                     :employee, :factory => :person
  f.sequence(:asset_number)         { |n| n }
  f.kind                            'computer'
  f.sequence(:serial_number)        { |n| n }
  f.name                            'Joshua Abbott'
  f.model                           'Macbook Pro'
  f.manufacturer                    'Apple'
  f.warranty_end_date               Date.new + 1.year
  f.sequence(:warranty_number)      { |n| n }
  f.warranty_renewal_date           Date.new + 1.year
  f.status                          Asset::STATUSES.sample
  f.location                        'Denver, CO'
  f.notes                           'This computer is the best and this guy deserves the best.'
  f.purchase_date                   1.year.ago
  f.purchase_type                   'Purchased'
  f.sequence(:po_number)            { |n| n }
  f.sale_price                      4000.00
  f.payment_type                    'Cash'
end
