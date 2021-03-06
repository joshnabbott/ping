module HtmlSelectorsHelpers
  # Maps a name to a selector. Used primarily by the
  #
  #   When /^(.+) within (.+)$/ do |step, scope|
  #
  # step definitions in web_steps.rb
  #
  def factory_names_regex
    Factory.factories.values.map(&:human_name) * '|'
  end
  
  def selector_for(locator)

    case locator

    when /the page/
      "html > body"
        
    when /^the (\d+)(?:st|nd|rd|th) (#{factory_names_regex})$/
      ordinal = $1.to_i
      human_name  = $2
      "##{dom_id(human_name.classify.constantize.first(:offset => (ordinal - 1)))}"

    when /^the (#{factory_names_regex}) with the (.*) "([^"]*)"$/
      human_name  = $1
      attribute   = $2
      value       = $3
      "##{dom_id(human_name.classify.constantize.where(attribute.to_sym => value).first)}"

    # Add more mappings here.
    # Here is an example that pulls values out of the Regexp:
    #
    #  when /the (notice|error|info) flash/
    #    ".flash.#{$1}"

    # You can also return an array to use a different selector
    # type, like:
    #
    #  when /the header/
    #    [:xpath, "//header"]

    # This allows you to provide a quoted selector as the scope
    # for "within" steps as was previously the default for the
    # web steps:
    when /"(.+)"/
      $1
    else
      raise "Can't find mapping from \"#{locator}\" to a selector.\n" +
        "Now, go and add a mapping in #{__FILE__}"
    end
  end
end

World(ActionController::RecordIdentifier)
World(HtmlSelectorsHelpers)
