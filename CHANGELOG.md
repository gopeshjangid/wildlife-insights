# Changelog

## Unreleased

### Added

### Changed

### Fixed

## 2022-02-18

### Added
- Delete subproject functionality
- Delete location functionality
- Delete device functionality

### Fixed
- Subproject deployment list modal ui is broken

### Changed
- UI changes for gcp bucket image upload in test and dev environment

## 2022-01-28

### Fixed
- CTRL+B shortcut overwrites the IDs of recently catalogued images
- SAML refresh token functionality is not working
- "Add Identification" is not working when there is no identification for an image

### Changed
- Upload modal limits location results in dropdown menu
- Enabled taxonomy filter for sequence project and added filename sorting in identify and catalogued pages
- In image upload modal - fixed bug for limiting of records in project, camera and subproject list

## 2022-01-07

### Fixed
- Can't add multiple species to an image

### Changed
- Fixed refresh token for SAML
- Refined refresh token implementation
- Adjust datafiles sequences changes for preview modal
- Wait and track progress of adjust datafiles sequences api while uploading images
- Disabled sequence taxonomy filter query

### Added
- Integrated new private data download api
- Improved UI upload process with filename uniqueness
- Integrated new graphql-data-file endpoint in identify and catalogued pages

## 2021-12-03

### Fixed
- Can't upload photos to an existing deployment

### Changed
- Update bug report link
- Restricted identify/catalogued filters for projectType only 
- Remove "Analysis" tab from all project and initiative pages
- Disabled sequence taxonomy graphql query

### Added
- Images of humans are not deleted in sequence projects
- Upload image error reports send incorrect information

## 2021-11-13

### Fixed
- Invalid sequence type error when trying to edit a sequence ID
- Age/Sex not being saved in sequence ID if the WI Taxon ID is the same
- Invalid Group size count in sequence type project

### Changed
- Increase image upload size to 20mb

### Added
- In images grid, add medium thumbnail view option
- In image preview modal, add option to view full resolution image from UI
- Sort images based on timestamp and filename

## 2021-10-18

### Fixed
- Unable to tag another identification of "blank images" on Catalogued tab

### Changed
- Sequence generation in progress for a week after upload
- Bursts and Sequences skip over a burst/sequence when clicking "Save and next"
- Modified maximum embargo time to 48 hours

### Added
- Show most recent IDs in the bulk selection

## 2021-09-24

### Changed
- Update to Bursts - Apply to all
- Limit the Species filter in Identify/Catalogued to only the species or deployments found on that page
- Add new images in old sequence then images get automatically identify same as catalogued images

### Fixed
- Update deployment bug

## 2021-08-27

### Changed
- Update text for project placeholder
- Change format of IDs lables and provide deselection function
- Update error message on project update
- Sequence changes for burst design and fixed save identification
- Updates to Sequence interface
- Organization summary stats
- Remove All ids in edit identification
- Image cache for Identify and Catalogue image preview

### Fixed
- deployment table enddate filter timezone issue

## 2021-08-06

### Changed
- Removed notranslate tag
- Removed confirm popup after user confirms once
- Bulk sequence identification

### Added
- Bursts redesign
- Project Type field in Project Details

### Fixed
- Deployment table doesn’t show all records
- Embargo text not shown on all ark pages

## 2021-07-16

### Added
- Update display when an Organization Viewer has no project role

### Changed
- Deployment table not show all records
- Make count as optional field

### Fixed
- Other bait type not recorded

## 2021-06-25

### Added
- Add info on when project's first embargoed deployment is made public
- Edit Identification for Sequences

### Changed
- In the Image identification modal, rename the Behavior field to Individual ID
- Image upload - Implement solution to handle ‘connection breaks’ from UI. 
- For sequences in the Catalogued page - remove text "Present in"
- For projects in an initiative - change the project hyperlinks to point to "organization and project"

### Fixed
- Update message when a user invites an account that doesn't exist in WI
- Map inconsistence on Organization level
- Fixed "No router instance found"
- Organization Editors and Contributors can't create projects

## 2021-06-04

### Added
- Limit public download to 500,000 records
- More details to the main Explore page for filtered results
- Added info button to Identified Species charts

