# == Schema Information
#
# Table name: people
#
#  id             :integer         not null, primary key
#  created_at     :datetime
#  updated_at     :datetime
#  employee_photo :string(255)
#  user_id        :integer
#

class Person < ActiveRecord::Base

  COUNTRIES   = [ 'USA' ]

  # Associations
  has_one                 :credential,          :dependent => :destroy
  has_one                 :hr_profile,          :dependent => :destroy
  has_one                 :it_profile,          :dependent => :destroy
  has_one                 :facilities_profile,  :dependent => :destroy
  has_one                 :public_profile,      :dependent => :destroy
  has_one                 :emergency_profile,   :dependent => :destroy

  has_and_belongs_to_many :groups

  # Setup accessible (or protected) attributes for your model
  # attr_accessible :username, :password, :password_confirmation, :remember_me

  validates_associated :hr_profile
  validates_associated :it_profile
  validates_associated :facilities_profile
  validates_associated :public_profile
  validates_associated :emergency_profile

  accepts_nested_attributes_for :hr_profile
  accepts_nested_attributes_for :it_profile
  accepts_nested_attributes_for :facilities_profile
  accepts_nested_attributes_for :public_profile
  accepts_nested_attributes_for :emergency_profile

  after_initialize do
    self.build_hr_profile         unless self.hr_profile
    self.build_it_profile         unless self.it_profile
    self.build_facilities_profile unless self.facilities_profile
    self.build_public_profile     unless self.public_profile
    self.build_emergency_profile  unless self.emergency_profile
  end

  delegate :first_name,       :to => :hr_profile,     :allow_nil => true
  delegate :last_name,        :to => :hr_profile,     :allow_nil => true
  delegate :title,            :to => :hr_profile,     :allow_nil => true
  delegate :default_username, :to => :it_profile,     :allow_nil => true
  delegate :bio,              :to => :public_profile, :allow_nil => true

  def as_json(options={})
    super(:only => [:first_name, :last_name, :job_title, :work_email_address, :work_phone_number, :id],
      :include => {
        :group => {:only => [:name, :id]}
      }
    )
  end

  def group_names
    self.groups.map(&:name)
  end

end
