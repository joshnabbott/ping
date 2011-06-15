Feature: Search for people while signed in and I belong to the IT or HR group
  In order to keep find information on both active and inactive employees
  A user who is in the IT or HR group should be able to search an employee directory

  Background:
    Given I am authenticated
    And I am in the "IT" group
    And the following hr profiles exist:
      | First Name  |  Last Name | Department | Job Title | Is Active |
      | Joe         |  Smith     | IS         | Developer | true      |
      | Jack        |  Smith     | IS         | Developer | false     |
    And the following work profiles exist:
      | Work Phone Number |
      | 123-456-7891      |
      | 234-567-8901      |
    And the following it profiles exist:
      | Email Address              |
      | joe.smith@factorylabs.com  |
      | jack.smith@factorylabs.com |
    And the following people exist:
      | HR Profile       | IT Profile                                | Work Profile                    |
      | First Name: Joe  | Email Address: joe.smith@factorylabs.com  | Work Phone Number: 123-456-7891 |
      | First Name: Jack | Email Address: jack.smith@factorylabs.com | Work Phone Number: 234-567-8901 |
    And the Sphinx indexes are updated
  Scenario: Search for a person
    Given I am on the home page
    And I follow "Company Directory"
    And I fill in "Search" with "Smith"
    And I press "Search"
    Then I should see "Joe Smith"
    And I should see "Developer"
    And I should see "IS"
    And I should see "joe.smith@factorylabs.com"
    And I should see "123-456-7891"
    And I should see "Jack Smith"
    And I should see "jack.smith@factorylabs.com"
    And I should see "234-567-8901"
