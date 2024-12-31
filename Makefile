all: apple


prod: 
	@osascript apple_script/run.scpt && node ./src/save-to-location.js

apple:
	osascript apple_script/run.scpt

save:
	node ./src/save-to-location.js


rmf:
	rm fichas-stash/*