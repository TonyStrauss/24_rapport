Prerequisites
=============
* closure compiler (brew install closure-compiler)
* gjslint (sudo easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz)
* qt (brew install qt) for jasmine-webkit-headless

Lint and Compilation
====================
I've been pleasantly surprised that the JavaScript ecosystem has far
stronger static analysis tools than does the Ruby ecosystem.  I think
that this is in large measure due to Google's efforts (Closure
Compiler, lint, GWT).  I generally prefer static to dynamic typing
because it catches problems more quickly.  The 24 module
therefore can be linted (see the Rake tasks) and is built by the
Closure Compiler.  The compiler assembles the different .js files into
a single director.js.

In order to build the 24.js module, run:

    rake js:compile

To invoke lint, run:

    rake js:lint

Note that gjslint is pretty inflexible, and so it's not integrated
into the build right now.  For one thing, it complains about lines
longer than 80 characters, and I disagree :).  So, I grep out the
errors I don't care about.

Rake
====
My build philosophy has been influenced strongly by experience with
make on a large scale.  I don't build if I don't need to.  I carried
this over to the Rakefile, which makes it look a bit different than the
standard Rakefile.  Rather than relying on named tasks, it mostly uses
file targets.  There are named tasks, but they're mostly just wrappers
around the file targets.  The Rakefile reads more like a Makefile,
and, in general, won't compile or run tests unless necessary.

The Rakefile puts all build artifacts into the "_build" directory with the name
of the build preceded by an underscore.

To blow everything away, run:

    rake clean

Unit Tests
==========
I chose Jasmine for JavaScript unit tests because it closely
resembles RSpec and because it has excellent Ruby integration.
Jasmine basically is a JavaScript unit testing framework that allows
the unit tests to be run in the browser.  There are two ways to
accomplish this:

* rake jasmine:ci, which runs the tests in the local browser
* rake jasmine, which launches a webserver that allows you to visit a
  localhost webpage and run the tests with any browser.

Note that the jasmine targets *always* run, regardless of whether or
not code has changed.  The jasmine targets were added automatically by
Jasmine, so I don't have control over their dependency analysis.

This in-browser testing is great, because ultimately the director
module will run in a browser.  It's also unfortunately quite slow, for
two reasons:

* The in-browser director module is compiled with closure (granted I
  could get around this)
* It needs to launch a browser

I also wanted a lightweight testing solution that would allow me to
iterate on changes very quickly.  In addition, I wanted something
headless.  I originally thought that I simply could use v8 or rhino,
but there's a lot of glue required and right now, I don't have the time to
track down all of the issues.  Instead, I choose the
jasmine-headless-webkit gem.  This launches a headless WebKit browser
and runs all of the tests.  While not quite as fast as a straight v8-based
solution, it's fast enough.
