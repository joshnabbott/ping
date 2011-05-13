class AddSocialFieldsToPublicProfile < ActiveRecord::Migration
  def self.up
    add_column :public_profiles, :twitter_url, :string
    add_column :public_profiles, :linkedin_url, :string
    add_column :public_profiles, :facebook_url, :string
    add_column :public_profiles, :flickr_url, :string
    add_column :public_profiles, :instagram_url, :string
    add_column :public_profiles, :website_url, :string
  end

  def self.down
    remove_column :public_profiles, :website_url
    remove_column :public_profiles, :instagram_url
    remove_column :public_profiles, :flickr_url
    remove_column :public_profiles, :facebook_url
    remove_column :public_profiles, :linkedin_url
    remove_column :public_profiles, :twitter_url
  end
end
