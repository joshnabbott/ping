class HomeController < AuthenticatedController

  def index
    authorize! :view, :home
  end

end
