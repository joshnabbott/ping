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
    self.build_credential         unless self.credential
    self.build_hr_profile         unless self.hr_profile
    self.build_it_profile         unless self.it_profile
    self.build_facilities_profile unless self.facilities_profile
    self.build_public_profile     unless self.public_profile
    self.build_emergency_profile  unless self.emergency_profile
    self.build_work_profile       unless self.work_profile
  end

  delegate :first_name,             :to => :hr_profile,         :allow_nil => true
  delegate :last_name,              :to => :hr_profile,         :allow_nil => true
  delegate :gender,                 :to => :hr_profile,         :allow_nil => true
  delegate :title,                  :to => :hr_profile,         :allow_nil => true
  delegate :job_title,              :to => :hr_profile,         :allow_nil => true
  delegate :department,             :to => :hr_profile,         :allow_nil => true
  delegate :is_active,              :to => :hr_profile,         :allow_nil => true
  delegate :email_address,          :to => :work_profile,       :allow_nil => true
  delegate :email_account_active,   :to => :work_profile,       :allow_nil => true
  delegate :work_phone_number,      :to => :work_profile,       :allow_nil => true
  delegate :work_extension,         :to => :work_profile,       :allow_nil => true
  delegate :work_mobile_number,     :to => :work_profile,       :allow_nil => true
  delegate :birthday,               :to => :hr_profile,         :allow_nil => true
  delegate :default_username,       :to => :it_profile,         :allow_nil => true
  delegate :seating_floor,          :to => :facilities_profile, :allow_nil => true
  delegate :seating_number,         :to => :facilities_profile, :allow_nil => true
  delegate :bio,                    :to => :public_profile,     :allow_nil => true
  delegate :nickname,               :to => :public_profile,     :allow_nil => true
  delegate :home_phone_number,      :to => :public_profile,     :allow_nil => true
  delegate :home_mobile_number,     :to => :public_profile,     :allow_nil => true
  delegate :chat_aim,               :to => :public_profile,     :allow_nil => true
  delegate :chat_skype,             :to => :public_profile,     :allow_nil => true
  delegate :home_address,           :to => :public_profile,     :allow_nil => true
  delegate :home_city,              :to => :public_profile,     :allow_nil => true
  delegate :home_state,             :to => :public_profile,     :allow_nil => true
  delegate :home_country,           :to => :public_profile,     :allow_nil => true
  delegate :personal_email_address, :to => :public_profile,     :allow_nil => true

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
    has     hr_profile.is_active, :as => :is_active, :type => :boolean
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

  def full_name_with_nickname
    if self.nickname.present?
      [self.nickname, "(#{self.first_name})", self.last_name] * ' '
    else
      self.full_name_without_nickname
    end
  end
  alias_method_chain :full_name, :nickname

  def first_or_nickname
    (self.nickname.present? ? self.nickname : self.first_name)
  end

  def to_vcard
    Vpim::Vcard::Maker.make2 do |maker|
      maker.name do |name|
        name.prefix = self.title if self.title.present?
        name.family = self.last_name if self.last_name.present?
        name.given  = self.first_name if self.first_name.present?
      end

      maker.nickname = self.nickname if self.nickname.present?

      # This isn't working!
      # if self.avatar? && File.exists?(self.avatar.path)
      #   maker.add_photo do |photo|
      #     photo.image = File.open(self.avatar.path) { |file| file.read }
      #     photo.type  = MIME::Types.type_for(self.avatar.path).to_s
      #   end
      # end

      maker.title = self.job_title if self.job_title.present?

      maker.gender = self.gender if self.gender.present?

      maker.org = "Factory Design Labs;#{self.department}"

      maker.add_email(self.email_address) do |email|
        email.location  = 'work'
        email.preferred = true
      end if self.email_address.present?

      maker.add_tel("#{self.work_phone_number} (x#{self.work_extension})") do |phone|
        phone.location  = 'work'
        phone.preferred = true
      end if self.work_phone_number.present?

      maker.add_email(self.personal_email_address) { |email| email.location = 'home' } if self.personal_email_address.present?

      maker.aim   = self.chat_aim if self.chat_aim.present?
      maker.skype = self.chat_skype if self.chat_skype.present?
      maker.gtalk = self.email_address if self.email_address.present?

      maker.add_addr do |addr|
        addr.preferred = true
        addr.location  = 'work'
        addr.street    = '158 Filmore St'
        addr.locality  = 'Denver, CO'
        addr.country   = 'USA'
      end

      maker.add_addr do |addr|
        addr.preferred = false
        addr.location  = 'home'
        addr.street    = self.home_address if self.home_address
        addr.locality  = [self.home_city, self.home_state].join(', ') if self.home_city || self.home_state
        addr.country   = self.home_country if self.home_country
      end

      maker.add_tel(self.home_phone_number) { |phone| phone.location = 'home' } if self.home_phone_number.present?

      maker.add_tel(self.home_mobile_number) { |phone| phone.location = 'cell' } if self.home_mobile_number.present?
    end
  end

  def avatar?
    self.public_profile.avatar? || self.facilities_profile.avatar?
  end

  def avatar
    self.public_profile.avatar.presence || self.facilities_profile.avatar
  end
end
