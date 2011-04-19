class AddDepartmentToPeople < ActiveRecord::Migration
  def self.up
    add_column :people, :department, :string
  end

  def self.down
    remove_column :people, :department
  end
end
