Feature: Is register successful?
  Is Registration process successfully completed

  Scenario: Register a applicant on Next Skill

    Given I visit Next Skill Registration Page
    When I press login now
    When I enter my fullname
    When I enter my username
    When I enter my email
    When I select applicant
    When I enter my password
    When I enter my confirm password 
    When I press submit
    Then I should be loggedin

    