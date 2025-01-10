on run argv
    set propertyUrl to item 1 of argv
    set jsScript to "var propertyUrl = '" & propertyUrl & "';" & "
        #include '/Users/trtp/Desktop/indesign_script/src/js-script-node.jsx'"
    
    log "Running InDesign script with property URL: " & propertyUrl
    log "JavaScript content: " & jsScript
    
    try
        tell application "Adobe InDesign 2025"
            -- Execute the JavaScript
            do script jsScript language javascript
        end tell
        return "success"
    on error errorMessage
        log "Error running script: " & errorMessage
        return "error: " & errorMessage
    end try
end run