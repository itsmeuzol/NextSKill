Feature: Is Login successful?
  Is Login process successfully completed
  Scenario: Register a applicant on Next Skill
    Given I visit Next Skill Registration Page
    When I enter my email
    When I enter my password
    When I press login
    Then I should be loggedin