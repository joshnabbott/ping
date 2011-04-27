class EnableDeviseSecurityExtension < ActiveRecord::Migration

  def self.up
    change_table :credentials do |t|
      t.password_expirable
    end

    create_table :old_passwords do |t|
    t.password_archivable
    end

  add_index :old_passwords, [ :password_archivable_type, :password_archivable_id ],
                            :name => :index_password_archivable
  end

  def self.down
    drop_index :old_passwords, :name => :index_password_archivable
    remove_column :credentials, :password_archivable_id
    remove_column :credentials, :password_archivable_type
    drop_table :old_passwords
  end

end
