# == Schema Information
#
# Table name: hr_profiles
#
#  id                            :integer(4)      not null, primary key
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
#  person_id                     :integer(4)
#  created_at                    :datetime
#  updated_at                    :datetime
#  status                        :string(255)
#  employment_type               :string(255)
#  manager_id                    :integer(4)
#  replacing_id                  :integer(4)
#  salary_annual                 :integer(10)
#  salary_per_period             :integer(10)
#  flsa                          :string(255)
#  vacation                      :string(255)
#  vacation_effective_date       :date
#  last_day_worked               :date
#  separation_pay                :integer(10)
#  termination_date              :date
#  vacation_payout               :string(255)
#  reason_for_release            :text
#  bonus_justification           :text
#  bonus_amount                  :integer(10)
#  fml_loa                       :string(255)
#

require 'test_helper'

class HrProfileTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
end
