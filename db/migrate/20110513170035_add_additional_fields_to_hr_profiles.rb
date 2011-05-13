class AddAdditionalFieldsToHrProfiles < ActiveRecord::Migration
  def self.up
    add_column :hr_profiles, :manager_id, :integer
    add_column :hr_profiles, :replacing_id, :integer
    add_column :hr_profiles, :salary_annual, :decimal
    add_column :hr_profiles, :salary_per_period, :decimal
    add_column :hr_profiles, :flsa, :string
    add_column :hr_profiles, :vacation, :string
    add_column :hr_profiles, :vacation_effective_date, :date
    add_column :hr_profiles, :last_day_worked, :date
    add_column :hr_profiles, :separation_pay, :decimal
    add_column :hr_profiles, :termination_date, :date
    add_column :hr_profiles, :vacation_payout, :string
    add_column :hr_profiles, :reason_for_release, :text
    add_column :hr_profiles, :bonus_justification, :text
    add_column :hr_profiles, :bonus_amount, :decimal
    add_column :hr_profiles, :fml_loa, :string
  end

  def self.down
    remove_column :hr_profiles, :fml_loa
    remove_column :hr_profiles, :bonus_amount
    remove_column :hr_profiles, :bonus_justification
    remove_column :hr_profiles, :reason_for_release
    remove_column :hr_profiles, :vacation_payout
    remove_column :hr_profiles, :termination_date
    remove_column :hr_profiles, :separation_pay
    remove_column :hr_profiles, :last_day_worked
    remove_column :hr_profiles, :vacation_effective_date
    remove_column :hr_profiles, :vacation
    remove_column :hr_profiles, :flsa
    remove_column :hr_profiles, :salary_per_period
    remove_column :hr_profiles, :salary_annual
    remove_column :hr_profiles, :replacing_id
    remove_column :hr_profiles, :manager_id
  end
end
