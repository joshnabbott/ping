Feature: Manage a work profile
  In order to keep a work profile up-to-date
  A member of the IT group should be able to manage an work profile

  Background:
    Given I am authenticated
    And I am in the "IT" group

  Scenario: Edit a work profile
    Given I am on the home page
    And I follow "Manage My Information"
    Then I should not see "View my work contact profile"
    And I follow "Edit my work contact profile"
    Then I should see "Your Work Contact Profile"
    When I fill in the following:
      | Work phone number | 123-123-1234  |
      | Work city         | Englewood     |
      | Work zip          | 80113         |
    And I press "Update"
    Then I should see "Work profile was successfully updated."
    And I should be on my profile page