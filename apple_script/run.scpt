try
    tell application "/Applications/Adobe InDesign 2025/Adobe InDesign 2025.app"
        activate
        display dialog "Hello World! InDesign was successfully opened!" buttons {"OK"} default button 1
    end tell
on error errorMessage
    display dialog "Failed to open InDesign: " & errorMessage buttons {"OK"} default button 1
end try