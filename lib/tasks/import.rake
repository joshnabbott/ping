namespace :import do
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
    
      person = Person.create!(  :first_name           => first_name,
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
                                :home_mobile_number   => mobile,
                                :email_account_active => true,
                                :chat_gtalk           => google_talk,
                                :chat_aim             => aim,
                                :chat_skype           => skype,
                                :department           => department,
                                :default_username     => username,
                                :pay_type             => 'salaried',
                                :home_country         => 'USA' )
                                
        person.create_credential(:username => username, :password => 'password', :password_confirmation => 'password')
    
    end
  end
end