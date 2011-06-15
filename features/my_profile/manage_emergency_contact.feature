Feature: Manage my emergency contact
  In order to keep an up-to-date emergency contact on file
  A user should be able to update their emergency contact

  Background:
    Given I am authenticated

  Scenario: Edit my emergency contact
    Given I am on the home page
    And I follow "Manage My Information"
    And I follow "Emergency Contact"
    When I fill in the following:
      | Name          | Joan Smith    |
      | Phone number  | 123-456-7891  |
      | Relation      | Mother        |
    And I press "Update"
    Then I should see "Your emergency contact was successfully updated."
