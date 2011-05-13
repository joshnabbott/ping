class CreateWorkProfiles < ActiveRecord::Migration

  def self.up
    create_table :work_profiles do |t|
      t.string  :work_phone_number
      t.string  :work_fax_number
      t.string  :work_mobile_number
      t.string  :work_extension
      t.string  :work_address
      t.string  :work_city
      t.string  :work_state
      t.string  :work_zip
      t.string  :work_country
      t.integer :person_id

      t.timestamps
    end

    WorkProfile.reset_column_information

    Person.all.each do |person|
      person.create_work_profile(person.hr_profile.attributes.slice(*WorkProfile.column_names))
    end

    remove_column :hr_profiles, :work_phone_number
    remove_column :hr_profiles, :work_fax_number
    remove_column :hr_profiles, :work_mobile_number
    remove_column :hr_profiles, :work_extension
    remove_column :hr_profiles, :work_address
    remove_column :hr_profiles, :work_city
    remove_column :hr_profiles, :work_state
    remove_column :hr_profiles, :work_zip
    remove_column :hr_profiles, :work_country
  end

  def self.down
    add_column :hr_profiles, :work_phone_number, :string
    add_column :hr_profiles, :work_fax_number, :string
    add_column :hr_profiles, :work_mobile_number, :string
    add_column :hr_profiles, :work_extension, :string
    add_column :hr_profiles, :work_address, :string
    add_column :hr_profiles, :work_city, :string
    add_column :hr_profiles, :work_state, :string
    add_column :hr_profiles, :work_zip, :string
    add_column :hr_profiles, :work_country, :string

    HrProfile.reset_column_information

    WorkProfile.all.each do |work_profile|
        work_profile.person.hr_profile.update_attributes!(work_profile.attributes)
    end
    
    drop_table :work_profiles
  end

end
