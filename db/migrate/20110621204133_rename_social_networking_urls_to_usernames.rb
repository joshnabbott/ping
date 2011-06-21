class RenameSocialNetworkingUrlsToUsernames < ActiveRecord::Migration
  def self.up
    rename_column :public_profiles, :twitter_url,   :username_twitter
    rename_column :public_profiles, :linkedin_url,  :username_linkedin
    rename_column :public_profiles, :facebook_url,  :username_facebook
    rename_column :public_profiles, :flickr_url,    :username_flickr
    rename_column :public_profiles, :instagram_url, :username_instagram
  end

  def self.down
    rename_column :public_profiles, :username_twitter,    :twitter_url
    rename_column :public_profiles, :username_linkedin,   :linkedin_url
    rename_column :public_profiles, :username_facebook,   :facebook_url
    rename_column :public_profiles, :username_flickr,     :flickr_url
    rename_column :public_profiles, :username_instagram,  :instagram_url
  end
end
