class GroupsPeople < ActiveRecord::Migration
  def self.up
    create_table :groups_people, :id => false do |t|
      t.references :group, :person
    end
  end

  def self.down
    drop_table :groups_people
  end
end
