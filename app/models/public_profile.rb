# == Schema Information
#
# Table name: public_profiles
#
#  id                     :integer(4)      not null, primary key
#  person_id              :integer(4)
#  nick_name              :string(255)
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
#

class PublicProfile < ActiveRecord::Base

  belongs_to :person

#  validates :person_id,         :presence => true
  validates :home_country,      :inclusion => { :in => Person::COUNTRIES }
  
end