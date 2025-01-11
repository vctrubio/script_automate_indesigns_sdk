# Structure Plan

A dir that contains all the property, has an execution cmd for AllProperties or IdProperty.

[DIR]
    -PropertyId
        -JSON-Fetch-Contentful.json --only chmod +r
        -JSON-Detetached-Info.json
        -Images
            -a.jpeg ...
        -Makefile
        -Export PDF
        -Export Indgg

Export Function = to execute and format the PropertyId [DIR]  
    1. GET from Contenful API
    2. Verify the JSON if true: create DIR if not exist
    3. Play mode: single(find and replace) or all properties
    4. Create JSON-Fetch-Contentful.json
    5.     Function to run from JSON-Fetch-Contentful.json
    6. Download images into Images
    7.     Script to indgg -> PDF Indgg
    8. Detach-Info to later modify

## EXECUTION

- create from contentful's API -> fetch properties
- parse properties -> create indesign file (for easy UI modifications)
- read from indesign to create pdf
- script to automate, single or multiple properties

### MAKE CMDS

- prod | the ultimate production cmd
- apple | predfined osascript run
- save | save script to indesign dir for use
- create | create directories from contentfus API JSON Request
- read | execute the pdfs and indesign's from (create's directory)
- fetch | with fetch the contentful JSON into json-data/properties-data
- init | with fetch, create, read
- rmf | remove the test-property directory
- do | noderunnder script with FILE=PROPERTYURL
