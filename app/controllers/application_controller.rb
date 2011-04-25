class ApplicationController < ActionController::Base
  
  protect_from_forgery
  
  protected

  alias_method :current_user, :current_credential

  helper_method :logged_in?
  
  def logged_in?
    !!current_credential
  end
  
end
