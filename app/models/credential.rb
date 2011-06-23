# == Schema Information
#
# Table name: credentials
#
#  id                     :integer(4)      not null, primary key
#  encrypted_password     :string(128)     default(""), not null
#  reset_password_token   :string(255)
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer(4)      default(0)
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :string(255)
#  last_sign_in_ip        :string(255)
#  password_salt          :string(255)
#  created_at             :datetime
#  updated_at             :datetime
#  username               :string(255)
#  person_id              :integer(4)
#  password_changed_at    :datetime
#
# Indexes
#
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#

class Credential < ActiveRecord::Base
  attr_accessor :login

  # Devise
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise  :database_authenticatable, 
          # :registerable,
          :recoverable,
          # :rememberable,
          :trackable, 
          # :validatable,
          :encryptable,
          :password_expirable,
          :password_archivable

  # Associations
  belongs_to :person

  delegate :email_address, :groups, :group_names, :to => :person, :allow_nil => true

  # Setup accessible (or protected) attributes for your model
  attr_accessible :username,
                  :password,
                  :login,
                  :password_confirmation,
                  :remember_me

  validates   :username,  :presence   => true,
                          :uniqueness => { :case_sensitive => true, :allow_blank => false }

  validates   :password,  :presence     => true,
                          :confirmation => true,
                          :length       => { :within => 8..50, :allow_blank => false },
                          :format       => /^.*(?=.{8,})(?=\w*\d)(?=\w*[a-z])(?=\w*[A-Z])\w*$/

  validates   :person_id, :presence => true

  def decrypted_password
    ::Devise::Encryptors::Aes256.decrypt(encrypted_password, Devise.pepper)
  end

  def email
    self.email_address
  end

protected
  def self.find_for_database_authentication(warden_conditions)
    conditions = warden_conditions.dup
    login      = conditions.delete(:login)
    where(conditions).includes(:person => [:work_profile]).where(["lower(credentials.username) = :value OR lower(work_profiles.email_address) = :value", { :value => login.downcase }]).first
  end

   # Attempt to find a user by it's email. If a record is found, send new
   # password instructions to it. If not user is found, returns a new user
   # with an email not found error.
   def self.send_reset_password_instructions(attributes={})
     recoverable = find_recoverable_or_initialize_with_errors(reset_password_keys, attributes, :not_found)
     recoverable.send_reset_password_instructions if recoverable.persisted?
     recoverable
   end

   def self.find_recoverable_or_initialize_with_errors(required_attributes, attributes, error=:invalid)
     (case_insensitive_keys || []).each { |k| attributes[k].try(:downcase!) }

     attributes = attributes.slice(*required_attributes)
     attributes.delete_if { |key, value| value.blank? }

     if attributes.size == required_attributes.size
       if attributes.has_key?(:login)
         login = attributes.delete(:login)
         record = find_record(login)
       else
         record = where(attributes).first
       end
     end

     unless record
       record = new

       required_attributes.each do |key|
         value = attributes[key]
         record.send("#{key}=", value)
         record.errors.add(key, value.present? ? error : :blank)
       end
     end
     record
  end

  def self.find_record(login)
    includes(:person => [:work_profile]).where(["lower(credentials.username) = :value OR lower(work_profiles.email_address) = :value", { :value => login.downcase }]).first
  end
end
