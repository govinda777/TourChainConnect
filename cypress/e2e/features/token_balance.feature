
Feature: Token Balance Display
  Users should be able to see their token balance

  Scenario: User connects wallet and views balance
    Given I am on the homepage
    When I connect my wallet
    Then I should see my token balance
    And the balance should update when I receive tokens
