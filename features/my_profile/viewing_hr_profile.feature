Feature: View my HR profile
  In order to audit their HR information
  A user should be able to view their HR profile

  Background:
    Given I am authenticated

  Scenario: View my HR profile
    Given my HR profile has the following attributes:
      | First name                  | John                        |
      | Middle name                 | Q                           |
      | Last name                   | Smith                       |
      | Title                       | Jr.                         |
      | Job title                   | Developer                   |
      | Gender                      | male                        |
      | Pay type                    | salaried                    |
      | Department                  | IS                          |
      | Hire Date                   | 4/11/2010                   |
      | Hire Date Vacation Adjustment | 4/12/2010                 |
      | Departure Date              | 4/13/2010                   |
      | Birthday                    | 1/11/1980                   |
    When I am on the home page
    And I follow "Manage My Information"
    And I follow "View my HR profile"
    Then I should see "Your HR Profile"
    And I should see "First Name John"
    And I should see "Middle Name Q"
    And I should see "Last Name Smith"
    And I should see "Gender Male"
    And I should see "Department IS"
    And I should see "Job Title Developer"
    And I should see "Hire Date 2010-04-11"
    And I should see "Hire Date (Vacation Adjustment) 2010-04-12"
    And I should see "Departure Date 2010-04-13"
    And I should see "Birthday 1980-01-11"
    And I should see "Pay Type Salaried"