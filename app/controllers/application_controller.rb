class ApplicationController < ActionController::Base
  protect_from_forgery
  
  check_authorization :unless => :devise_controller?

  rescue_from CanCan::AccessDenied do |exception|
    flash[:error] = exception.message
    redirect_to root_path
  end

  protected

  alias_method :current_user, :current_credential
  
end
