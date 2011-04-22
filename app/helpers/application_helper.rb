module ApplicationHelper
  def session_bug
    if logged_in?
      content_tag(:p, "Signed in as <em>#{current_credential.username}</em> | #{link_to('Sign Out', destroy_credential_session_path)}".html_safe, :class => "user_info")
    end
  end

  def nav_item(name, url, options={})
    current_section = options[:current_section] || controller.controller_name
    css_class = current_section == options[:section] ? "current" : "non_current"
    link_to name, url, :class => "#{css_class} #{options[:class]}"
  end

  def flash_message_tag(type,message)
    content_tag(:div, content_tag(:div, message, :class => type + ' flash'.html_safe))
  end

  def flash_messages
    messages = ''.html_safe
    %w{ alert notice success warning error }.each do |type|
      if flash[type.to_sym] || flash.now[type.to_sym]
        messages += flash_message_tag(type,flash[type.to_sym] || flash.now[type.to_sym])
      end                               
    end
    messages.blank? ? '' : content_tag(:div, messages.html_safe, :id => 'flash_messages')
  end

  def my_profile_path
   edit_person_path(current_credential.person)
  end
  
end