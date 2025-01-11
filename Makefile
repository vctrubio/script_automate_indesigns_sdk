all: prod


prod: 
	@echo 'hello man'
	@osascript apple_script/run.scpt && node ./src/save-to-location.js

apple:
	osascript apple_script/run.scpt

save:
	@node ./src/save-to-location.js $(FILE)
# Prevent Make from interpreting the argument as a target

create:
	@node ./src/js-create-dir.js

read:
	@node ./src/js-read-write.js


rmf:
	rm fichas-stash/*