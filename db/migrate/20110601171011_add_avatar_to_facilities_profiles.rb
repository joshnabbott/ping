class AddAvatarToFacilitiesProfiles < ActiveRecord::Migration
  def self.up
    add_column :facilities_profiles, :avatar, :string
  end

  def self.down
    remove_column :facilities_profiles, :avatar
  end
end
