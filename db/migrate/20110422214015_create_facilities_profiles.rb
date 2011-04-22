class CreateFacilitiesProfiles < ActiveRecord::Migration
  def self.up
    create_table :facilities_profiles do |t|
      t.integer :person_id
      t.string :seating_floor
      t.string :seating_number
      t.string :building_card
      t.string :garage_card
      t.string :fed_ex_account

      t.timestamps
    end

    FacilitiesProfile.reset_column_information

    Person.all.each do |person|
        person.create_facilities_profile(person.attributes.slice(*FacilitiesProfile.column_names))
    end

    remove_column :people, :seating_floor
    remove_column :people, :seating_number
    remove_column :people, :building_card
    remove_column :people, :garage_card
    remove_column :people, :fed_ex_account
  end

  def self.down
    add_column :people, :seating_floor, :string
    add_column :people, :seating_number, :string
    add_column :people, :building_card, :string
    add_column :people, :garage_card, :string
    add_column :people, :fed_ex_account, :string

    Person.reset_column_information

    FacilitiesProfile.all.each do |facilities_profile|
        facilities_profile.person.update_attributes!(facilities_profile.attributes)
    end

    drop_table :facilities_profiles

  end
end
