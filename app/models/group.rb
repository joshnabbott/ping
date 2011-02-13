class Group < ActiveRecord::Base
	ActiveRecord::Base.include_root_in_json = false
  validates :name,  :presence => true
  has_and_belongs_to_many :person

  def as_json(options={})
  	super(:only => [:name],
  		:include => {
	  		:person => {:only => [:first_name, :last_name, :title, :id]}
  		}
  	)
  end
end
