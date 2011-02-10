class ChangeColumnNamesOnPerson < ActiveRecord::Migration

	def self.up
		rename_column :people, :building_card_id, :building_card
		rename_column :people, :garage_card_id, :garage_card
	end

	def self.down
		rename_column :people, :building_card, :building_card_id
		rename_column :people, :garage_card, :garage_card_id
	end

end
