class CreateAssets < ActiveRecord::Migration
  def self.up
    create_table :assets do |t|
      t.belongs_to :employee
      t.belongs_to :transfer_employee
      t.string :asset_number
      t.string :kind
      t.string :serial_number
      t.string :name
      t.string :model
      t.string :manufacturer
      t.date :warranty_end_date
      t.string :warranty_number
      t.date :warranty_renewal_date
      t.string :status
      t.string :location
      t.text :notes
      t.date :purchase_date
      t.string :purchase_type
      t.string :po_number
      t.string :transfer_type
      t.date :transfer_date
      t.decimal :sale_price, :precision => 8, :scale => 2, :default => 0.00
      t.string :payment_type
      t.text :transfer_notes
      t.text :casper_serialized_data

      t.timestamps
    end
  end

  def self.down
    drop_table :assets
  end
end
