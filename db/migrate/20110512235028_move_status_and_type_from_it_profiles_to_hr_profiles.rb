class MoveStatusAndTypeFromItProfilesToHrProfiles < ActiveRecord::Migration
  def self.up
    add_column :hr_profiles, :status, :string
    add_column :hr_profiles, :employment_type, :string

    HrProfile.reset_column_information

    HrProfile.all.each do |hr_profile|
      it_profile = hr_profile.person.it_profile
      hr_profile.update_attributes(:status => it_profile.status, :employment_type => it_profile.type)
    end

    remove_column :it_profiles, :status
    remove_column :it_profiles, :type
  end

  def self.down
    add_column :it_profiles, :status, :string
    add_column :it_profiles, :type, :string

    ItProfile.reset_column_information

    ItProfile.all.each do |it_profile|
      hr_profile = it_profile.person.hr_profile
      it_profile.update_attributes(:status => hr_profile.status, :type => hr_profile.employment_type)
    end

    remove_column :hr_profiles, :status
    remove_column :hr_profiles, :employment_type
  end
end
