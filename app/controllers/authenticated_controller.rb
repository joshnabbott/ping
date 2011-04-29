class AuthenticatedController < ApplicationController

  before_filter :authenticate_credential!
  check_authorization :unless => :devise_controller?

  rescue_from CanCan::AccessDenied do |exception|
    flash[:error] = exception.message
    Rails.logger.debug "Access denied on #{exception.action} #{exception.subject.inspect}"
    redirect_to root_path
  end

end