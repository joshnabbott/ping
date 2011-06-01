# == Schema Information
#
# Table name: public_profiles
#
#  id                     :integer(4)      not null, primary key
#  person_id              :integer(4)
#  nickname               :string(255)
#  bio                    :text
#  personal_email_address :string(255)
#  home_phone_number      :string(255)
#  home_fax_number        :string(255)
#  home_mobile_number     :string(255)
#  home_address           :string(255)
#  home_city              :string(255)
#  home_state             :string(255)
#  home_zip               :string(255)
#  home_country           :string(255)
#  created_at             :datetime
#  updated_at             :datetime
#  chat_aim               :string(255)
#  chat_skype             :string(255)
#  twitter_url            :string(255)
#  linkedin_url           :string(255)
#  facebook_url           :string(255)
#  flickr_url             :string(255)
#  instagram_url          :string(255)
#  website_url            :string(255)
#  avatar                 :string(255)
#

require 'test_helper'

class PublicProfileTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
end
