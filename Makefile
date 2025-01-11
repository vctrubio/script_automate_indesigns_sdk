all: prod

prod: 
	@echo 'hello man'
	@osascript apple_script/run.scpt && node ./src/save-to-location.js

apple:
	osascript apple_script/run.scpt

save:
	@node ./src/save-to-location.js $(FILE)

new: create read

create:
	@node ./src/js-create-dir.js

read:
	@node ./src/js-read-write.js

fetch:
	@ts-node ./backend_only/backend-fetch.ts

rmf:
	rm -rf test-properties