on run argv
    set propertyUrl to item 1 of argv
    set jsScript to "var propertyUrl = '" & propertyUrl & "';" & "
        #include '/Users/trtp/Desktop/indesign_script/src/js-script-node.jsx'"
    
    try
        tell application "Adobe InDesign 2025"
            do script jsScript language javascript
        end tell
        return "success"
    on error errorMessage
        log "Error running script: " & errorMessage
        do shell script "echo " & quoted form of errorMessage & " >> ~/Desktop/indesign_error.log"
        return "error: " & errorMessage
    end try
end run
