class CreateItProfiles < ActiveRecord::Migration
  def self.up

    create_table :it_profiles do |t|
      t.integer :person_id
      t.string :default_username
      t.string :status
      t.string :type
      t.boolean :email_account_active
      t.string :chat_aim
      t.string :chat_skype
      t.string :chat_gtalk
      t.timestamps
    end

    ItProfile.reset_column_information

    Person.all.each do |person|
        person.create_it_profile(person.attributes.slice(*ItProfile.column_names))
    end

    remove_column :people, :default_username
    remove_column :people, :status
    remove_column :people, :type
    remove_column :people, :email_account_active
    remove_column :people, :chat_aim
    remove_column :people, :chat_skype
    remove_column :people, :chat_gtalk
  end

  def self.down
    add_column :people, :default_username, :string
    add_column :people, :status, :string
    add_column :people, :type, :string
    add_column :people, :email_account_active, :boolean
    add_column :people, :chat_aim, :string
    add_column :people, :chat_skype, :string
    add_column :people, :chat_gtalk, :string

    Person.reset_column_information

    ItProfile.all.each do |it_profile|
        it_profile.person.update_attributes!(it_profile.attributes)
    end
    
    drop_table :it_profiles
  end
end
