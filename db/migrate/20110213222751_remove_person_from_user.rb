class RemovePersonFromUser < ActiveRecord::Migration
  def self.up
	remove_column :users, :person_id
  end

  def self.down
  end
end
