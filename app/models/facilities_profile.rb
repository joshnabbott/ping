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

class FacilitiesProfile < ActiveRecord::Base

  belongs_to :person

#  validates :person_id,         :presence => true
  
end
