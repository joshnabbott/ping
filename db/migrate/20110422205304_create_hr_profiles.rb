class CreateHrProfiles < ActiveRecord::Migration
  def self.up
    create_table :hr_profiles do |t|
      t.string :first_name
      t.string :middle_name
      t.string :last_name
      t.string :title
      t.string :gender
      t.string :department
      t.string :job_title
      t.date :hire_date
      t.date :hire_date_vacation_adjustment
      t.date :departure_date
      t.date :birthday
      t.string :pay_type
      t.string :work_email_address
      t.string :work_phone_number
      t.string :work_fax_number
      t.string :work_mobile_number
      t.string :work_extension
      t.string :work_address
      t.string :work_city
      t.string :work_state
      t.string :work_zip
      t.string :work_country
      t.integer :person_id
      t.timestamps
    end

    HrProfile.reset_column_information

    Person.all.each do |person|
        person.create_hr_profile(person.attributes.slice(*HrProfile.column_names))
    end

    remove_column :people, :first_name
    remove_column :people, :middle_name
    remove_column :people, :last_name
    remove_column :people, :title
    remove_column :people, :gender
    remove_column :people, :department
    remove_column :people, :job_title
    remove_column :people, :hire_date
    remove_column :people, :hire_date_vacation_adjustment
    remove_column :people, :departure_date
    remove_column :people, :birthday
    remove_column :people, :pay_type
    remove_column :people, :work_email_address
    remove_column :people, :work_phone_number
    remove_column :people, :work_fax_number
    remove_column :people, :work_mobile_number
    remove_column :people, :work_extension
    remove_column :people, :work_address
    remove_column :people, :work_city
    remove_column :people, :work_state
    remove_column :people, :work_zip
    remove_column :people, :work_country
  end

  def self.down
    add_column :people, :first_name, :string
    add_column :people, :middle_name, :string
    add_column :people, :last_name, :string
    add_column :people, :title, :string
    add_column :people, :gender, :string
    add_column :people, :department, :string
    add_column :people, :job_title, :string
    add_column :people, :hire_date, :date
    add_column :people, :hire_date_vacation_adjustment, :date
    add_column :people, :departure_date, :date
    add_column :people, :birthday, :date
    add_column :people, :pay_type, :string
    add_column :people, :work_email_address, :string
    add_column :people, :work_phone_number, :string
    add_column :people, :work_fax_number, :string
    add_column :people, :work_mobile_number, :string
    add_column :people, :work_extension, :string
    add_column :people, :work_address, :string
    add_column :people, :work_city, :string
    add_column :people, :work_state, :string
    add_column :people, :work_zip, :string
    add_column :people, :work_country, :string

    Person.reset_column_information

    HrProfile.all.each do |hr_profile|
        hr_profile.person.update_attributes!(hr_profile.attributes)
    end

    drop_table :hr_profiles

  end
end
