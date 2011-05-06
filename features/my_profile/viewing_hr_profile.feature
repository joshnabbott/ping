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
      | Work email address          | john.smith@factorylabs.com  |
      | Work phone number           | 123-567-7890                |
      | Work fax number             | 123-567-7890                |
      | Work mobile number          | 123-567-7890                |
      | Work extension              | 123                         |
      | Work address                | 158 Fillmore                |
      | Work city                   | Denver                      |
      | Work state                  | CO                          |
      | Work zip                    | 80206                       |
      | Gender                      | male                        |
      | Pay type                    | salaried                    |
      | Department                  | IS                          |
      | Work country                | USA                         |
      | Hire Date                   | 4/11/2010                   |
      | Hire Date Vacation Adjustment | 4/12/2010                 |
      | Departure Date              | 4/13/2010                   |
      | Birthday                    | 1/11/1980                   |
    When I am on the home page
    And I follow "My Profile"
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
    And I should see "Work E-mail Address john.smith@factorylabs.com"
    And I should see "Work Phone Number 123-567-7890"
    And I should see "Work Fax Number 123-567-7890"
    And I should see "Work Mobile Number 123-567-7890"
    And I should see "Work Extension 123"
    And I should see "Work Address 158 Fillmore"
    And I should see "Work City Denver"
    And I should see "Work State CO"
    And I should see "Work Zip 80206"
    And I should see "Work Country USA"