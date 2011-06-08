module AssetsHelper
  def options_for_kind
    options = []
    Asset::KINDS.each do |kind|
      options << content_tag(:option, kind, :value => kind.parameterize, "data-div-id" => kind.parameterize)
    end

    options.to_s
  end
end
