module FlashHelper

  FLASH_MESSAGES_TYPES = %w{ notice success alert error }

  def flash_messages(keep_visible = false)
    messages = FLASH_MESSAGES_TYPES.inject('') do |memo, type|
      memo + messages_for_type(type)
    end

    if messages.present?
      klass = "flash-messages#{keep_visible ? ' keep-visible' : ''}"
      content_tag(:div, messages.html_safe, :class => klass, :id => 'flash_messages')
    end
  end

  private

  def messages_for_type(type)
    message = flash[type.to_sym] || flash.now[type.to_sym]
    return '' if message.blank?

    message_div = content_tag(:div, message, :class => 'message-content')

    content_tag(:div, message_div, :class => "#{type} message")
  end

end
