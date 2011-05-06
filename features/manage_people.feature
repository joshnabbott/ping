Feature: Manage people
  In order to keep accurate information on people
  An admin wants to create, update, and delete people

  Background:
    Given I am authenticated
    And I am in the "IT" group
    And I am in the "HR" group

  Scenario: Delete a person
    Given the following hr profiles exist:
      | First Name  |  Last Name |
      | Joe         |  Smith     |
    And the following people exist:
      | HR Profile        |
      | First Name: Joe   |
    And I am on the people page
    And I follow "Destroy" within the 2nd person
    Then I should not see "joe.smith"