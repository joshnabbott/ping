Rails.application.config.middleware.use OmniAuth::Builder do
  
  require 'openid/store/filesystem'
  
  provider :google_apps, OpenID::Store::Filesystem.new('/tmp'), :domain => 'factorylabs.com', :name => 'google'
end