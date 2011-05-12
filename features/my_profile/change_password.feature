Feature: Change my password
  In order to keep their credentials up to date
  A user should be able to update their password

  Background:
    Given I am authenticated

  Scenario: Change my password successfully
    Given I am on the home page
    And I follow "Change My Password"
    When I fill in the following:
      | Password              | L33tPass |
      | Password confirmation | L33tPass |
    And I press "Change password"
    Then I should see "Your credentials were successfully updated."
    And I should be on my profile page

  Scenario: Change my password with a password that is too short
    Given I am on the home page
    And I follow "Change My Password"
    When I fill in the following:
      | Password              | weak |
      | Password confirmation | weak |
    And I press "Change password"
    Then I should not see "Your credentials were successfully updated."
    And I should see "is too short (minimum is 8 characters)"

  Scenario: Change my password with a password that has been used recently
    Given I am on the home page
    And I follow "Change My Password"
    When I fill in the following:
      | Password              | NewPass1 |
      | Password confirmation | NewPass1 |
    And I press "Change password"
    And I follow "Change My Password"
    When I fill in the following:
      | Password              | L33tPass1 |
      | Password confirmation | L33tPass1 |
    And I press "Change password"
    Then I should not see "Your credentials were successfully updated."
    And I should see "has already been used recently"

  Scenario: Change my password with a password that has no caps
    Given I am on the home page
    And I follow "Change My Password"
    When I fill in the following:
      | Password              | weakpass1 |
      | Password confirmation | weakpass1 |
    And I press "Change password"
    Then I should not see "Your credentials were successfully updated."
    And I should see "is invalid"

  Scenario: Change my password with a password that has no numbers
    Given I am on the home page
    And I follow "Change My Password"
    When I fill in the following:
      | Password              | weakpass |
      | Password confirmation | weakpass |
    And I press "Change password"
    Then I should not see "Your credentials were successfully updated."
    And I should see "is invalid"
