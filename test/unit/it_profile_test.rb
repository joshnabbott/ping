# == Schema Information
#
# Table name: it_profiles
#
#  id                   :integer(4)      not null, primary key
#  person_id            :integer(4)
#  default_username     :string(255)
#  email_account_active :boolean(1)
#  chat_gtalk           :string(255)
#  created_at           :datetime
#  updated_at           :datetime
#

require 'test_helper'

class ItProfileTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
end
