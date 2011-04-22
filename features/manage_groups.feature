Feature: Manage groups
  In order to organize groups of users
  An admin wants to create, update, and delete groups

  Background:
    Given I am authenticated
    And I am in the "IT" group
  
  Scenario: Register a new group
    Given I am on the new group page
    And I fill in "Name" with "Developers"
    And I press "Create"
    Then I should see "Group was successfully created."
    And I should see "Developers"

  Scenario: Update a group
    Given the following groups exist:
      | Name        |
      | Developers  |
    And I am on the groups page
    And I follow "Edit" within the group with the name "Developers"
    And I fill in "Name" with "Rubyists"
    And I press "Update"
    Then I should see "Group was successfully updated."
    And I should see "Rubyists"

  Scenario: Delete a group
    Given the following groups exist:
      | Name        |
      | Developers  |
    When I go to the groups page
    And I follow "Destroy" within the group with the name "Developers"
    Then I should not see "Developers"