# == Schema Information
#
# Table name: assets
#
#  id                     :integer(4)      not null, primary key
#  employee_id            :integer(4)
#  transfer_employee_id   :integer(4)
#  asset_number           :string(255)
#  kind                   :string(255)
#  serial_number          :string(255)
#  name                   :string(255)
#  model                  :string(255)
#  manufacturer           :string(255)
#  warranty_end_date      :date
#  warranty_number        :string(255)
#  warranty_renewal_date  :date
#  status                 :string(255)
#  location               :string(255)
#  notes                  :text
#  purchase_date          :date
#  purchase_type          :string(255)
#  po_number              :string(255)
#  transfer_type          :string(255)
#  transfer_date          :date
#  sale_price             :decimal(8, 2)   default(0.0)
#  payment_type           :string(255)
#  transfer_notes         :text
#  casper_serialized_data :text
#  created_at             :datetime
#  updated_at             :datetime
#

class Asset < ActiveRecord::Base
  serialize :casper_data

  KINDS = [
    'Computer',
    'Monitor',
    'Infrastructure',
    'Phone',
    'Tablet',
    'Wireless',
    'Peripheral',
    'Furniture',
    'Software'
  ]

  STATUSES = [
    'Active',
    'Stock',
    'For Sale',
    'Out of Service',
    'Parts',
    'Repair',
    'Reserved',
    'Transfered'
  ]

  belongs_to :employee, :class_name => 'Person'
  belongs_to :transfer_employee, :class_name => 'Person'

  validates :name, :model, :manufacturer,         :presence => true
  validates :kind,                                :presence => true, :inclusion => { :in => KINDS }
  validates :asset_number, :serial_number,        :presence => true, :uniqueness => true
  validates :status,                              :presence => true, :inclusion => { :in => STATUSES }
  validates :sale_price,                          :numericality => true

  define_index do
    indexes :asset_number,  :sortable => true
    indexes :serial_number, :sortable => true
  end
end
