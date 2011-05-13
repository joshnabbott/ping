module ApplicationHelper
  def boolean_to_human(boolean)
    boolean ? 'yes' : 'no'
  end

  def my_profile_path
    person_path(current_credential.person)
  end

  def nav_item(name, url, options={})
    current_section = options[:current_section] || controller.controller_name
    css_class = current_section == options[:section] ? "current" : "non_current"
    link_to name, url, :class => "#{css_class} #{options[:class]}"
  end

  def pronoun_for_person(person)
    if current_credential && current_credential.person == person
      'my'
    else
      "#{person.first_or_nickname}'s"
    end
  end

  def pronoun_for_person_with_full_name(person)
    if current_credential && current_credential.person == person
      'my'
    else
      "#{person.full_name}'s"
    end
  end


  def session_bug
    if logged_in?
      content_tag(:p, "Signed in as <em>#{current_credential.username}</em> | #{link_to('Sign Out', destroy_credential_session_path)}".html_safe, :class => "user_info")
    else
      content_tag(:p, link_to('Sign In', new_credential_session_path).html_safe, :class => "user_info")
    end
  end

  def site_title
    'FDL :: Ping'
  end

  def value_with_placeholder(value, placeholder = 'None')
    value.present? ? value : placeholder
  end
end
