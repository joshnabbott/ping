class AddLotsofstuffToPerson < ActiveRecord::Migration
  def self.up
    add_column :people, :status, :string
    add_column :people, :type, :string
    add_column :people, :hire_date, :date
    add_column :people, :hire_date_vacation_adjustment, :date
    add_column :people, :departure_date, :date
    add_column :people, :pay_type, :string
    add_column :people, :job_title, :string
    add_column :people, :seating_floor, :string
    add_column :people, :seating_number, :string
    add_column :people, :gender, :string
    add_column :people, :middle_name, :string
    add_column :people, :nick_name, :string
    add_column :people, :birthday, :date
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
    add_column :people, :personal_email_address, :string
    add_column :people, :home_phone_number, :string
    add_column :people, :home_fax_number, :string
    add_column :people, :home_mobile_number, :string
    add_column :people, :home_address, :string
    add_column :people, :home_city, :string
    add_column :people, :home_state, :string
    add_column :people, :home_zip, :string
    add_column :people, :home_country, :string
    add_column :people, :emergency_contact_name, :string
    add_column :people, :emergency_contact_number, :string
    add_column :people, :emergency_contact_relation, :string
    add_column :people, :email_account_active, :boolean
    add_column :people, :employee_photo, :string
    add_column :people, :chat_gtalk, :string
    add_column :people, :chat_aim, :string
    add_column :people, :chat_skype, :string
    add_column :people, :building_card_id, :string
    add_column :people, :garage_card_id, :string
    add_column :people, :fed_ex_account, :string
  end

  def self.down
    remove_column :people, :pay_type
    remove_column :people, :departure_date
    remove_column :people, :hire_date_vacation_adjustment
    remove_column :people, :hire_date
    remove_column :people, :type
    remove_column :people, :status
    remove_column :people, :job_title, :string
    remove_column :people, :seating_floor, :string
    remove_column :people, :seating_number, :string
    remove_column :people, :gender, :string
    remove_column :people, :middle_name, :string
    remove_column :people, :nick_name, :string
    remove_column :people, :birthday, :date
    remove_column :people, :work_email_address, :string
    remove_column :people, :work_phone_number, :string
    remove_column :people, :work_fax_number, :string
    remove_column :people, :work_mobile_number, :string
    remove_column :people, :work_extension, :string
    remove_column :people, :work_address, :string
    remove_column :people, :work_city, :string
    remove_column :people, :work_state, :string
    remove_column :people, :work_zip, :string
    remove_column :people, :work_country, :string
    remove_column :people, :personal_email_address, :string
    remove_column :people, :home_phone_number, :string
    remove_column :people, :home_fax_number, :string
    remove_column :people, :home_mobile_number, :string
    remove_column :people, :home_address, :string
    remove_column :people, :home_city, :string
    remove_column :people, :home_state, :string
    remove_column :people, :home_zip, :string
    remove_column :people, :home_country, :string
    remove_column :people, :emergency_contact_name, :string
    remove_column :people, :emergency_contact_number, :string
    remove_column :people, :emergency_contact_relation, :string
    remove_column :people, :email_account_active, :boolean
    remove_column :people, :employee_photo, :string
    remove_column :people, :chat_gtalk, :string
    remove_column :people, :chat_aim, :string
    remove_column :people, :chat_skype, :string
    remove_column :people, :building_card_id, :string
    remove_column :people, :garage_card_id, :string
    remove_column :people, :fed_ex_account, :string
  end
end
