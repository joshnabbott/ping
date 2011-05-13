class MoveChatAimAndChatSkypeFromItProfilesToPublicProfiles < ActiveRecord::Migration
  def self.up
    add_column :public_profiles, :chat_aim, :string
    add_column :public_profiles, :chat_skype, :string

    PublicProfile.reset_column_information

    PublicProfile.all.each do |public_profile|
      it_profile = public_profile.person.it_profile
      public_profile.update_attributes(:chat_aim => it_profile.chat_aim, :chat_skype => it_profile.chat_skype)
    end

    remove_column :it_profiles, :chat_aim
    remove_column :it_profiles, :chat_skype
  end

  def self.down
    add_column :it_profiles, :chat_skype, :string
    add_column :it_profiles, :chat_aim, :string

    ItProfile.reset_column_information

    ItProfile.all.each do |it_profile|
      public_profile = it_profile.person.public_profile
      it_profile.update_attributes(:chat_aim => public_profile.chat_aim, :chat_skype => public_profile.chat_skype)
    end

    remove_column :public_profiles, :chat_aim
    remove_column :public_profiles, :chat_skype
  end
end
