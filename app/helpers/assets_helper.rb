module AssetsHelper
  def options_for_kind(selected = nil)
    options = []

    Asset::KINDS.each do |kind|
      value = kind.parameterize

      option = if value == selected
        content_tag(:option, kind, :value => value, "data-div-id" => value, :selected => "selected")
      else
        content_tag(:option, kind, :value => value, "data-div-id" => value)
      end

      options << option
    end

    options.to_s
  end
end
