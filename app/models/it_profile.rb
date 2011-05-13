# == Schema Information
#
# Table name: it_profiles
#
#  id                   :integer(4)      not null, primary key
#  person_id            :integer(4)
#  default_username     :string(255)
#  email_account_active :boolean(1)
#  chat_aim             :string(255)
#  chat_skype           :string(255)
#  chat_gtalk           :string(255)
#  created_at           :datetime
#  updated_at           :datetime
#

class ItProfile < ActiveRecord::Base

  belongs_to :person

#  validates :person_id,         :presence => true
  validates :default_username,  :presence => true,
                                :length => {:minimum => 3}

end
