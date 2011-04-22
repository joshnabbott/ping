# == Schema Information
#
# Table name: emergency_profiles
#
#  id                         :integer(4)      not null, primary key
#  person_id                  :integer(4)
#  emergency_contact_name     :string(255)
#  emergency_contact_number   :string(255)
#  emergency_contact_relation :string(255)
#  created_at                 :datetime
#  updated_at                 :datetime
#

class EmergencyProfile < ActiveRecord::Base

  belongs_to :person

#  validates :person_id,         :presence => true

end
