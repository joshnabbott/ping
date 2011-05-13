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
#  sale_price             :float
#  payment_type           :string(255)
#  transfer_notes         :text
#  casper_serialized_data :text
#  created_at             :datetime
#  updated_at             :datetime
#

require 'test_helper'

class AssetTest < ActiveSupport::TestCase
  def setup
    @asset = Factory(:asset)
  end

  should belong_to :employee
  should belong_to :transfer_employee
end
