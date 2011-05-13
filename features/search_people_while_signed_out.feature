Feature: Search for people without signing in
  In order to keep find information on employees
  A user should be able to search an employee directory

  Background:
    Given the following hr profiles exist:
      | First Name  |  Last Name | Department | Job Title | Work Phone Number |
      | Joe         |  Smith     | IS         | Developer | 123-456-7891      |
    And the following it profiles exist:
      | Email Address             |
      | joe.smith@factorylabs.com |
    And the following people exist:
      | HR Profile        | IT Profile                                |
      | First Name: Joe   | Email Address: joe.smith@factorylabs.com  |
    And the Sphinx indexes are updated
  Scenario: Search for a person
    Given I am on the home page
    Then I should see "Download All Contacts"
    When I fill in "Search" with "Joe"
    And I press "Search"
    Then I should see "Joe Smith"
    And I should see "Developer"
    And I should see "IS"
    And I should see "joe.smith@factorylabs.com"
    And I should see "123-456-7891"
    And I should not see "Edit"
    And I should not see "Destroy"

