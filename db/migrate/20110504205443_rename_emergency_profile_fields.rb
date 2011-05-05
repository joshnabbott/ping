class RenameEmergencyProfileFields < ActiveRecord::Migration

  def self.up
    rename_column :emergency_profiles, :emergency_contact_name,     :name
    rename_column :emergency_profiles, :emergency_contact_number,   :phone_number
    rename_column :emergency_profiles, :emergency_contact_relation, :relation
  end

  def self.down
    rename_column :emergency_profiles, :name,         :emergency_contact_name
    rename_column :emergency_profiles, :phone_number, :emergency_contact_number
    rename_column :emergency_profiles, :relation,     :emergency_contact_relation
  end

end
