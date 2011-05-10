Feature: Manage my HR profile
  In order to keep an HR profile up-to-date
  A member of the HR group should be able to manage an HR profile

  Background:
    Given I am authenticated
    And I am in the "HR" group

  Scenario: Edit my HR profile
    Given I am on the home page
    And I follow "My Profile"
    Then I should not see "View my HR profile"
    And I follow "Edit my HR profile"
    Then I should see "Your HR Profile"
    When I fill in the following:
      | Middle name | Nathan               |
      | Title       | Mr.                  |
      | Job title   | And Justice for All  |
    And I press "Update"
    Then I should see "HR profile was successfully updated."
    And I should be on my profile page