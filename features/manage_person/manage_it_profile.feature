Feature: Manage my IT profile
  In order to keep an IT profile up-to-date
  A member of the IT group should be able to manage an IT profile

  Background:
    Given I am authenticated
    And I am in the "IT" group

  Scenario: Edit my IT profile
    Given I am on the home page
    And I follow "Manage My Information"
    And I follow "IT Profile"
    When I fill in the following:
      | Default Username | Crazy       |
    And I press "Update"
    Then I should see "IT profile was successfully updated."
