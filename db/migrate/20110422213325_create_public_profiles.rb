class CreatePublicProfiles < ActiveRecord::Migration
  def self.up
    create_table :public_profiles do |t|
      t.integer :person_id
      t.string :nick_name
      t.text :bio
      t.string :personal_email_address
      t.string :home_phone_number
      t.string :home_fax_number
      t.string :home_mobile_number
      t.string :home_address
      t.string :home_city
      t.string :home_state
      t.string :home_zip
      t.string :home_country

      t.timestamps
    end

    PublicProfile.reset_column_information

    Person.all.each do |person|
        person.create_public_profile(person.attributes.slice(*PublicProfile.column_names))
    end

    remove_column :people, :nick_name
    remove_column :people, :bio
    remove_column :people, :personal_email_address
    remove_column :people, :home_phone_number
    remove_column :people, :home_fax_number
    remove_column :people, :home_mobile_number
    remove_column :people, :home_address
    remove_column :people, :home_city
    remove_column :people, :home_state
    remove_column :people, :home_zip
    remove_column :people, :home_country
  end

  def self.down
    add_column :people, :nick_name, :string
    add_column :people, :bio, :string
    add_column :people, :personal_email_address, :string
    add_column :people, :home_phone_number, :string
    add_column :people, :home_fax_number, :string
    add_column :people, :home_mobile_number, :string
    add_column :people, :home_address, :string
    add_column :people, :home_city, :string
    add_column :people, :home_state, :string
    add_column :people, :home_zip, :string
    add_column :people, :home_country, :string

    Person.reset_column_information

    PublicProfile.all.each do |public_profile|
        public_profile.person.update_attributes!(public_profile.attributes)
    end

    drop_table :public_profiles
  end
end
