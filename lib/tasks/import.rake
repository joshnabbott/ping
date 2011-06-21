namespace :import do
  desc 'Imports user passwords from db/accounts_master.csv file. Find users by their email or creates a new user if email address is not present.'
  task :account_passwords => :environment do
    FasterCSV.foreach('db/accounts_master.csv', :headers => true) do |row|

      type, name, username, email_address, password = row.fields
      first_name, last_name = name.split

      person = Person.includes(:work_profile).where(:work_profiles => { :email_address => email_address }).first || Person.new

      if person.new_record?
        # Create a new person if this one didn't already exist.
        person.hr_profile.first_name             = first_name
        person.hr_profile.last_name              = last_name
        person.hr_profile.is_active              = false
        person.work_profile.work_country         = 'USA'
        person.work_profile.work_state           = 'CO'
        person.work_profile.work_city            = 'Denver'
        person.work_profile.work_zip             = '80206'
        person.work_profile.work_address         = '158 Filmore St.'
        person.work_profile.email_account_active = false
        person.work_profile.email_address        = email_address
        person.public_profile.home_country       = 'USA'
        person.it_profile.default_username       = username
        person.credential.username               = username
        person.credential.password               = password
        person.credential.password_confirmation  = password
      else
        person.credential.password               = password
        person.credential.password_confirmation  = password
      end

      person.hr_profile.save(:validate => false)
      person.work_profile.save(:validate => false)
      person.public_profile.save(:validate => false)
      person.it_profile.save(:validate => false)
      person.credential.save(:validate => false)

      puts person.save(:validate => false)
    end
  end

  desc 'Imports asset data from casper using the casper_api gem'
  task :casper => :environment do
    casper = CasperApi::Casper.new('Development', 'test')

    Person.all.each do |person|
      puts "Searching for computer asset for #{person.full_name}..."

      begin
        casper_computer = casper.computers.find(person.full_name)

        puts "Found #{person.full_name}'s computer."

        computer                          = Asset.find_or_initialize_by_serial_number(casper_computer.general['serial_number'])
        computer.employee                 = person
        computer.kind                     = 'computer'
        computer.asset_number             = casper_computer.general['id']
        computer.name                     = casper_computer.general['name']
        computer.model                    = casper_computer.hardware['model']
        computer.manufacturer             = casper_computer.hardware['make']
        computer.status                   = 'Active'
        # computer.casper_serialized_data = casper_computer.to_json # results in Mysql max_allowed_packet error for now.

        if computer.save
          puts "Saved #{person.full_name}'s computer."
        else
          puts "Couldn't save #{person.full_name}'s computer."
          puts computer.error.inspect
        end

      rescue Exception => e
        puts "Couldn't find a computer for #{person.full_name}."
      end
    end

  end

  task :employee_list => :environment do
    FasterCSV.foreach('db/employee_list.csv', :headers => true) do |row|
        dummy_id,
        first_name,
        last_name,
        email,
        job_title,
        company,
        department,
        gender,
        work_extension,
        work_direct,
        mobile,
        fax,
        google_talk,
        aim,
        skype,
        address,
        city, 
        state,
        zip,
        country = row.fields

      username = "#{first_name}.#{last_name}".downcase

      person = Person.joins(:it_profile).readonly(false).where(:it_profiles => { :default_username => username }).first || Person.new

      person.hr_profile.update_attributes(:first_name      => first_name,
                                          :last_name       => last_name,
                                          :job_title       => job_title || 'Missing',
                                          :gender          => gender.downcase,
                                          :department      => department,
                                          :pay_type        => 'salaried',
                                          :is_active       => true,
                                          :employment_type => 'Full Time')

      person.work_profile.update_attributes(:work_country      => 'USA',
                                            :work_state        => state,
                                            :work_city         => city,
                                            :work_zip          => zip,
                                            :work_phone_number => work_direct,
                                            :work_extension    => work_extension,
                                            :work_address      => address,
                                            :email_account_active => true,
                                            :email_address        => email)

      person.public_profile.update_attributes(:home_mobile_number => mobile,
                                              :home_country       => 'USA',
                                              :chat_skype         => skype,
                                              :chat_aim           => aim)

      person.it_profile.update_attributes(:chat_gtalk           => google_talk,
                                          :default_username     => username)

      if person.new_record?
        person.credential.update_attributes(:username => username, :password => 'password', :password_confirmation => 'password')
      end

      puts person.save!
    end
  end
end