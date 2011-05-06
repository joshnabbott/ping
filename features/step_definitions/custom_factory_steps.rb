Given /^my (.*) has the following attributes:$/ do |association, table|
  association_name = association.downcase.gsub(' ', '_')
  factory = Factory.factory_by_name(association_name)
  attributes = convert_human_hash_to_attribute_hash(table.rows_hash, factory.associations)
  @credential.person.send(association_name).update_attributes!(attributes)
end