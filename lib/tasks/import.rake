namespace :import do
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
        computer.kind                     = 'Laptop' # This isn't always gonna be a laptop... It might be a desktop
        computer.asset_number             = casper_computer.general['id']
        computer.name                     = casper_computer.general['name']
        computer.model                    = casper_computer.hardware['model']
        computer.manufacturer             = casper_computer.hardware['make']
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
    
      person = Person.new

      person.build_hr_profile(        :first_name           => first_name,
                                      :last_name            => last_name,
                                      :job_title            => job_title,
                                      :gender               => gender.downcase,
                                      :work_email_address   => email,
                                      :work_phone_number    => work_direct,
                                      :work_extension       => work_extension,
                                      :work_address         => address,
                                      :work_city            => city,
                                      :work_state           => state,
                                      :work_zip             => zip,
                                      :work_country         => 'USA',
                                      :department           => department,
                                      :pay_type             => 'salaried' )
      person.build_public_profile(    :home_mobile_number   => mobile,
                                      :home_country         => 'USA')
      person.build_it_profile(        :email_account_active => true,
                                      :chat_gtalk           => google_talk,
                                      :chat_aim             => aim,
                                      :chat_skype           => skype,
                                      :default_username     => username )
                                
      person.build_credential(:username => username, :password => 'password', :password_confirmation => 'password')

      person.save!
    
    end
  end
end