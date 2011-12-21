ENV['BUNDLE_GEMFILE'] = File.join(File.dirname(__FILE__), "Gemfile")
require 'rubygems'
require 'bundler'
Bundler.setup(:test)

require 'fileutils'
require 'yaml'

target_dir = "_build"
FileUtils.mkdir_p(target_dir)

ENV["TARGET_DIR"] = target_dir # We use this environment variable in jasmine.yml

desc "Remove all build artifacts"
task :clean do
  FileUtils.rm_rf target_dir
end

director_target_path = File.join(target_dir, "slideshow_director.js")

#
# Supposedly, closure can figure out the correct ordering by itself.  I have not found this to
# be the case, however, so specify the correct compilation order here.
#
# We also use this when passing files to Jasmine during headless testing.
#
director_source_files = [
    "js/24.js"
]

namespace :js do
  file director_target_path => [director_source_files].flatten do |task|
    closure_compile(task.prerequisites, task.name)
  end

  desc "Lint all JavaScript files"
  task :lint do |task|
    # We can't exec_and_throw until lint allows suppress line too long "errors"
    # http://code.google.com/p/closure-linter/issues/detail?id=16
    #
    # Also, the single-quoted vs. double-quoted string warning complains about JSON files
    # generated by Ruby.
    exec_and_return("gjslint --custom_jsdoc namespace,property -r js -r spec/js -r example | grep -v 'E:0110' | grep -v 'E:0131'")
  end

  desc "Compile all JavaScript files"
  task :compile => [director_target_path]

  #
  # The JavaScript test setup really only can use fixture files that are *JavaScript*.  I.e., I don't know
  # of a way to load JSON files reliably across headless webkit, v8, and rhino.  So, we convert our JSON fixtures
  # to JavaScript (sticking the content in a big FIXTURES hash) and include the JavaScript in our tests.
  #
  js_fixture_target_root = File.join(target_dir, "fixtures")
  json_fixture_source_root = "spec/fixtures"
  json_fixture_source_glob = File.join(json_fixture_source_root, "**", "*.json")

  json_fixture_targets = []
  Dir.glob(json_fixture_source_glob) do |json_fixture_source|
    json_fixture_target = json_fixture_source.gsub(json_fixture_source_root, js_fixture_target_root).gsub('.json', '.js')
    file json_fixture_target => json_fixture_source do |task|
      puts "Creating #{json_fixture_target}"
      FileUtils.mkdir_p(File.dirname(task.name))

      File.open(task.name, "w") do |file|
        fixture_name = File.basename(task.name, File.extname(task.name))
        file.write("var FIXTURES = FIXTURES || {}\n")
        file.write("FIXTURES[\'#{fixture_name}\'] = ")
        fixture_contents = File.read task.prerequisites[0]
        fixture_contents.chomp!
        file.write(fixture_contents)
        file.write(";\n")
      end
    end

    json_fixture_targets.push json_fixture_target
  end

  desc "Compile all JavaScript test fixtures"
  task :fixtures => json_fixture_targets

  js_fixture_relative_dir = Pathname.new(js_fixture_target_root).relative_path_from(Pathname.new("spec/js"))
  ENV["FIXTURE_DIR"] = js_fixture_relative_dir.to_s # We use this environment variable in jasmine.yml

  js_spec_files = Dir.glob("spec/js/**/*_spec.js")
  headless_test_marker_path = File.join(target_dir, "jasmine_headless.report")
  headless_test_source_files = director_source_files.flatten
  file headless_test_marker_path => [headless_test_source_files, js_spec_files].flatten do |task|
    require 'jasmine-headless-webkit'

    jasmine_config = {
        "src_files" => headless_test_source_files,
        "helpers" => [File.join(js_fixture_relative_dir, "**", "*.js"), "helpers/**/*.js"],
        "spec_dir" => "spec/js"
    }

    jasmine_config_path = File.join(target_dir, "jasmine_headless.yml")
    File.open(jasmine_config_path, "w") do |file|
      YAML.dump(jasmine_config, file)
    end

    intermediate_report_path = "#{task.name}.intermediate"
    status_code = Jasmine::Headless::Runner.run(
        :colors => true,
        :remove_html_file => true,
        :jasmine_config => jasmine_config_path,
        :report => intermediate_report_path,
        :full_run => true
    )

    if status_code == 1
      fail "Tests failed with code: #{status_code}!"
    else
      FileUtils.mv intermediate_report_path, task.name
    end
  end

  desc "Headless JavaScript tests"
  task :test => ["js:fixtures", headless_test_marker_path]
end

begin
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
rescue LoadError
  task :jasmine do
    abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
  end
end

Rake::Task["jasmine"].prerequisites << "js:compile" << "js:fixtures"
Rake::Task["jasmine:ci"].prerequisites << "js:compile" << "js:fixtures"

desc "Run all tests"
task :test => ["js:test", "jasmine:ci"]

def closure_compile(source_files, target_file)
  args = source_files.map {|source_file| "--js #{source_file}"}
  args << "--js_output_file #{target_file}"
  args << "--warning_level VERBOSE"
  args << "--summary_detail_level 3"
  args << "--externs js/underscore_externs.js"
  args << "--formatting PRETTY_PRINT"
  args << "--debug"

  args_string = args.map {|arg| " #{arg}"}
  command = "closure#{args_string}"
  exec_or_throw(command)
end

def exec_or_throw(command)
  status = exec_and_return(command)
  if not status.success?
    raise "error invoking #{command}: #{$?.inspect}"
  end
end

def exec_and_return(command)
  puts command
  system(command)
  $?
end
