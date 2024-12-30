try
    tell application "Adobe InDesign 2025"
        activate
        delay 2
        do script (POSIX file "/Users/trtp/Desktop/indesign_script/src/js-script.jsx") language javascript
        display dialog "Script executed successfully!" buttons {"OK"} default button 1
    end tell
on error errorMessage
    display dialog "Failed to execute script: " & errorMessage buttons {"OK"} default button 1
end try
