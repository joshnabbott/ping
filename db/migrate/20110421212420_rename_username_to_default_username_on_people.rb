class RenameUsernameToDefaultUsernameOnPeople < ActiveRecord::Migration
  def self.up
    rename_column :people, :username, :default_username
  end

  def self.down
    rename_column :people, :default_username, :username
  end
end
