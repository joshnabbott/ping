# == Schema Information
#
# Table name: credentials
#
#  id                     :integer         not null, primary key
#  encrypted_password     :string(128)     default(""), not null
#  reset_password_token   :string(255)
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer         default(0)
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :string(255)
#  last_sign_in_ip        :string(255)
#  password_salt          :string(255)
#  created_at             :datetime
#  updated_at             :datetime
#  username               :string(255)
#  person_id              :integer
#
# Indexes
#
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#

class Credential < ActiveRecord::Base

  # Devise
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise  :database_authenticatable, 
          # :registerable,
          # :recoverable, 
          :rememberable, 
          :trackable, 
          # :validatable,
          :encryptable
          
  # Associations
  belongs_to :person
          
  # Setup accessible (or protected) attributes for your model
  attr_accessible :username, 
                  :password, 
                  :password_confirmation, 
                  :remember_me

  validates  :username, :presence   => true,
                        :uniqueness => { :case_sensitive => true, :allow_blank => false }

  validates :password,  :presence     => true,
                        :confirmation => true,
                        :length       => { :within => 5..50, :allow_blank => true }
  
  def decrypted_password
    ::Devise::Encryptors::Aes256.decrypt(encrypted_password, Devise.pepper)
  end     

end
