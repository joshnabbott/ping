class CreateEmergencyProfiles < ActiveRecord::Migration
  def self.up
    create_table :emergency_profiles do |t|
      t.integer :person_id
      t.string :emergency_contact_name
      t.string :emergency_contact_number
      t.string :emergency_contact_relation

      t.timestamps
    end

    EmergencyProfile.reset_column_information

    Person.all.each do |person|
        person.create_emergency_profile(person.attributes.slice(*EmergencyProfile.column_names))
    end

    remove_column :people, :emergency_contact_name
    remove_column :people, :emergency_contact_number
    remove_column :people, :emergency_contact_relation
  end

  def self.down
    add_column :people, :emergency_contact_name, :string
    add_column :people, :emergency_contact_number, :string
    add_column :people, :emergency_contact_relation, :string

    Person.reset_column_information

    EmergencyProfile.all.each do |emergency_profile|
        emergency_profile.person.update_attributes!(emergency_profile.attributes)
    end

    drop_table :emergency_profiles
  end
end
