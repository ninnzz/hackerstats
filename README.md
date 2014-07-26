Freedom! Node Back-end
====================

Running the Application
---------------------

Run this once or when there's a new package used
<!-- language:console -->

	npm install

Run the server
<!-- language:console -->

	npm start



Contributing
---------------------

This projects uses the Feature Branch Workflow
[read more here](https://www.atlassian.com/git/workflows#!workflow-feature-branch)

1. Create a branch with the feature as its name (use snake case on feature name)

	`git checkout -b login`
2. Do your task, don't forget to commit
3. If first time to push, use `git push -u origin login` else `git push`.
4. Submit a pull request, merging your branch to master

In case your feature will need the updates on master, do the following:

<!-- language:console -->

	git checkout master
	git pull origin master
	git checkout your_branch
	git merge master
	// fix conflicts if there are then commit



Directory Structure
---------------------

<!-- language:console -->

	config/
		config.js			-- contains server configuration e.g. port, public directory
		router.js			-- contains routes
		scopes.js			-- contains scopes, automatically imported by config.js
	controllers/			-- contains controllers, duh.
	crawler/				-- crawler prototypes
	database/
		build.sql			-- contains build script for our mysql database
	helpers/				-- contains utility scripts
	lib/					-- contains middlewares, database wrappers, custom objects
	logs/					-- for production env only
	.gitignore				-- list of ignored files
	bw-server.js			-- crawler's server
	Makefile
	nodemon.json			-- nodemon's config
	package.json
	README.md				-- me
	server.js				-- main script for starting the server


Coding conventions
---------------------

  * single quotes on strings
  * use `===` for checking similarities
  * snake case on function names and variables
  * forget that global variables exist and how to make them
  * use `var` once per function scope, declare all used variables at the same time
  * `var` should be the first instruction after declaring a `function`
  * use tab indention, don't alter indentions, please.
  * examine available libraries and helpers
  * space after comma, reserved words and operators. observe spaces on the following:

	<!-- language:console -->

		if () {...
		while () {...
		for () {...
		function () {...
		1 + 1
		[1, 2, 3]
		temp = 1
		{property : 'value'}
  * make use of

		req.access_token
		req.user
		req.user_id
		req.user_data
		req.is_admin
	on creating a controller function.

  * brackets on all control flows

		if (temp === 1) {
			return {hi : 'hello'};
		}
		while (temp > 5) {
			i += 1;
		}
		for (;;) {
			do();
		}
  * use `next` to pass errors
  * top down function call order


Reminders
---------------------
  * Node.js uses non-blocking I/O, make sure to use `return` to end the function right away.
  * In Javascript, functions are first-class objects, thus don't be shy to have more than usual.
  * Use controlller's function as the main scope
