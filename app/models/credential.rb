class Credential

  include MongoMapper::Document

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
          
  # Keys
  key :username, String

  # Associations
  belongs_to :person
          
  # Setup accessible (or protected) attributes for your model
  attr_accessible :username, 
                  :password, 
                  :password_confirmation, 
                  :remember_me

  validates_presence_of   :username
  validates_uniqueness_of :username, :case_sensitive => true, :allow_blank => false

  validates_presence_of     :password
  validates_confirmation_of :password
  validates_length_of       :password, :within => 5..50, :allow_blank => true
  
  def decrypted_password
    ::Devise::Encryptors::Aes256.decrypt(encrypted_password, Devise.pepper)
  end     

end
