all: apple

apple:
	osascript apple_script/run.scpt

save:
	node save-to-location.js


rmf:
	rm fichas-stash/*