### Changed
- Integrated api changes for delete deployments
- Modified graphql keys in advance filter for embargo
- Integrated api changes for sequence filters in identify and Catalogue
- Completed api integration for public download data list

### Fixed
- Embargo disappearance on project update

## 2021-05-14

### Added
- UI for delete deployments functionality
- Summary/list of downloaded data in notification page
- Display ARK link as hyperlink in public project page

### Changed
- Reset basic and advanced filters on navigating away from explore page
- Date format in advanced filter changed to have both date and time
- Removed BETA from the Wildlife Insights logo
- UI changes for Sequence projects

### Fixed
- Fixed issues with continent, country and embargo advanced filters
- Updated embargo text in ark page

## 2021-04-22

### Added
- Added shortcut key description to the single image view modal
- Sensitive species location requests for notification page
- Display identifications for sequence based projects
- Api integration for sensitive species request
- Added text on Bulk upload screen and deployment creation screen
- Force user to logout if 401 error status occured
- Added shortcut key Ctrl+J for No bounding boxes 

### Changed
- Removed timestamp exif utilizing exif.js
- Update public download confirmation text
- Change text on upload modal
- Resize Accept, Edit, Mark as blank buttons on the single image view modal
- Update text on Contact data provider form
- Change text on Explore page to Download data
- Removed download metrics section from notifications page

## 2021-04-02

### Added
- Added shortcut key for Ctrl+D - to download an image
- Added support for SAML authentication
- Added help links to manage page
- Download all project data from DOI page
- Longitude and latitude validation

### Changed
- Removed count keys for identifications and locations
- Informative error message for upload errors
- Build Request exact locations Modal in public ARK page
- Explore page - remove image preview from dot

### Fixed
- Bulk deployment upload bug
- See the deployments details when a deployment is at the same location
- Images fail to upload if larger than 1mb
- Can't see list of cameras if the user doesn't have a role in the organization

## 2021-03-12

### Added
- Added shortcut key for Ctrl+H - to highlight an image
- Added shortcut key for Ctrl+Y - for Yes (bounding boxes)
- Added shortcut key for Ctrl+S - to save changes when editing an Identification
- Added shortcut key for Right arrow - to move to next image or group of images
- Added shortcut key for Left arrow - to move to the previous image or group of images
- Added shortcut key for Ctrl + right arrow - to move to the next image within a "burst" or "sequence"
- Added shortcut key for Ctrl + left arrow - to move to the previous image within a "burst" or a "sequence"
- Added shortcut key for Up arrow - zoom in
- Added shortcut key for Down arrow - zoom out

### Changed
- Removed option calls
- Handle UI validation - Deployment name, devices name should be unique in UI
- See the deployments details when a deployment at same location

### Fixed
- Initiative roles list should not include contributor
- ARK page is loading incorrectly
- Date/Time read is incorrect for images between 12am - 5am

## 2021-02-19

### Added
- Initial changes for supporting sequences as burst in identify/catalogue page
- Public image access
- Shortcut keys for edit identification, accept ids and mark as blank
- Mesage api integration for notification page

### Changed
- For login to manage page optimization, delayed api calls for nav drawer until clicked
- Removed the Identify and Catalogued tabs from the Organization, Initiative and Overview pages

### Fixed
- Wrong embargo configured on ark page

## 2021-01-29

### Added
- Notification page for public downloads
- Project tagger role
- Contact data provider - Integrate api call and apply necessary validations

### Changed
- Better error message when a new user hasn't verified their email
- More relevant species list is displayed when editing an ID
- Increased max embargo value from 24 to 48
- Validation: Quiet period setting should not accept negative values
- Fixed the issue for incorrect exif datetime populated for a datafile upload

## 2021-01-08

### Added
- Add recaptcha or human verification on sign-up
- Add external signin link on signin page
- Public download data request workflow
- Contact data provider from the ARK page

### Changed
- Disable upload button for public accounts
- Remaining functionality for bounding boxes on single images
- Restructure private summary cards for less api calls

### Fixed
- Reduce login to manage page transition time

## 2020-12-18

