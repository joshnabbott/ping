class PeopleGroups < ActiveRecord::Migration
  def self.up
    create_table :people_groups, :id => false do |t|
      t.references :person, :group
    end
  end

  def self.down
    drop_table :people_groups
  end
end
