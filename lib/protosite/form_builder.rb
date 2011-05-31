class ActiveRecord::Base
  # When using the :twelve_hour format for date selectors, we need to convert
  # the time from the form back to 24 hour so we can store it appropriately.
  def instantiate_time_object(name, values)
    if values.last < 0
      hour_idx = Protosite::SemanticFormHelper::DateTimeSelector::POSITION[:hour] - 1
      ampm = values.pop
      if ampm == Protosite::SemanticFormHelper::DateTimeSelector::AM and values[hour_idx] == 12
        values[hour_idx] = 0
      elsif ampm == Protosite::SemanticFormHelper::DateTimeSelector::PM and values[hour_idx] != 12
        values[hour_idx] += 12
      end
    end

    if self.class.send(:create_time_zone_conversion_attribute?, name, column_for_attribute(name))
      Time.zone.local(*values)
    else
      Time.time_with_datetime_fallback(@@default_timezone, *values)
    end
  end
end

module Protosite
  module SemanticFormHelper

    class DateTimeSelector < ActionView::Helpers::DateTimeSelector
      POSITION = {:year => 1, :month => 2, :day => 3, :hour => 4, :minute => 5, :second => 6, :meridie => 7}

      # We give them negative values so can differentiate between normal
      # date/time values. The way the multi param stuff works, from what I
      # can see, results in a variable number of fields (if you tell it to
      # include seconds, for example). So we expect the AM/PM field, if
      # present, to be last and have a negative value.
      AM = -1
      PM = -2

      def select_meridie
        selected = hour < 12 ? AM : PM unless hour.nil?

        label = { AM => 'AM', PM => 'PM' }
        options = []
        [AM, PM].each do |meridiem|
          option = { :value => meridiem }
          option[:selected] = "selected" if selected == meridiem
          options << content_tag(:option, label[meridiem], option) + "\n"
        end
        build_select(:meridie, options.join)
      end

      def select_hour
        if @options[:use_hidden] || @options[:discard_hour]
          build_hidden(:hour, hour)
        else
          if @options[:twelve_hour]
            build_options_and_select(:hour, hour12, :start => 1, :end => 12)
          else
            build_options_and_select(:hour, hour, :end => 23)
          end
        end
      end

      private

      def hour12
        return nil if hour.nil?

        h12 = hour % 12
        h12 = 12 if h12 == 0
        h12
      end

    end

    def select_meridie(datetime, options = {}, html_options = {})
      DateTimeSelector.new(datetime, options, html_options).select_meridie
    end

    def select_hour(datetime, options = {}, html_options = {})
      DateTimeSelector.new(datetime, options, html_options).select_hour
    end

  end

  class FormBuilder < Formtastic::SemanticFormBuilder

    self.all_fields_required_by_default = false
    self.inline_order = [ :errors, :input, :hints, :separator ]

    def separator(options = {})
      template.tag(:hr) unless options[:no_separator]
    end

    def inline_separator_for(method, options = nil)
      separator(options)
    end

    def error_sentence(errors, options = {})
      template.content_tag(:p, errors.to_sentence.humanize.untaint, :class => 'inline-errors')
    end

    def inputs(*args, &block)
      return super unless args[0].is_a? String and block_given?

      label = args[0]
      options = args.extract_options!
      hint = template.content_tag(:p, hint, :class => 'inline-hints') if hint = options.delete(:hint)
      html_class = [ :wrapper, (options[:required] ? :required : :optional) ]
      wrapper_html = options.delete(:wrapper_html) || {}
      wrapper_html[:class] = (html_class << wrapper_html[:class]).flatten.compact.join(' ')

      contents = if template.respond_to?(:is_haml?) && template.is_haml?
        template.capture_haml(&block)
      else
        template.capture(&block)
      end
      contents = block.call if contents.blank?

      # Ruby 1.9: String#to_s behavior changed, need to make an explicit join.
      contents = contents.join if contents.respond_to?(:join)
      if options.delete(:already_wrapped)
        hint.to_s.html_safe +
        template.content_tag(:label, label_content(options[:method], options), options) +
        template.content_tag(:ul, contents)
      else
        template.content_tag(:li,
          hint.to_s.html_safe +
          template.content_tag(:label, label, options) +
          template.content_tag(:ul, contents),
          wrapper_html)
      end
    end

    def field_set_and_list_wrapping(html_options, contents = '', &block)
      wrapper_tag = html_options.delete(:wrapper_tag) || :fieldset

      legend = legend(html_options)
      if block_given?
        contents = if template.respond_to?(:is_haml?) && template.is_haml?
          template.capture_haml(&block)
        else
          template.capture(&block)
        end
      end

      contents = contents.join if contents.respond_to?(:join)
      fieldset = legend.to_s + template.content_tag(:div,
        template.content_tag(wrapper_tag, template.content_tag(:ol, contents), html_options.except(:builder, :parent, :name, :expandable)),
        :class => "fieldset #{html_options[:class]}")
      Formtastic::Util.html_safe(fieldset)
    end

    def legend(html_options)
      legend = html_options[:name].to_s
      legend %= parent_child_index(html_options[:parent]) if html_options[:parent]
      template.content_tag(:div, template.content_tag(:span, legend), :class => "legend#{html_options[:expandable] ? ' expandable' : ''}") unless legend.blank?
    end

    def field_set_and_list_wrapping_for_method(method, options, contents)
      contents = contents.join if contents.respond_to?(:join)
      label(method, options_for_label(options)) + template.content_tag(:ul, Formtastic::Util.html_safe(contents))
    end

    def check_boxes_input(method, options)
      collection = find_collection_for_column(method, options)
      html_options = options.delete(:input_html) || {}

      input_name      = generate_association_input_name(method)
      value_as_class  = options.delete(:value_as_class)
      unchecked_value = options.delete(:unchecked_value) || ''
      html_options    = { :name => "#{@object_name}[#{input_name}][]" }.merge(html_options)
      input_ids       = []

      selected_option_is_present = [:selected, :checked].any? { |k| options.key?(k) }
      selected_values = (options.key?(:checked) ? options[:checked] : options[:selected]) if selected_option_is_present
      selected_values  = [*selected_values].compact

      disabled_option_is_present = options.key?(:disabled)
      disabled_values = [*options[:disabled]] if disabled_option_is_present

      list_item_content = collection.map do |c|
        label = c.is_a?(Array) ? c.first : c
        value = c.is_a?(Array) ? c.last : c
        input_id = generate_html_id(input_name, value.to_s.gsub(/\s/, '_').gsub(/\W/, '').downcase)
        input_ids << input_id

        html_options[:checked] = selected_values.include?(value) if selected_option_is_present
        html_options[:disabled] = disabled_values.include?(value) if disabled_option_is_present
        html_options[:id] = input_id

        li_content = template.content_tag(:label,
          Formtastic::Util.html_safe("#{self.check_box(input_name, html_options, value, unchecked_value)} #{template.escape_once(label)}"),
          :for => input_id
        )

        li_options = value_as_class ? { :class => [method.to_s.singularize, value.to_s.downcase].join('_') } : {}
        template.content_tag(:li, Formtastic::Util.html_safe(li_content), li_options) << separator(options)
      end

      options[:already_wrapped] = true
      options[:method] = method
      inputs('', options) do
        Formtastic::Util.html_safe(list_item_content.join)
      end
    end

    def radio_input(method, options)
      collection   = find_collection_for_column(method, options)
      html_options = strip_formtastic_options(options).merge(options.delete(:input_html) || {})

      input_name = generate_association_input_name(method)
      value_as_class = options.delete(:value_as_class)
      input_ids = []
      selected_option_is_present = [:selected, :checked].any? { |k| options.key?(k) }
      selected_value = (options.key?(:checked) ? options[:checked] : options[:selected]) if selected_option_is_present

      list_item_content = collection.map do |c|
        label = c.is_a?(Array) ? c.first : c
        value = c.is_a?(Array) ? c.last  : c
        input_id = generate_html_id(input_name, value.to_s.gsub(/\s/, '_').gsub(/\W/, '').downcase)
        input_ids << input_id

        html_options[:checked] = selected_value == value if selected_option_is_present

        li_content = template.content_tag(:label,
          Formtastic::Util.html_safe("#{self.radio_button(input_name, value, html_options)} #{template.escape_once(label)}"),
          :for => input_id
        )

        li_options = value_as_class ? { :class => [method.to_s.singularize, value.to_s.downcase].join('_') } : {}
        template.content_tag(:li, Formtastic::Util.html_safe(li_content), li_options)
      end

      options[:already_wrapped] = true
      options[:method] = method
      inputs('', options) do
        Formtastic::Util.html_safe(list_item_content.join)
      end
    end

    # adds AM/PM functionality to datetime inputs
    def date_or_datetime_input(method, options)
      position = { :year => 1, :month => 2, :day => 3, :hour => 4, :minute => 5, :second => 6, :meridie => 7 }
      i18n_date_order = ::I18n.t(:order, :scope => [:date])
      i18n_date_order = nil unless i18n_date_order.is_a?(Array)
      inputs   = options.delete(:order) || i18n_date_order || [:year, :month, :day]
      inputs   = [] if options[:ignore_date]
      labels   = options.delete(:labels) || {}

      time_inputs = [:hour, :minute]
      time_inputs << :second if options[:include_seconds]
      time_inputs << :meridie if options[:twelve_hour]

      list_items_capture = ""
      hidden_fields_capture = ""

      datetime = options[:selected]
      datetime = @object.send(method) if @object && @object.send(method) # object value trumps :selected value
      datetime = options[:value] unless options[:value].blank?

      html_options = options.delete(:input_html) || {}
      input_ids    = []

      (inputs + [':'] + time_inputs).each do |input|
        input_ids << input_id = generate_html_id(method, "#{position[input]}i")

        field_name = "#{method}(#{position[input]}i)"
        if options[:"discard_#{input}"]
          break if time_inputs.include?(input)

          hidden_value = datetime.respond_to?(input) ? datetime.send(input) : datetime
          hidden_fields_capture << template.hidden_field_tag("#{@object_name}[#{field_name}]", (hidden_value || 1), :id => input_id)
        else
          opts = strip_formtastic_options(options).merge(:prefix => @object_name, :field_name => field_name, :default => datetime)
          item_label_text = labels[input] || ::I18n.t(input.to_s, :default => input.to_s.humanize, :scope => [:datetime, :prompts])

          if input == ':'
            list_items_capture << template.content_tag(:li, ':', :class => 'separator')
          else
            list_items_capture << template.content_tag(:li, Formtastic::Util.html_safe([
                !item_label_text.blank? ? template.content_tag(:label, Formtastic::Util.html_safe(item_label_text), :for => input_id) : "",
                template.send(:"select_#{input}", datetime, opts, html_options.merge(:id => input_id))
              ].join(""))
            )
          end
        end
      end

      hidden_fields_capture << field_set_and_list_wrapping_for_method(method, options.merge(:label_for => input_ids.first), list_items_capture)
    end

    def label_content(method, options_or_text=nil, options=nil)
      if options_or_text.is_a?(Hash)
        return "" if options_or_text[:label] == false
        options = options_or_text
        text = options.delete(:label)
      else
        text = options_or_text
        options ||= {}
      end

      text = localized_string(method, text, :label) || humanized_attribute_name(method)
      text += required_or_optional_string(options.delete(:required))
      text = Formtastic::Util.html_safe(text)

      # special case for boolean (checkbox) labels, which have a nested input
      if options.key?(:label_prefix_for_nested_input)
        text = options.delete(:label_prefix_for_nested_input) + text
      end

      text
    end

    def asset_input(method, options)
      raise "You must provide a collection of crops for the asset input: \"#{method}\"" unless options[:collection]

      html_options = options.delete(:input_html) || {}
      options = set_include_blank(options)
      no_crop_image_path = "images/protosite/alert.png"

      input_name = generate_association_input_name(method)

      options_string = options[:collection].inject("") do |s, item|
        crop = if options[:crop] then options[:crop].call(item)
               else item
               end

        selectable = @object.send(method)
        is_selected =
          if selectable.is_a?(Integer) || (selectable.is_a?(String) && selectable.to_i.to_s == selectable)
            (item.id == selectable.to_i)
          else
            if selectable.is_a?(Array) then selectable.include?(item)
            else selectable == item
            end
          end

        text = if options[:text].is_a?(Proc) then options[:text].call(item)
               else item.send(options[:text])
               end

        option_attributes = {
          "data-path" => crop.try(:attachment).try(:url) || no_crop_image_path,
          "data-thumb-path" => crop.try(:attachment).try(:url, :thumb) || no_crop_image_path,
          "value" => item.id,
          "data-text" => text
        }
        option_attributes["selected"] = true if is_selected

        s << template.content_tag(:option, text, option_attributes)
      end

      html_options.merge!(:multiple => true) if options[:multiple] == true
      select_html = self.select(input_name, options_string, strip_formtastic_options(options), html_options)

      self.label(method, options_for_label(options).merge(:input_name => input_name)) << select_html
    end

  end

end

ActionView::Base.send :include, Protosite::SemanticFormHelper