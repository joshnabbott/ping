class MoveEmailAddressToWorkProfiles < ActiveRecord::Migration
  def self.up
    unless column_exists?(:work_profiles, :email_address)
      add_column :work_profiles, :email_address, :string
    end

    unless column_exists?(:work_profiles, :email_account_active)
      add_column :work_profiles, :email_account_active, :boolean, :default => false
    end

    ItProfile.all.each do |it_profile|
      work_profile = it_profile.person.work_profile
      work_profile.update_attributes(:email_address => it_profile.email_address, :email_account_active => it_profile.email_account_active)
    end

    if column_exists?(:it_profiles, :email_address)
      remove_column :it_profiles, :email_address
    end

    if column_exists?(:it_profiles, :email_account_active)
      remove_column :it_profiles, :email_account_active
    end
  end

  def self.down
    unless column_exists?(:it_profiles, :email_address)
      add_column :it_profiles, :email_address, :string
    end

    unless column_exists?(:it_profiles, :email_account_active)
      add_column :it_profiles, :email_account_active, :boolean, :default => false
    end

    WorkProfile.all.each do |work_profile|
      it_profile = work_profile.person.it_profile
      it_profile.update_attributes(:email_address => work_profile.email_address, :email_account_active => work_profile.email_account_active)
    end

    if column_exists?(:work_profiles, :email_address)
      remove_column :work_profiles, :email_address
    end

    if column_exists?(:work_profiles, :email_account_active)
      remove_column :work_profiles, :email_account_active
    end
  end
end