### Changed
- Display all scientific name ID fields when computer vision returns a result
- Limiting the results shown in the Taxonomies filter

### Added
- New roles and permissions (Project Contributor)
- Validate that deployment start date is before deployment end date
- View project details on the Organization & Initiative Summary map

## 2020-11-27

### Added
- Public account registration workflow

### Changed
- Added citationInfo, sensitive species and species per image in public ARK page.
- Increased file size limit for image upload to 10mb

### Fixed
- Public advanced filter issues

## 2020-11-06

### Changed
- Corrected survey dates displayed in summary page
- Public advanced filters on the explore page
- Expanded certain categories on Advanced filter screen

### Added
- Public ARK page created for each public project

## 2020-10-16

### Added
- Public advanced filters on the explore page

### Changed
- Summary page analytics information - cards and charts now fetch their information individually using getAnalyticsByParameter api call
- Changes to project details fields - reordered/removed fields in project details screen and made credit line a free-form text
- In private data download, changed message for in-progress operation

## 2020-09-25

### Added
- Display number of images/bursts resulting from query
- Private data download package refresh: Analysis & implementation

### Changed
- Reordered/modified summary statistics in project, organization and initiative pages
- Removed Project Settings fields "Public Latitude" and "Public Longitude" from project details
- Update text for Edit Date and Time modal
- Changed request workflow/messages in private data download package, added last download request time
- Accept suggestion and confidence for CV are now handled based on mlIdentification flag in identificationMethod
- Account details page for public and private accounts
- Identified_by should populate the Author field

## 2020-09-04

### Added

- Users who have signed up and verified their account can login into the application
- Non whitelisted user don't have permission to manage data.
- Display account access table on User profile page
- Edit the date and time of all images in a deployment
- author_name and accept_suggestion for CV identification are now handled based on identificationMethodId.
- Display common name for an identification, when all other values are empty.

### Changed
- Displaying identifiedObjects on the basis of taxonomyId, relativeAge, sex, markings, behavior and remarks with aggregated count.

## 2020-07-24

### Added

- Ability to sort images by "Last Modified" in the Catalogued tab
- Search for images by filename in Identify and Catalogued tabs
- Add number of animals to an identification
- Ability for an organization owner to change the parent organization of a project
- Apply longer burst setting. Changed the maximun burst setting to 600
- Bulk image selection in thumbnail view of Identify and Catalogued

### Changed
- Closing calendar popup when clicking outside of the calendar
- The default calendar dropdown should show one month
- The deployments creation/edit form field label changed from "Sub project" to "Subproject"
- Changed deployment Bait Type tooltip If Project Bait Use=No
- Edit date range manually
- User can reset date after changing date manually
- Update calendar month in popup after change date manually.
- Displaying error message (received from API) while add/edit location.

## 2020-06-26

### Added

- Using project short name instead of project name
- Added sorting and filtering on camera, locations and deployments
- Create date range filter component
- Handling deployment bait type based on project's bait use
- Exposed admin email and name at project details page
- Displaying 48 hours image deletion text message while uploading image
- Allow user to select sub project while creating/editing deployment
- Allow user to create/edit sub projects
- Allow user to list subprojects
- Allow user to list deployments of subprojects
- Added subproject filter on identify and catalogue tabs at organizaion, project and initiatives level

### Changed

- Changed CSS as per new wireframe
- Merged Sprint1 feedback code

## 2020-06-05

### Added

- Allow user to create new “deployment” from project detail screen
- Added “Create deployment” button on deployment list
- Add the “Quiet period setting” field while creating/editig deployment
- Allow user to create new  “Location” and “Camera” while creating/editig deployment
- Allow user to create new “location” from project detail screen
- Added “Create location” button on location list
- Added all required “deplyment metadata” and “location metadata” while uploading image
- Added decimal places validation for location latitude/longitude. Minimum 4 and maximum 8 decimal places would be required

### Changed

- Replaced latitude/longitude field with latitudeStr/longitudeStr while creating/updating/lising locations
- Replaced public latitude/longitude field to latitudeStr/longitudeStr while creating/updating project
- Combined location and deployment map into one

### Fixed

- Button alignment issue while creating new deployment, location and camera

