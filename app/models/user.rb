# == Schema Information
#
# Table name: users
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
#
# Indexes
#
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise  :database_authenticatable, 
          # :registerable,
          :recoverable, 
          :rememberable, 
          # :trackable, 
          # :validatable,
          :encryptable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :username, :password, :password_confirmation, :remember_me
  
  validates_presence_of   :username
  validates_uniqueness_of :username, :case_sensitive => true, :allow_blank => false

  validates_presence_of     :password
  validates_confirmation_of :password
  validates_length_of       :password, :within => 5..50, :allow_blank => true

  has_one :person
    
end
