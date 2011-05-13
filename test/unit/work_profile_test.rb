# == Schema Information
#
# Table name: work_profiles
#
#  id                 :integer(4)      not null, primary key
#  work_phone_number  :string(255)
#  work_fax_number    :string(255)
#  work_mobile_number :string(255)
#  work_extension     :string(255)
#  work_address       :string(255)
#  work_city          :string(255)
#  work_state         :string(255)
#  work_zip           :string(255)
#  work_country       :string(255)
#  person_id          :integer(4)
#  created_at         :datetime
#  updated_at         :datetime
#

require 'test_helper'

class WorkProfileTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
end
