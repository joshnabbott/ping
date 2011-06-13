class ApplicationController < ActionController::Base

  Formtastic::SemanticFormHelper.builder = Protosite::FormBuilder

  protect_from_forgery
  
  protected

  helper_method :logged_in?
  helper_method :pronoun_or_first_name

  helper FlashHelper
  
  def logged_in?
    !!current_credential
  end

  def current_user
    current_credential
  end

  def pronoun_or_first_name(person)
    person == current_credential.person ? 'Your' : "#{person.first_or_nickname}'s"
  end

protected
  def after_sign_in_path_for(resource)
    people_path
  end
end
