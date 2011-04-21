class HomeController < ApplicationController
  def index
    authorize! :view, :home
  end

end
