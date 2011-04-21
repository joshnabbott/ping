Feature: Manage groups
  In order to organize groups of users
  An admin wants to create, update, and delete groups

  Background:
    Given I am authenticated  
  
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
    And I follow "Edit"
    And I fill in "Name" with "Rubyists"
    And I press "Update"
    Then I should see "Group was successfully updated."
    And I should see "Rubyists"

  Scenario: Delete a group
    Given the following groups exist:
      | Name        |
      | Developers  |
    When I go to the groups page
    And I follow "Destroy"
    Then I should see "No groups found"