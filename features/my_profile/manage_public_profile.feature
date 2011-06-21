Feature: Manage my public profile
  In order to keep accurate information on their profile page
  A user should be able to update their public profile

  Background:
    Given I am authenticated

  Scenario: Edit my public profile
    Given I am on the home page
    And I follow "Manage My Information"
    And I follow "Public Profile"
    When I fill in the following:
      | Nickname               | Johnny                      |
      | Bio                    | I am a developer            |
      | Personal email address | john.smith@factorylabs.com  |
      | Home phone number      | 123-567-7890                |
      | Home fax number        | 123-567-7890                |
      | Mobile number          | 123-567-7890                |
      | Home address           | 158 Fillmore                |
      | Home city              | Denver                      |
      | Home state             | CO                          |
      | Home zip               | 80206                       |
    And I select "USA" from "Home country"
    And I press "Update Public profile"
    Then I should see "Your public profile was successfully updated."
    And I should see "I am a developer"