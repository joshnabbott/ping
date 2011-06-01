# == Schema Information
#
# Table name: people
#
#  id             :integer(4)      not null, primary key
#  created_at     :datetime
#  updated_at     :datetime
#  employee_photo :string(255)
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
  has_one                 :work_profile,        :dependent => :destroy

  has_and_belongs_to_many :groups

  # Setup accessible (or protected) attributes for your model
  # attr_accessible :username, :password, :password_confirmation, :remember_me

  validates_associated :hr_profile
  validates_associated :it_profile
  validates_associated :facilities_profile
  validates_associated :public_profile
  validates_associated :emergency_profile
  validates_associated :work_profile

  accepts_nested_attributes_for :hr_profile
  accepts_nested_attributes_for :it_profile
  accepts_nested_attributes_for :facilities_profile
  accepts_nested_attributes_for :public_profile
  accepts_nested_attributes_for :emergency_profile
  accepts_nested_attributes_for :work_profile

  after_initialize do
    self.build_hr_profile         unless self.hr_profile
    self.build_it_profile         unless self.it_profile
    self.build_facilities_profile unless self.facilities_profile
    self.build_public_profile     unless self.public_profile
    self.build_emergency_profile  unless self.emergency_profile
    self.build_work_profile  unless self.work_profile
  end

  delegate :first_name,         :to => :hr_profile,         :allow_nil => true
  delegate :last_name,          :to => :hr_profile,         :allow_nil => true
  delegate :gender,             :to => :hr_profile,         :allow_nil => true
  delegate :title,              :to => :hr_profile,         :allow_nil => true
  delegate :job_title,          :to => :hr_profile,         :allow_nil => true
  delegate :department,         :to => :hr_profile,         :allow_nil => true
  delegate :email_address,      :to => :it_profile,         :allow_nil => true
  delegate :work_phone_number,  :to => :work_profile,       :allow_nil => true
  delegate :birthday,           :to => :hr_profile,         :allow_nil => true
  delegate :default_username,   :to => :it_profile,         :allow_nil => true
  delegate :bio,                :to => :public_profile,     :allow_nil => true
  delegate :nickname,           :to => :public_profile,     :allow_nil => true
  delegate :seating_floor,      :to => :facilities_profile, :allow_nil => true
  delegate :seating_number,     :to => :facilities_profile, :allow_nil => true

  define_index do
    indexes hr_profile.first_name, :sortable => true
    indexes hr_profile.middle_name, :sortable => true
    indexes hr_profile.last_name, :sortable => true
    indexes hr_profile.job_title, :sortable => true
    indexes it_profile.default_username, :sortable => true
    indexes public_profile.nickname, :sortable => true
    indexes public_profile.bio
    indexes public_profile.personal_email_address, :sortable => true
    indexes facilities_profile.seating_floor, :sortable => true
    indexes facilities_profile.seating_number, :sortable => true
    has '1', :as => :is_active, :type => :boolean
  end

  def as_json( options = {} )
    super(  :methods => [ :first_name,
                          :last_name,
                          :job_title,
                          :email_address,
                          :work_phone_number,
                          :id ],
            :include => {
              :groups => { :methods => [ :name,
                                         :id ] }
            }
    )
  end

  def group_names
    self.groups.map(&:name)
  end

  def full_name
    [ self.first_or_nickname, self.last_name ] * ' '
  end

  def first_or_nickname
    (self.nickname.present? ? self.nickname : self.first_name)
  end

  def to_vcard
    Vpim::Vcard::Maker.make2 do |maker|

      maker.add_name do |name|
        name.given = self.first_name
        name.family = self.last_name
      end

      # maker.add_addr do |addr|
      #       addr.preferred = true
      #       addr.location = 'work'
      #       addr.street = '243 Felixstowe Road'
      #       addr.locality = 'Ipswich'
      #       addr.country = 'United Kingdom'
      # end

      maker.nickname  = self.nickname if self.nickname.present?
      maker.title     = self.job_title
      maker.org       = "Factory Design Labs"
      maker.birthday  = self.birthday.to_date if self.birthday
      maker.add_tel(self.work_phone_number) if self.work_phone_number.present?
      maker.add_email(self.email_address) { |e| e.location = 'work' }
      
    end

  end

  def avatar?
    self.public_profile.avatar? || self.facilities_profile.avatar?
  end

  def avatar
    if self.public_profile.avatar?
      self.public_profile.avatar
    elsif self.facilities_profile.avatar
      self.facilities_profile.avatar
    else
      nil
    end
  end


end
