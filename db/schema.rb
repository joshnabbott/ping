# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20110621204133) do

  create_table "assets", :force => true do |t|
    t.integer  "employee_id"
    t.integer  "transfer_employee_id"
    t.string   "asset_number"
    t.string   "kind"
    t.string   "serial_number"
    t.string   "name"
    t.string   "model"
    t.string   "manufacturer"
    t.date     "warranty_end_date"
    t.string   "warranty_number"
    t.date     "warranty_renewal_date"
    t.string   "status"
    t.string   "location"
    t.text     "notes"
    t.date     "purchase_date"
    t.string   "purchase_type"
    t.string   "po_number"
    t.string   "transfer_type"
    t.date     "transfer_date"
    t.decimal  "sale_price",                                       :precision => 8, :scale => 2, :default => 0.0
    t.string   "payment_type"
    t.text     "transfer_notes"
    t.text     "casper_serialized_data",     :limit => 2147483647
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "casper_id"
    t.string   "processor_speed"
    t.string   "processor_type"
    t.string   "total_ram"
    t.string   "mac_address_one"
    t.string   "mac_address_two"
    t.string   "operating_system_version"
    t.string   "battery_health"
    t.string   "uptime"
    t.string   "partition_size"
    t.string   "partition_name"
    t.string   "partition_percentage_used"
    t.string   "carrier_info"
    t.string   "phone_number"
    t.string   "size"
    t.string   "hardrive"
    t.string   "software_serial_number_one"
    t.string   "software_serial_number_two"
    t.string   "organization_name"
    t.string   "registration_name"
    t.string   "license_quantity"
    t.string   "license_type"
    t.text     "license_notes"
    t.date     "license_renewal_date"
    t.string   "casper_url"
    t.text     "tracking_notes"
  end

  create_table "credentials", :force => true do |t|
    t.string   "encrypted_password",     :limit => 128, :default => "", :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                         :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "password_salt"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "username"
    t.integer  "person_id"
    t.datetime "password_changed_at"
  end

  add_index "credentials", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

  create_table "emergency_profiles", :force => true do |t|
    t.integer  "person_id"
    t.string   "name"
    t.string   "phone_number"
    t.string   "relation"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "facilities_profiles", :force => true do |t|
    t.integer  "person_id"
    t.string   "seating_floor"
    t.string   "seating_number"
    t.string   "building_card"
    t.string   "garage_card"
    t.string   "fed_ex_account"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "avatar"
  end

  create_table "groups", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "groups_people", :id => false, :force => true do |t|
    t.integer "group_id"
    t.integer "person_id"
  end

  create_table "hr_profiles", :force => true do |t|
    t.string   "first_name"
    t.string   "middle_name"
    t.string   "last_name"
    t.string   "title"
    t.string   "gender"
    t.string   "department"
    t.string   "job_title"
    t.date     "hire_date"
    t.date     "hire_date_vacation_adjustment"
    t.date     "departure_date"
    t.date     "birthday"
    t.string   "pay_type"
    t.integer  "person_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "employment_type"
    t.integer  "manager_id"
    t.integer  "replacing_id"
    t.decimal  "salary_annual",                 :precision => 10, :scale => 0
    t.decimal  "salary_per_period",             :precision => 10, :scale => 0
    t.string   "flsa"
    t.string   "vacation"
    t.date     "vacation_effective_date"
    t.date     "last_day_worked"
    t.decimal  "separation_pay",                :precision => 10, :scale => 0
    t.date     "termination_date"
    t.string   "vacation_payout"
    t.text     "reason_for_release"
    t.text     "bonus_justification"
    t.decimal  "bonus_amount",                  :precision => 10, :scale => 0
    t.string   "fml_loa"
    t.boolean  "is_active",                                                    :default => true
  end

  create_table "it_profiles", :force => true do |t|
    t.integer  "person_id"
    t.string   "default_username"
    t.string   "chat_gtalk"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "old_passwords", :force => true do |t|
    t.string   "encrypted_password",       :limit => 128, :null => false
    t.string   "password_salt",                           :null => false
    t.integer  "password_archivable_id",                  :null => false
    t.string   "password_archivable_type",                :null => false
    t.datetime "created_at"
  end

  add_index "old_passwords", ["password_archivable_type", "password_archivable_id"], :name => "index_password_archivable"

  create_table "people", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "employee_photo"
  end

  create_table "people_groups", :id => false, :force => true do |t|
    t.integer "person_id"
    t.integer "group_id"
  end

  create_table "public_profiles", :force => true do |t|
    t.integer  "person_id"
    t.string   "nickname"
    t.text     "bio"
    t.string   "personal_email_address"
    t.string   "home_phone_number"
    t.string   "home_fax_number"
    t.string   "home_mobile_number"
    t.string   "home_address"
    t.string   "home_city"
    t.string   "home_state"
    t.string   "home_zip"
    t.string   "home_country"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "chat_aim"
    t.string   "chat_skype"
    t.string   "username_twitter"
    t.string   "username_linkedin"
    t.string   "username_facebook"
    t.string   "username_flickr"
    t.string   "username_instagram"
    t.string   "website_url"
    t.string   "avatar"
  end

  create_table "services", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "work_profiles", :force => true do |t|
    t.string   "work_phone_number"
    t.string   "work_fax_number"
    t.string   "work_extension"
    t.string   "work_address"
    t.string   "work_city"
    t.string   "work_state"
    t.string   "work_zip"
    t.string   "work_country"
    t.integer  "person_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "email_address"
    t.boolean  "email_account_active", :default => false
  end

end