## 2020-05-01

### Added

- Add the “Make” field for the cameras

### Fixed

- Fix an issue where the cameras, camera devices and locations modals might display details of previously clicked items

## 2020-04-01

### Added

- Add a new image placeholder for the images tagged with humans
- Automatically pause and resume the upload of photos when the internet connection is lost and eventually returns
- Photos submitted for upload can now be reported as with an unknown status if the connection is lost
- Let the user delete their initiatives
- Add new section where admin users can approve/reject new users
- Send an email to the new users to tell them about the account validation process

### Changed

- Remove all the default POIs and interactive elements provided by Google from the maps
- Limit the project short names to 40 characters
- Upload the photos alphabetically (the order cannot be guaranted because of the concurrency)
- Rename “Project blank images” field as “Project blank images removed” in the project form
- Allow the user to use the keyboard arrows to move between photos when the focus is on specific elements of the modal
- Update the text displayed to the user when their email address is confirmed
- Simplify the “Status” filter: reduce the number of options and only allow one value at a time
- Let the user attach a project to any initiative (independently from whether they belong to the same organization)
- Display up to 100000 accounts to validate in the admin section (previously 999)
- Limit the number of uploads categorised as unknown to at max 6 per connection loss

### Fixed

- Fix an issue where the photos identified as blank by the CV couldn't be identified by the user
- Fix an issue where photos that were successfully uploaded were reported as failed uploads (now reported as with an unknown status)
- Tell the user when a bulk highlight didn't go well
- Fix an issue where the “Explore Data” item of the header might not be displayed as active when viewing the page
- Fix an issue where the app would fetch the list of languages on every page navigation
- Fix an issue were the data in “Explore Data” would be inconsistent (it would depend on if the user would be logged in and with which account)

## 2020-01-23

### Added

- Let the user override the default location of the projects for the Discover page
- Add an “Analysis” tab to the initiatives
- Allow the user to download the data of the “analysis” charts
- In the permissions modal, display whether the users have access to the entity because of their access to a parent organization or initiative

### Changed

- Make it clearer some photos can't be deleted and why (in the bulk actions bar and preview modal)
- On Discover, display the name of the organization below the project's one in the project details view
- Order the photos by date taken, oldest first
- Change the content of the tooltip to download an entity's data
- Replace the custom basemap by Google's default one
- Reduce the number of queries made to the API to retrieve the identifications of a burst
- When viewing bursts, only display the pagination component when relevant

### Fixed

- Prevent the app from crashing when Transifex is not available
- Allow the user to tag photos with sub-species and objects in the preview modal
- Fix an issue where two scrollbars could be displayed in the main sidebar
- Fix an issue where the preview modal would stay blank after deleting the last photo of a burst

## 2019-12-06

### Added

- On Discover, add a new button to reset the filters
- Add new feature type fields to the deployment form
- New email templates for account review/whitelisting workflow
- Auto-complete the country field when creating a new location in the upload modal

### Changed

- When creating a new deployment in the upload modal, its name is now auto-populated based on the name of the location and the deployment's start date
- In the taxonomy filter, show the species present in the entity, first, and as “top” results

### Fixed

- Fix an issue where the user wouldn't be able to update the logos and photos of the initiatives

## 2019-11-21

### Added

- Let the user create new cameras
- New fields have been added to the deployment form
- Zoom in on the markers, when clicked, on Discover
- Display “Coming soon!” in a tooltip when hovering the disabled button to download Discover's data
- Add a "Beta" tag on the logo
- Add a setting to the projects to disable their analysis
- Display an error message when the user gives an entity a name that is already taken
- Add a new project filter on the Discover page

### Changed

- Prevent the breadcrumbs from displaying links to entities the user doesn't have access to
- Reduce to 5s how long a notification is displayed on screen
- Change the name of the Discover page (now called Explore Data)
- On Discover, rename “Camera trap images” as “Camera trap records”
- On Discover, remove the search project input
- On Discover, change the behavior of the map's markers so they either open the project details or add the project as a filter
- On Discover, URLs of individual project pages use the project slug provided by the API as last component of the URL path

### Fixed

