class RemoveWorkMobileNumber < ActiveRecord::Migration
  def self.up
    remove_column :work_profiles, :work_mobile_number
  end

  def self.down
    add_column :work_profiles, :work_mobile_number, :string
  end
end
