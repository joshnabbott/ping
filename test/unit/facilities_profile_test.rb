# == Schema Information
#
# Table name: facilities_profiles
#
#  id             :integer(4)      not null, primary key
#  person_id      :integer(4)
#  seating_floor  :string(255)
#  seating_number :string(255)
#  building_card  :string(255)
#  garage_card    :string(255)
#  fed_ex_account :string(255)
#  created_at     :datetime
#  updated_at     :datetime
#

require 'test_helper'

class FacilitiesProfileTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
end
