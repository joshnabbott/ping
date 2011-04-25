class RenameNickNameToNicknameOnPublicProfiles < ActiveRecord::Migration
  def self.up
    rename_column :public_profiles, :nick_name, :nickname
  end

  def self.down
    rename_column :public_profiles, :nickname, :nick_name
  end
end
