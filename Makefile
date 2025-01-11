all: prod

prod: 
	@echo 'hello man'
	@osascript apple_script/run.scpt && node ./src/save-to-location.js

do:
	osascript apple_script/noderunner.scpt $(FILE)

save:
	@node ./src/save-to-location.js $(FILE)

create:
	@node ./src/js-create-dir.js

read:
	@node ./src/js-read-write.js

fetch:
	@ts-node ./backend_only/backend-fetch.ts

pdf:
	@node backend_only/pdf_mover.js
	
init: fetch new

new: create read

rmf:
	rm -rf test-properties