class AddPersonIdToCredentials < ActiveRecord::Migration
  def self.up
    add_column :credentials, :person_id, :integer
  end

  def self.down
    remove_column :credentials, :person_id
  end
end
