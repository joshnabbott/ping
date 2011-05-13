class MoveWorkEmailAddressToItProfile < ActiveRecord::Migration
  def self.up
    add_column :it_profiles, :email_address, :string

    ItProfile.reset_column_information

    ItProfile.all.each do |it_profile|
      hr_profile = it_profile.person.hr_profile
      it_profile.update_attributes(:email_address => hr_profile.work_email_address)
    end

    remove_column :hr_profiles, :work_email_address
  end

  def self.down
    add_column :hr_profiles, :work_email_address, :string

    HrProfile.reset_column_information

    HrProfile.all.each do |hr_profile|
      it_profile = hr_profile.person.it_profile
      hr_profile.update_attributes(:work_email_address => it_profile.email_address)
    end

    remove_column :it_profiles, :email_address
  end
end
