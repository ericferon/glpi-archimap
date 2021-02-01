Feature: Integrate drawio as a new tab
	As a GLPI user,
	I need to draw a diagram with stencils linked to GLPI assets

Background:
#		Given I'm logged as user "test" with password "aut0test"
        Given I am on "/"
        When I fill in "Login" with "test"
        When I fill in "Password" with "aut0test"
        When I press "Post"
        Then I should be on "/front/central.php"

@javascript
	Scenario: Creating a new diagram
		Given I am on "/plugins/archimap/front/graph.php"
		When I follow "Add"
		Then I am on "/plugins/archimap/front/graph.form.php"
		And I should see the field "name"
		And I should see the field "shortdescription"
		And I should see the field "plugin_archimap_graphtypes_id"
		And I should see the field "groups_id"
		And I should see the field "users_id"
        And I should see the button "Add"
		And I fill in "name" with "Test Behat-Mink"
		And I fill in "shortdescription" with "Test Behat-Mink : short description"
		And I select option "1 - Domain Map" from combobox "plugin_archimap_graphtypes_id"
		And I select option "test" from combobox "groups_id"
		And I select option "test" from combobox "users_id"
		And I press "Add"
		And I should see a message "Item successfully added:"

@javascript
	Scenario: Autocomplete
		Given I am on "/plugins/archimap/front/graph.php"
		When I search on "Name" from combobox "criteria[0][field]"
		And I fill in "criteria[0][value]" with "Test Behat-Mink"
		And I press "Search"
		And I follow "Test Behat-Mink"
		Then I should see the field "name"
		And I fill in "name" with "Test Behat-Mink with diagram"
		And I press "Save"
#		And I should see a message "Item successfully updated:"
		Then I follow "Drawing Pane"
		And I wait 1 s
		And I click on text "Decide later"
		And I follow "GLPI Assets"
		And I drag and drop stencil 1
		And I doubleclick cell 1 and fill in "glpi" and select item 5
		And I drag and drop stencil 2
		And I doubleclick cell 2 and fill in "glpi" and select item 1
		And I drag and drop stencil 3
		And I doubleclick cell 3 and fill in "sappr" and select item 1
		And I drag and drop stencil 4
		And I doubleclick cell 4 and fill in "cloud s" and select item 1
		And I drag and drop stencil 5
		And I doubleclick cell 5 and fill in "sap" and select item 1
		And I drag and drop stencil 6
		And I doubleclick cell 6 and fill in "retl" and select item 3
		And I drag and drop stencil 9
		And I doubleclick cell 7 and fill in "test" and select item 1
		And I follow "File"
		And I click on text "Save"
		And I should not see a message "Unsaved changes. Click here to save."
		And I follow "File"
		And I click on text "Exit"
		And I press "Save"

@javascript
	Scenario: Preferences
		Given I am on "/plugins/archimap/front/graph.php"
		When I search on "Name" from combobox "criteria[0][field]"
		And I fill in "criteria[0][value]" with "Test Behat-Mink"
		And I press "Search"
		And I follow "Test Behat-Mink"
		Then I follow "Drawing Pane"
		And I wait 1 s
		And I follow "File"
		And I click on text "Preferences..."
		And I click radio button "true" of "displayIconOnEdge"
		And I click on text "Save"
		Then I should see the image "Tibco" on cell 7

@javascript
	Scenario: Deleting an existing diagram
		Given I am on "/plugins/archimap/front/graph.php"
		When I search on "Name" from combobox "criteria[0][field]"
		And I fill in "criteria[0][value]" with "Test Behat-Mink"
		Then I press "Search"
		And I check search result 1
		And I select massive action "Put in dustbin"
		And I press "Post"
		And I should see a message "Operation successful"
		Then I click on ".lever"
		And I check search result 1
		And I select massive action "Delete permanently"
		And I press "Post"
		And I should see a message "Operation successful"

