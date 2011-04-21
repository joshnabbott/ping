class Person
  
  GENDERS     = [ 'male', 'female' ]
  PAY_TYPES   = [ 'hourly', 'salaried' ]
  DEPARTMENTS = [ 'AS', 'CS', 'IS', 'MS', 'OPS' ]
  COUNTRIES   = [ 'USA' ]
  
  def self.genders_for_select
    GENDERS.map { |c| [ c.titleize, c ]}
  end
  
  def self.pay_types_for_select
    PAY_TYPES.map { |c| [ c.titleize, c ]}
  end  
  
  include MongoMapper::Document
  
  # HR
  key :first_name,                    String, :required => true
  key :middle_name,                   String
  key :last_name,                     String, :required => true
  key :title,                         String
  key :gender,                        String, :required => true
  key :department,                    String, :required => true
  key :job_title,                     String, :required => true
  key :hire_date,                     Date
  key :hire_date_vacation_adjustment, Date
  key :departure_date,                Date
  key :pay_type,                      String
  key :birthday,                      Date
  key :work_email_address,            String
  key :work_phone_number,             String
  key :work_fax_number,               String
  key :work_mobile_number,            String
  key :work_extension,                String
  key :work_address,                  String
  key :work_city,                     String
  key :work_state,                    String
  key :work_zip,                      String
  key :work_country,                  String

  # General
  key :bio,                           String
  key :nick_name,                     String
  key :personal_email_address,        String
  key :home_phone_number,             String
  key :home_fax_number,               String
  key :home_mobile_number,            String
  key :home_address,                  String
  key :home_city,                     String
  key :home_state,                    String
  key :home_zip,                      String
  key :home_country,                  String
  key :emergency_contact_name,        String
  key :emergency_contact_number,      String
  key :emergency_contact_relation,    String
  key :employee_photo,                String
  
  # Facilities
  key :seating_floor,                 String
  key :seating_number,                String
  key :building_card,                 String
  key :garage_card,                   String
  key :fed_ex_account,                String

  # IT
  key :default_username,              String, :required => true
  key :chat_gtalk,                    String
  key :chat_aim,                      String
  key :chat_skype,                    String
  key :email_account_active,          Boolean
  key :status,                        String
  key :type,                          String
  
  timestamps!
  
  # Associations
  one   :credential
  key   :group_ids,   Array,          :typecast => 'ObjectId'
  many  :groups,      :in => :group_ids
  
  before_save :compact_group_ids
  
  # Setup accessible (or protected) attributes for your model
  # attr_accessible :username, :password, :password_confirmation, :remember_me
  
  validates :default_username,  :presence => true,
                                :length => {:minimum => 3}
  validates :first_name,        :presence => true
  
  validates :gender,        :inclusion => { :in => GENDERS }
  validates :department,    :inclusion => { :in => DEPARTMENTS }
  validates :pay_type,      :inclusion => { :in => PAY_TYPES }
  validates :work_country,  :inclusion => { :in => COUNTRIES }
  validates :home_country,  :inclusion => { :in => COUNTRIES }

  def as_json(options={})
    super(:only => [:first_name, :last_name, :job_title, :work_email_address, :work_phone_number, :id],
      :include => {
        :group => {:only => [:name, :id]}
      }
    )
  end
  
  private
  
  def compact_group_ids
    self.group_ids = self.group_ids.compact
  end

end
