class Person < ActiveRecord::Base
  belongs_to :user
  has_and_belongs_to_many :group

  validates :username,    :presence => true,
                          :length => {:minimum => 3}
  validates :first_name,  :presence => true

  def as_json(options={})
    super(:only => [:first_name, :last_name, :id],
      :include => {
        :group => {:only => [:name, :id]}
      }
    )
  end

end
