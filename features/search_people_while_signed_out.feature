Feature: Search for people without signing in
  In order to keep find information on employees
  A user should be able to search an employee directory

  Background:
    Given the following hr profiles exist:
      | First Name  |  Last Name |
      | Joe         |  Smith     |
    And the following people exist:
      | HR Profile        |
      | First Name: Joe   |
    And the Sphinx indexes are updated
  Scenario: Search for a person
    Given I am on the home page
    Then I should see "Download Contacts"
    When I fill in "Search" with "Joe"
    And I press "Search"
    Then I should see "Joe Smith"
    And I should not see "Edit"
    And I should not see "Destroy"

