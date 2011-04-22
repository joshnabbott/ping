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