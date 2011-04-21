# == Schema Information
#
# Table name: people
#
#  id                            :integer         not null, primary key
#  first_name                    :string(255)
#  title                         :string(255)
#  default_username              :string(255)
#  bio                           :text
#  created_at                    :datetime
#  updated_at                    :datetime
#  last_name                     :string(255)
#  status                        :string(255)
#  type                          :string(255)
#  hire_date                     :date
#  hire_date_vacation_adjustment :date
#  departure_date                :date
#  pay_type                      :string(255)
#  job_title                     :string(255)
#  seating_floor                 :string(255)
#  seating_number                :string(255)
#  gender                        :string(255)
#  middle_name                   :string(255)
#  nick_name                     :string(255)
#  birthday                      :date
#  work_email_address            :string(255)
#  work_phone_number             :string(255)
#  work_fax_number               :string(255)
#  work_mobile_number            :string(255)
#  work_extension                :string(255)
#  work_address                  :string(255)
#  work_city                     :string(255)
#  work_state                    :string(255)
#  work_zip                      :string(255)
#  work_country                  :string(255)
#  personal_email_address        :string(255)
#  home_phone_number             :string(255)
#  home_fax_number               :string(255)
#  home_mobile_number            :string(255)
#  home_address                  :string(255)
#  home_city                     :string(255)
#  home_state                    :string(255)
#  home_zip                      :string(255)
#  home_country                  :string(255)
#  emergency_contact_name        :string(255)
#  emergency_contact_number      :string(255)
#  emergency_contact_relation    :string(255)
#  email_account_active          :boolean
#  employee_photo                :string(255)
#  chat_gtalk                    :string(255)
#  chat_aim                      :string(255)
#  chat_skype                    :string(255)
#  building_card                 :string(255)
#  garage_card                   :string(255)
#  fed_ex_account                :string(255)
#  user_id                       :integer
#  department                    :string(255)
#

require 'test_helper'

class PersonTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
end
