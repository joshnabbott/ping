class ApplicationController < ActionController::Base
  
  protect_from_forgery
  
  protected

  alias_method :current_user, :current_credential

  helper_method :logged_in?
  helper_method :pronoun_or_first_name
  
  def logged_in?
    !!current_credential
  end

  def pronoun_or_first_name(person)
    person == current_credential.person ? 'Your' : "#{person.first_or_nickname}'s"
  end
  
end
