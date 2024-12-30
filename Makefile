all: apple

apple:
	osascript apple_script/run.scpt

save:
	node ./src/save-to-location.js


rmf:
	rm fichas-stash/*