CarrierWave.configure do |config|
  config.permissions = 0775
end

if Rails.env.test? or Rails.env.cucumber?
  CarrierWave.configure do |config|
    config.storage = :file
    config.enable_processing = false
  end
end