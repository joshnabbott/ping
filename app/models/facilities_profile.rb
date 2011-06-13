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
#  avatar         :string(255)
#

class FacilitiesProfile < ActiveRecord::Base

  SEATING_NUMBERS = (1..50).to_a.map(&:to_s)
  SEATING_FLOORS  = [ 'Floor 2', 'Floor 3', 'Floor 4' ]

  belongs_to :person

  validates :seating_floor,   :inclusion => SEATING_FLOORS, :allow_blank => true
  validates :seating_number,  :inclusion => SEATING_NUMBERS, :allow_blank => true
#  validates :person_id,         :presence => true

  mount_uploader :avatar, AvatarUploader
  
end
