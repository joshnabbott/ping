class AssetsChangeCasperDataToLongtext < ActiveRecord::Migration
  def self.up
    change_column :assets, :casper_serialized_data, :longtext
  end

  def self.down
    change_column :assets, :casper_serialized_data, :text
  end
end
