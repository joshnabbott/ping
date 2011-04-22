# == Schema Information
#
# Table name: it_profiles
#
#  id                   :integer         not null, primary key
#  person_id            :integer
#  default_username     :string(255)
#  status               :string(255)
#  type                 :string(255)
#  email_account_active :boolean
#  chat_aim             :string(255)
#  chat_skype           :string(255)
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
