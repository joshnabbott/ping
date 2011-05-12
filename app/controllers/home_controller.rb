class HomeController < ApplicationController

  def index
    unless logged_in?
      redirect_to people_path
    else
      authorize! :read, :home
    end
  end

end
