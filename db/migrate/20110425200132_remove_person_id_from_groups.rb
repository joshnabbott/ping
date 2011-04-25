class RemovePersonIdFromGroups < ActiveRecord::Migration
  def self.up
    remove_column :groups, :person_id
  end

  def self.down
    add_column :groups, :person_id, :integer
  end
end
