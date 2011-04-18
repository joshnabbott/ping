class ApplicationController < ActionController::Base
  protect_from_forgery
  
  helper_method :current_user

  def admin?
    session[:admin_user]
  end

  helper_method :admin?

  def admin_required
    redirect_to '/auth/admin' unless admin?
  end

  private

  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end
end