- Fix an issue where the breadcrumbs wouldn't always display the name of the entities
- Fix an issue where the user wouldn't be brought back to the first page of results when filtering the images
- Fix an issue where the labels of the bar charts could be cut on the side
- Fix an issue where the homepage could crash when some project wouldn't have a thumbnail

## 2019-11-05

### Changed

- Make more fields required in several forms
- Allow the translation of the validation error messages
- The same dates are shown in Discover, for all the users, no matter which time zone they use
- Order the photos by date taken (most recent firt)
- The header logo now links to the launch website (https://www.wildlifeinsights.org/)
- Change the behaviour of Discover's search input
- Use a progress bar to indicate some data is loading in Discover

### Fixed

- Fix an issue where the filters (brightness, etc.) applied to the photos in the indentification modal could stop applying
- Fix an issue where the cameras, locations and deployments forms would crash when saving the changes
- Fix an issue where clicking the logo of a public initiative would crash the app
- Fix an issue where the "Identified by species" chart would not display the correct top species
- Fix an issue where newly-uploaded images wouldn't be displayed in the Identify tab if the user would already be on the page
- Fix an issue where the app would crash when identifying the last image of the last page of an entity

## 2019-10-29

### Changed

- Temporarily hide some metrics from Discover

### Fixed

- Fix an issue where the app would crash under certain conditions when editing a camera deployment

## 2019-10-28

### Changed

- Update some metrics and their descriptions in Discover, and the dynamic sentence in the sidebar

## 2019-10-24

### Changed

- Display the missing metrics (Wildlife images, Countries and Camera deployments) in Discover and the Summary pages

## 2019-10-23

### Changed

- Update the content of the Privacy policy and Terms of service
- By default, display the minimum and maximum dates of the observations in the overlay message on Discover
- Update cards on the Discover page; and project, organization and initiative summaries
- Update default sentence on the map of the Discover page

## 2019-10-17

### Changed

- Prevent the badge with the number of photos to identify from overlapping some other text
- Temporarily disable the download of the Discover data

## 2019-10-16

### Added

- Allow the user to download the data of the Discover page
- Retry the requests if they fail because of the network

### Changed

- Display the metadata fields for all the projects (even for the project creation)

### Fixed

- Fix an issue where header shadow were not over charts on Discover page
- Fix an issue where the entirety of the Discover data would be refetched when opening the sidebar
- Fix an issue where the confirmed identification shown in the UI wouldn't be the correct one
- Fix an issue where the confidence level of the CV wouldn't be displayed correctly in the history of the identifications
- Fix an issue where the taxonomy filter of the Identify and Catalogued tab wouldn't work
- Fix an issue where the app would crash when the user would access a non-existing or access-restricted entity (now a message is displayed)

## 2019-10-07

### Added

- Check if the user has the correct permissions to perform certain actions and disabled them otherwise
- Add new metadata fields to the project form
- Button to collapse the sidebar in Discover and show a text with selected filters
- Added charts inside project in Discover page
- Add more analytics on the Discover page
- Add page tracking using google analytics
- Add charts in the Summary pages
- Inform the user when the Discover page is loading data
- Display information about the markers on Discover while hovering them

### Changed

- Updated filters in Discover page's sidebar
- Changed year selector for datepickers in the Discover page
- Removed projects list in Discove page
- Add a description to the analytics number on the Summary pages and on Discover
- Allow the user to specify which species to filter by in Discover
- Rename «deployment» as «camera deployment» throughout the app
- Update the licenses options that can be attached to a project
- Remove an hard-coded initiative example from the sidebar
- Change some texts related to the sign up process due to the new validation flow

### Fixed

- The filter component doesn't display correctly the selected option for specic options.
- Fix an issue where the public page of the initiatives wouldn't stop loading
- Fix an issue where the alternative texts of the partner logos of an initiative wouldn't be saved when creating it
- Fix an issue where map doesn't load when a project location doesn't exist
- Fix an issue where some photos couldn't be identified
- Fix an issue where an error would be displayed when identifying photos with humans
- Fix an issue where the badges with the photos yet to identify wouldn't update after identifying
- Fix an issue where the user wouldn't be able to upload photos on the Discover page
- Fix an issue where the permissions of the user might not load
- Fix an issue where number overlaps the pie chart on the Discover page

## 2019-09-19

### Added

- Add a new env variable: GOOGLE_MAPS_API_KEY.
- Ask the user to self-certify their age when signing up
- Add the content of the terms of service and privacy policy pages
- Add new license attributes to the project form
- Add new description and confirmation for the embargo field of the project form
- Inform to the user about removal policy when uploading photos

### Changed

- Add database name to MongoDB connection string URI
- Use Docker volumes for persistent storage of MongoDB data when developing locally
- Tune MongoDB reconnection options and TCP keepalive options to prevent losing connection to database
- Replace Leaflet by Google Maps as the map provider
- Update parameter name of `getProjectParticipants` and
  `getOrganizationParticipants` to those required by recent updates to the
  GraphQL API
- Remove the mandatory confirmation to highlight photos
- Changed status filter to support multiple selections
- Update the description of the acknowledgements field of the project form
- Removing upload item when user clicks on Identify after upload a photo
- Don't send delete request anymore when photos are tagged with humans
- Removed Google's logo in identication modal
- Prioritise common names over scientific names when the user has the setting on in their profile
- Update how internally taxonomies are matched and linked to identifications (using UUIDS)
- Change the method to detect identifications with humans

### Fixed

- Fix a style regression where the content of a tab might be too close to the tab itself
- Fix an issue where the location modal wouldn't display the country of the location
- Fix an issue where the photos filters would crash the app on staging and production
- Fix an issue where the logo and cover image of an initiative could get deleted when the form would be submitted
- Fix an issue where the user wouldn't be able to open the sidebar («Projects list») on narrower screens
- Fix an issue where the upload progress wouldn't be updated in the UI
- Fix an issue where the bulk actions panel UI wouldn't display the correct number of selected photos
- Prevent the app from crashing when accessing the metadata of a photo whose deployment isn't associated to a location
- Fix spread operator in Microsoft Edge browser
- Fix typo for metadata field in project form
- Fix an issue where the upload modal would display out of date information

## 2019-08-15

### Added

- Add the UI to download the data of an entity
- Add the possibility to see, edit and revoke the roles of the users and invite new ones to entities
- Display a notification with the list of entities the user has access to, the first time they log in

### Changed

- Increase the load of the homepage and the speed of navigation from it (with a temporal fix)

### Fixed

- Fix an issue where the Discover page would display inconsistent information
- Fix an issue preventing the user from editing the cameras
- Fix issues with the date picker which could lead to a crash of the application
- Fix regression bugs that would crash the pages containing the date picker and the Discover page

## 2019-07-18

### Added

- Add a breadcrumbs component at the top of the pages
- Let the user select a photo from the identification modal (for bulk actions)
- Add more description to the fields of the forms
- New homepage: Overview is replaced by the list of projects
- Add a tutorial in the form of steps in the homepage
- Let the user highlight individual photos
- Let the user filter the photos by highlighted
- Let the user download a report of the upload when it failed
- Let the user re-use a location in the upload modal
- Display errors when the location or deployment can't be created in the upload modal
- Automatic deployment name in the upload modal
- Prevent the user from choosing dates that don't make sense
- Let the user highlight several photos at once (bulk action)
- Let the user group the photos into bursts dynamically
- Let the user decide whether or not to display the locations of an initiative in its public page
- Improve the SEO of the URLs of the initiatives
- Let the user identify bursts of photos
- Display the confidence of the Computer vision, when available
- Let the user delete individual photos
- Let the user delete several photos at once (bulk action)
- Add Hotjar tracking script (executed only on production)
- Add a map to the location form
- Display the number of non-identified photos in several places throughout the app
- Let the user cancel an upload
- Add the list of projects of the organizations and initiatives in their summary page
- Let the user upload a logo, a cover image, photos and partner logos to the public page of the initiatives
- Add a setting in the user profile so they can use common names instead of scientific ones
- Display the common name of an identification if the user set the setting on
- Add a setting, at the project level, to specify whether photos identified with humans should be automatically deleted
- Delete the photos identified with humans (at identification time), if the project has the setting on
- Add a license attribute for the projects
- Add a visual aid for the embargo field of the projects (indicating the unit is months)
- Indicate to users when they have read-only access to an entity
- Display a warning when highlighting photos (explaining they are made public)
- Add the new Discover public page

### Changed

- Transform the sidebar into a drawer (visible only when requested)
- Rename the Archive tab as "Catalogued" to avoid user confusion
- Let the user know what happened to photo(s) they've just identified in a notification
- Update the styles of the identification modal
- Improve the error messages of the forms (now inline)
- Make the forms faster to display (display the cached data, if any)
- Make the title of the pages faster to display (display the cached data, if any)
- Reduce the number of error notifications (use inline errors instead)
- Update the style of the notifications
- Upload status moved to the global notification component
- Remove the list (table) view of the photos
- Update the UI used to change the sorting of the images
- Order the results by name in the input to search a project
- Use links that don't force a reload of the app
- Try to re-upload the photos that failed to do so the first time
- Only create the location and deployment when the user initiate the upload
- Display the name of the country in the list of locations
- Redesign the public initiative pages
- Reduce significantly the loading time of the homepage and image grid (in case of direct access)
- Reduce the size of the total JS bundle by nearly 40%
- Update the user tooltip (in the main menu) and the language selector
- Remove the "Analyze" tab from the top menu
- Replace the page fade transition with a progress bar at the top
- Increase page navigation speed by more than 50%

### Fixed

- Fix wrong link for the button to go to the Identify tab after an upload
- Prevent the sidebar from reloading its content when the user navigates
- Fix a bug where the title of the current organization might not be displayed
- Fix a bug where some notifications wouldn't be announced by the screen reader
- Make sure the notification are maintained after navigating
- Fix a bug where the metadata of the photo wouldn't load
- Correctly register the date a photo was taken at the upload
- Fix an issue where the user might not be able to open the upload dialog
- Fix a bug where the photos could be uploaded twice
- Fix a bug where the user wouldn't be able to edit a deployment
- Correctly display the current date as a placeholder for the datepickers
- Fix a bug where a non authenticated user wouldn't be redirected to the login page
- Fix an issue where screen readers would be unable to announce some field information in the forms
- Fix an issue where the text typed in the wysiwygs would be displayed backwards
- Fix an issue that prevented the analytics demo from working
- Fix an issue where the filters of the analytics demo page would display "undefined"
- Prevent an error from showing when creating an initiative without a logo and a cover image
- Fix an issue where the identifications of the previous photo(s) might be shown after identifying a photo or burst that is in the first position
- Fix a bug where the projects couldn't be saved when the embargo field would be filled
- Fix a bug that prevented the user from editing an organization

## 2019-02-14

### Changed

- Display correct information in the Summary tab of the initiatives.

### Fixed

- Allowing autocomplete for the login form.
- Fixed translations for pagination and identification sidebar.
- Redirection to the page requested after login.

## 2019-02-07

### Added

- Display common name of the species when identifying.
- Add a custom scrollbar to the sidebar and the column view.

### Changed

- Improved transifex implementation.
- Replace the progress bar by the loading spinner.
- Announce the notifications to the screen readers.
- Disabling "Save changes" / "Create" button for the forms when is working.

### Fixed

- Re-selecting image after remove them in upload modal.
- Form validation before upload.
- Search by taxonomy.
- Scrollbar styles for project nav.

## 2019-01-29

### Added

- Button to accept the suggestion of the CV.
- Added a language selector in profile form to change interface language.
- Added a new env variable called TRANSIFEX_API_KEY.
- Let the user create an initiative.
- Let the user attach a project to an initiative.
- Added a wysiwyg for the purpose of the initiatives.
- Added loading for project creation.
- Added loading for organization creation.

### Changed

- Sort the photos by upload date (instead of the date they were taken).
- Let the user expand/contract the identifications (when editing).
- Cache strategy changed to `cache-and-network` for images requests.
- Updated dockerfile to make easier test production env.
- Cluster the markers on the maps
- New mechanism for upload and notification for uploading.
- Updated queries for getOrganization.
- Added default fetch policy in apollo client initialization.

### Fixed

- Legend colors for analysis charts.
- Disabled detect language on browser.
- Language selector sometimes doesn't appear.
- Some pages doesn't check authentication.
- Issue filtering taxonomies.
- Deployments list.

## 2019-01-17

### Added

- Loader for getting url before upload.
- Added filter for blank, not blank, tagged and unknown images. In archive and Identify tabs.

### Changed

- Changed country input, now it is a select.
- Removed prettier (code review).
- Theme and font colors has been reviewed.
- Reviewed styles for header and menu.
- Reviewed styles for tabs.
- Reviewed styles for project navigation in sidebar.
- Reviewed styles for identification modal.
- Reviewed styles for filters in Identify.
- Reviewed styles for tooltips and links.

### Fixed

- Put date manually in datepickers.
- Error requesting new password.
- Removed warning from console.

## 2018-12-11

### Added

- Instructions for installation in README.md file
- Redirect the user to the page they wanted to visit after signing in.
- Added splash image for iOs.
- Show an error when selected file is bigger than 5MB.
- Removed limit for number of files to upload. Show a icon for more than 16 files.
- Fixed sidebar.
- Fix the viewport to a minimum 1024px width.

### Changed

- Display the selected options of the filters at the top of the list.
- Group the taxonomies by family, genus and species in the identify tab. Family and Genus are on the top of the list.
- Enhance the validation of the project and organization forms.
- Enhance the validation of the camera, location and deployment forms.
- Get the status of the images from the API instead of determining it in the front-end.
- Scroll to the top of the image list when the pagination changes.
- Change the default page size and page options of the image list.
- Update the style of the fixed actions buttons (Identify tab).
- Fix the content of the app manifest.
- Validate the log in forms on submit.
- Clarify the date of the photos are the date they were taken.
- Enhace the usability for deployment selector in upload modal.

### Fixed

- Upload: thumbnail generation sometimes doesn't work properly.
- Upload: upload modal didn't appear again after close modal.

## 2018-12-05

### Added

- Real notification for identification status.
- User profile edition.

### Fixed

- Using POST instead GET in login and signup forms, in order to not show user data in URL in case Javascript doesn't load correctly.
- Don't show scrollbar when upload modal is open.
- Don't show scrollbar when identification window is open.
- Only fetch user once in app.js, it will make page transition faster.
- Update files selected counter in upload modal.
- Typo fixes

## 2018-12-04

### Added

- Let the user reset their password if they've forgotten it.
- Add the terms of service and privacy policy pages (with fake content).
- Let the user add/edit the cameras of an organization.
- Let the user attach a camera to a deployment.
- Add an introduction in the analysis page.
- Limitation size for uploading files to 5MB.
- More uploads's status messages.

### Changed

- Make the color scale more legible for the "Species richness" chart in the analysis page.
- Properly style the emails sent to the user.
- Upload photos 6 by 6 sequencely (to not block browser).
- Improved progress dialog styles.
- Changed spinner for upload, half for upload process and the rest for identify process.

### Fixed

- Various bugs fixes.
- An error doesn't allow to the users to upload again another photo.

## 2018-11-28

### Added

- Add custom basemap to the maps (production only).
- Display the locations on the map in the summary page of the overview and organizations.
- Add the possibility to see and edit deployments and locations in the project details.
- Add the "Detection rate" chart in the analysis page.
- Add legends to the charts in the analysis page.
- Add upload and identification status while uploading.
- Let the user change the page size of the grids/tables.
- Allow the user to directly go to a page with the new pagination component.
- Display the identification status of the photos in the grids/tables.
- Allow the user to identify the photos in bulk.

### Changed

- Design refinements.
- Update the design of the analysis page to include a demo.
- Changed styles and UI for progress dialog.
- Limit for uploads (max 5MB).
- Display the family names first in the lists of taxonomies.
- Make the deployments filter asynchronous.
- Display the real metadata of the photos and some of their EXIF data.
- Never delete the user's previous identification, just add new ones.
- Identify tab now only shows the photos to not yet identified.

### Fixed

- Various bugs fixes.
- Fixed session expiration issues.
