class AddFieldsToAssets < ActiveRecord::Migration
  def self.up
    unless column_exists?(:assets, :casper_id)
      add_column :assets, :casper_id, :integer
    end

    unless column_exists?(:assets, :processor_speed)
      add_column :assets, :processor_speed, :string
    end

    unless column_exists?(:assets, :processor_type)
      add_column :assets, :processor_type, :string
    end

    unless column_exists?(:assets, :total_ram)
      add_column :assets, :total_ram, :string
    end

    unless column_exists?(:assets, :mac_address_one)
      add_column :assets, :mac_address_one, :string
    end

    unless column_exists?(:assets, :mac_address_two)
      add_column :assets, :mac_address_two, :string
    end

    unless column_exists?(:assets, :operating_system_version)
      add_column :assets, :operating_system_version, :string
    end

    unless column_exists?(:assets, :battery_health)
      add_column :assets, :battery_health, :string
    end

    unless column_exists?(:assets, :uptime)
      add_column :assets, :uptime, :string
    end

    unless column_exists?(:assets, :partition_size)
      add_column :assets, :partition_size, :string
    end

    unless column_exists?(:assets, :partition_name)
      add_column :assets, :partition_name, :string
    end

    unless column_exists?(:assets, :partition_percentage_used)
      add_column :assets, :partition_percentage_used, :string
    end

    unless column_exists?(:assets, :carrier_info)
      add_column :assets, :carrier_info, :string
    end

    unless column_exists?(:assets, :phone_number)
      add_column :assets, :phone_number, :string
    end

    unless column_exists?(:assets, :size)
      add_column :assets, :size, :string
    end

    unless column_exists?(:assets, :hardrive)
      add_column :assets, :hardrive, :string
    end

    unless column_exists?(:assets, :software_serial_number_one)
      add_column :assets, :software_serial_number_one, :string
    end

    unless column_exists?(:assets, :software_serial_number_two)
      add_column :assets, :software_serial_number_two, :string
    end

    unless column_exists?(:assets, :organization_name)
      add_column :assets, :organization_name, :string
    end

    unless column_exists?(:assets, :registration_name)
      add_column :assets, :registration_name, :string
    end

    unless column_exists?(:assets, :license_quantity)
      add_column :assets, :license_quantity, :string
    end

    unless column_exists?(:assets, :license_type)
      add_column :assets, :license_type, :string
    end

    unless column_exists?(:assets, :license_notes)
      add_column :assets, :license_notes, :text
    end

    unless column_exists?(:assets, :license_renewal_date)
      add_column :assets, :license_renewal_date, :date
    end

    unless column_exists?(:assets, :casper_url)
      add_column :assets, :casper_url, :string
    end

    unless column_exists?(:assets, :tracking_notes)
      add_column :assets, :tracking_notes, :text
    end
  end

  def self.down
    if column_exists?(:assets, :casper_id)
      remove_column :assets, :casper_id
    end

    if column_exists?(:assets, :processor_speed)
      remove_column :assets, :processor_speed
    end

    if column_exists?(:assets, :processor_type)
      remove_column :assets, :processor_type
    end

    if column_exists?(:assets, :total_ram)
      remove_column :assets, :total_ram
    end

    if column_exists?(:assets, :mac_address_one)
      remove_column :assets, :mac_address_one
    end

    if column_exists?(:assets, :mac_address_two)
      remove_column :assets, :mac_address_two
    end

    if column_exists?(:assets, :operating_system_version)
      remove_column :assets, :operating_system_version
    end

    if column_exists?(:assets, :battery_health)
      remove_column :assets, :battery_health
    end

    if column_exists?(:assets, :uptime)
      remove_column :assets, :uptime
    end

    if column_exists?(:assets, :partition_size)
      remove_column :assets, :partition_size
    end

    if column_exists?(:assets, :partition_name)
      remove_column :assets, :partition_name
    end

    if column_exists?(:assets, :partition_percentage_used)
      remove_column :assets, :partition_percentage_used
    end

    if column_exists?(:assets, :carrier_info)
      remove_column :assets, :carrier_info
    end

    if column_exists?(:assets, :phone_number)
      remove_column :assets, :phone_number
    end

    if column_exists?(:assets, :size)
      remove_column :assets, :size
    end

    if column_exists?(:assets, :hardrive)
      remove_column :assets, :hardrive
    end

    if column_exists?(:assets, :software_serial_number_one)
      remove_column :assets, :software_serial_number_one
    end

    if column_exists?(:assets, :software_serial_number_two)
      remove_column :assets, :software_serial_number_two
    end

    if column_exists?(:assets, :organization_name)
      remove_column :assets, :organization_name
    end

    if column_exists?(:assets, :registration_name)
      remove_column :assets, :registration_name
    end

    if column_exists?(:assets, :license_quantity)
      remove_column :assets, :license_quantity
    end

    if column_exists?(:assets, :license_type)
      remove_column :assets, :license_type
    end

    if column_exists?(:assets, :license_notes)
      remove_column :assets, :license_notes
    end

    if column_exists?(:assets, :license_renewal_date)
      remove_column :assets, :license_renewal_date
    end

    if column_exists?(:assets, :casper_url)
      remove_column :assets, :casper_url
    end

    if column_exists?(:assets, :tracking_notes)
      remove_column :assets, :tracking_notes
    end
  end
end
