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

require 'test_helper'

class AssetTest < ActiveSupport::TestCase
  def setup
    @asset = Factory(:asset)
  end

  should belong_to :employee
  should belong_to :transfer_employee

  should validate_presence_of :asset_number
  should validate_presence_of :kind
  should validate_presence_of :serial_number
  should validate_presence_of :name
  should validate_presence_of :model
  should validate_presence_of :manufacturer
  should validate_presence_of :status

  should validate_uniqueness_of :asset_number
  should validate_uniqueness_of :serial_number

  context 'status attribute' do
    should 'be included in Asset::STATUSES' do
      @asset = Factory.build(:asset, :status => 'Dead.')
      assert !@asset.valid?
    end
  end

  context 'sale price attribute' do
    should 'be numerical' do
      @asset_one = Factory.build(:asset, :sale_price => 1000.00)
      @asset_two = Factory.build(:asset, :sale_price => 'one thousand dollars')
      assert @asset_one.valid?
      assert !@asset_two.valid?
    end
  end

end
