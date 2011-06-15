class HrProfilesStatusToIsActive < ActiveRecord::Migration
  def self.up
    add_column :hr_profiles, :is_active, :boolean, :default => true

    HrProfile.where(:status => 'Ended').each do |hr_profile|
      hr_profile.update_attribute(:is_active, false)
    end

    remove_column :hr_profiles, :status
  end

  def self.down
    add_column :hr_profiles, :status, :default => 'Active'

    HrProfile.where(:is_active => false).each do |hr_profile|
      hr_profile.update_attribute(:status, 'Ended')
    end

    remove_column :hr_profiles, :is_active
  end
end
