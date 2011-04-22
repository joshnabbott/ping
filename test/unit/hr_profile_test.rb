# == Schema Information
#
# Table name: hr_profiles
#
#  id                            :integer         not null, primary key
#  first_name                    :string(255)
#  middle_name                   :string(255)
#  last_name                     :string(255)
#  title                         :string(255)
#  gender                        :string(255)
#  department                    :string(255)
#  job_title                     :string(255)
#  hire_date                     :date
#  hire_date_vacation_adjustment :date
#  departure_date                :date
#  birthday                      :date
#  pay_type                      :string(255)
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
#  person_id                     :integer
#  created_at                    :datetime
#  updated_at                    :datetime
#

require 'test_helper'

class HrProfileTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
end
