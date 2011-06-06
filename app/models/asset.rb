# == Schema Information
#
# Table name: assets
#
#  id                         :integer(4)      not null, primary key
#  employee_id                :integer(4)
#  transfer_employee_id       :integer(4)
#  asset_number               :string(255)
#  kind                       :string(255)
#  serial_number              :string(255)
#  name                       :string(255)
#  model                      :string(255)
#  manufacturer               :string(255)
#  warranty_end_date          :date
#  warranty_number            :string(255)
#  warranty_renewal_date      :date
#  status                     :string(255)
#  location                   :string(255)
#  notes                      :text
#  purchase_date              :date
#  purchase_type              :string(255)
#  po_number                  :string(255)
#  transfer_type              :string(255)
#  transfer_date              :date
#  sale_price                 :decimal(8, 2)   default(0.0)
#  payment_type               :string(255)
#  transfer_notes             :text
#  casper_serialized_data     :text(2147483647
#  created_at                 :datetime
#  updated_at                 :datetime
#  casper_id                  :integer(4)
#  processor_speed            :string(255)
#  processor_type             :string(255)
#  total_ram                  :string(255)
#  mac_address_one            :string(255)
#  mac_address_two            :string(255)
#  operating_system_version   :string(255)
#  battery_health             :string(255)
#  uptime                     :string(255)
#  partition_size             :string(255)
#  partition_name             :string(255)
#  partition_percentage_used  :string(255)
#  carrier_info               :string(255)
#  phone_number               :string(255)
#  size                       :string(255)
#  hardrive                   :string(255)
#  software_serial_number_one :string(255)
#  software_serial_number_two :string(255)
#  organization_name          :string(255)
#  registration_name          :string(255)
#  license_quantity           :string(255)
#  license_type               :string(255)
#  license_notes              :text
#  license_renewal_date       :date
#  casper_url                 :string(255)
#  tracking_notes             :text
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
