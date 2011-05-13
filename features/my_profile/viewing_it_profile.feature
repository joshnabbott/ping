Feature: View my IT profile
  In order to audit their IT information
  A user should be able to view their IT profile

  Background:
    Given I am authenticated

  Scenario: View my IT profile
    Given my IT profile has the following attributes:
      | Default username  | john.smith                  |
      | Chat GTalk        | john.smith@factorylabs.com  |
      | Email address     | john.smith@factorylabs.com  |
    When I am on the home page
    And I follow "Manage My Information"
    And I follow "View my IT profile"
    Then I should see "Your IT Profile"
    And I should see "Default Username john.smith"
    And I should see "E-mail Address john.smith@factorylabs.com"
    And I should see "Google Talk Username john.smith@factorylabs.com"