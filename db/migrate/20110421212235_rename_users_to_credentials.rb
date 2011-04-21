class RenameUsersToCredentials < ActiveRecord::Migration
  def self.up
    rename_table :users, :credentials
  end

  def self.down
    rename_table :credentials, :users
  end
end
