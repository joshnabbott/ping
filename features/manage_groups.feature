Feature: Manage groups
  In order to organize groups of users
  An admin wants to create, update, and delete groups

  Background:
    Given I am authenticated
    And I am in the "IT" group
  
  Scenario: Register a new group
    Given I am on the groups page
    And I follow "Create a new group"
    And I fill in "Name" with "Developers"
    And I press "Create"
    Then I should see "Group was successfully created."
    And I should see "Developers"

  Scenario: Register a new group with a blank name
    Given I am on the groups page
    And I follow "Create a new group"
    And I press "Create"
    Then I should not see "Group was successfully created."
    And I should see "Can't be blank"

  Scenario: Update a group
    Given the following groups exist:
      | Name        |
      | Developers  |
    And I am on the groups page
    And I follow "Edit" within the group with the name "Developers"
    And I fill in "Name" with "Rubyists"
    And I press "Update Group"
    Then I should see "Group was successfully updated."
    And I should see "Rubyists"

  Scenario: Delete a group
    Given the following groups exist:
      | Name        |
      | Developers  |
    When I go to the groups page
    And I follow "Destroy" within the group with the name "Developers"
    And I should be on the groups page
    Then I should not see "Developers"