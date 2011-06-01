class AddAvatarToPublicProfiles < ActiveRecord::Migration
  def self.up
    add_column :public_profiles, :avatar, :string
  end

  def self.down
    remove_column :public_profiles, :avatar
  end
end
