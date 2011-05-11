class HomeController < ApplicationController

  def index
    unless logged_in?
      redirect_to search_people_path
    else
      authorize! :read, :home
    end
  end

end
