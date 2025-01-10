on run argv
    set propertyUrl to item 1 of argv
    set workingDir to item 2 of argv
    
    try
        tell application "Adobe InDesign 2025"
            -- Just run without activating
        end tell
        return "success"
    on error errorMessage
        return "error: " & errorMessage
    end try
end run 