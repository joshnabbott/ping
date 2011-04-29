class HomeController < AuthenticatedController

  def index
    authorize! :read, :home
  end

end
