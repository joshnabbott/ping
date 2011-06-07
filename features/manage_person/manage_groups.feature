Feature: Manage my groups
  In order to keep my profile up-to-date
  A member of the IT group should be able to manage a person's groups

  Background:
    Given I am authenticated
    And I am in the "IT" group
    And the following groups exist:
      | Name        |
      | Developers  |

  Scenario: Edit my groups
    Given I am on the home page
    When I follow "Manage My Information"
    And I follow "Manage my groups"
    Then the "IT" checkbox should be checked
    And the "Developers" checkbox should not be checked
    When I check "Developers"
    And I press "Update"
    Then I should see "Person was successfully updated."
    And I should be on my profile page