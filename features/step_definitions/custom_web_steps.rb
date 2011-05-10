Given /^I am authenticated$/ do
  username = 'testuser'
  password = 'L33tPass1'
  @credential = Factory(:credential, :username => username, :password => password, :password_confirmation => password)

  Given %{I go to the login page}
  And %{I fill in "credential_username" with "#{username}"}
  And %{I fill in "credential_password" with "#{password}"}
  And %{I press "Sign in"}
end

Given /^I am in the "([^"]*)" group$/ do |group_name|
  group = Group.find_or_create_by_name(group_name)
  @credential.person.groups << group
end

#Then /^(?:|I )should see "([^"]*)"$/ do |text|
#  if page.respond_to? :should
#    page.should have_content(text)
#  else
#    assert page.has_content?(text)
#  end
#end
#
#Then /^(?:|I )should see \/([^\/]*)\/$/ do |regexp|
#  regexp = Regexp.new(regexp)
#
#  if page.respond_to? :should
#    page.should have_xpath('//*', :text => regexp)
#  else
#    assert page.has_xpath?('//*', :text => regexp)
#  end
#end
#
#Then /^(?:|I )should not see "([^"]*)"$/ do |text|
#  if page.respond_to? :should
#    page.should have_no_content(text)
#  else
#    assert page.has_no_content?(text)
#  end
#end
#
#Then /^(?:|I )should not see \/([^\/]*)\/$/ do |regexp|
#  regexp = Regexp.new(regexp)
#
#  if page.respond_to? :should
#    page.should have_no_xpath('//*', :text => regexp)
#  else
#    assert page.has_no_xpath?('//*', :text => regexp)
#  end
#end
