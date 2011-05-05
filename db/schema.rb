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

ActiveRecord::Schema.define(:version => 20110504205443) do

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
    t.string   "work_email_address"
    t.string   "work_phone_number"
    t.string   "work_fax_number"
    t.string   "work_mobile_number"
    t.string   "work_extension"
    t.string   "work_address"
    t.string   "work_city"
    t.string   "work_state"
    t.string   "work_zip"
    t.string   "work_country"
    t.integer  "person_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "it_profiles", :force => true do |t|
    t.integer  "person_id"
    t.string   "default_username"
    t.string   "status"
    t.string   "type"
    t.boolean  "email_account_active"
    t.string   "chat_aim"
    t.string   "chat_skype"
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
  end

end
