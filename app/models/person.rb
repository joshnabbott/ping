class Person < ActiveRecord::Base
  validates :username,    :presence => true,
                          :length => {:minimum => 3}
  validates :first_name,  :presence => true
  
  has_and_belongs_to_many :group
end
