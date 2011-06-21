class RemoveHomeFaxNumber < ActiveRecord::Migration
  def self.up
    remove_column :public_profiles, :home_fax_number
  end

  def self.down
    add_column :public_profiles, :home_fax_number, :string
  end
end
