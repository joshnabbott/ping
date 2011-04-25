# == Schema Information
#
# Table name: groups
#
#  id         :integer(4)      not null, primary key
#  name       :string(255)
#  created_at :datetime
#  updated_at :datetime
#

class Group < ActiveRecord::Base
  
  validates :name,  :presence   => true,
                    :uniqueness => true
  
  has_and_belongs_to_many :people

  ActiveRecord::Base.include_root_in_json = false

  def as_json(options = {})
  	super(  :only => [ :name ],
            :include => {
	  		      :people => { :methods => [ :first_name,
                                         :last_name,
                                        :job_title,
                                        :work_email_address,
                                        :work_phone_number,
                                        :id ] }
  		      })
  end
end
