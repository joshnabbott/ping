# == Schema Information
#
# Table name: groups
#
#  id         :integer(4)      not null, primary key
#  name       :string(255)
#  person_id  :integer(4)
#  created_at :datetime
#  updated_at :datetime
#

require 'test_helper'

class GroupTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
end
