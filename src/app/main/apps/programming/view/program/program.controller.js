(function ()
{
    'use strict';

    angular
        .module('app.programming')
        .controller('ProgramController', ProgramController)
        .controller('ContactChipDemoCtrl', DemoCtrl)
        .controller('DayCtrl', function() {
          this.day;})

    ;

    function DemoCtrl ($q, $timeout) {
      var self = this;
      var pendingSearch, cancelSearch = angular.noop;
      var cachedQuery, lastSearch;

      self.allContacts = loadContacts();
      self.contacts = [self.allContacts[0]];
      self.asyncContacts = [];
      self.filterSelected = true;

      self.querySearch = querySearch;
      self.delayedQuerySearch = delayedQuerySearch;

      /**
       * Search for contacts; use a random delay to simulate a remote call
       */
      function querySearch (criteria) {
        cachedQuery = cachedQuery || criteria;
        return cachedQuery ? self.allContacts.filter(createFilterFor(cachedQuery)) : [];
      }

      /**
       * Async search for contacts
       * Also debounce the queries; since the md-contact-chips does not support this
       */
      function delayedQuerySearch(criteria) {
        cachedQuery = criteria;
        if ( !pendingSearch || !debounceSearch() )  {
          cancelSearch();

          return pendingSearch = $q(function(resolve, reject) {
            // Simulate async search... (after debouncing)
            cancelSearch = reject;
            $timeout(function() {

              resolve( self.querySearch() );

              refreshDebounce();
            }, Math.random() * 500, true)
          });
        }

        return pendingSearch;
      }

      function refreshDebounce() {
        lastSearch = 0;
        pendingSearch = null;
        cancelSearch = angular.noop;
      }

      /**
       * Debounce if querying faster than 300ms
       */
      function debounceSearch() {
        var now = new Date().getMilliseconds();
        lastSearch = lastSearch || now;

        return ((now - lastSearch) < 300);
      }

      /**
       * Create filter function for a query string
       */
      function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(contact) {
          return (contact._lowername.indexOf(lowercaseQuery) != -1);;
        };

      }

      function loadContacts() {
        var contacts = [
          'Marina Augustine',
          'Oddr Sarno',
          'Nick Giannopoulos',
          'Narayana Garner',
          'Anita Gros',
          'Megan Smith',
          'Tsvetko Metzger',
          'Hector Simek',
          'Some-guy withalongalastaname'
        ];

        return contacts.map(function (c, index) {
          var cParts = c.split(' ');
          var contact = {
            name: c,
            email: cParts[0][0].toLowerCase() + '.' + cParts[1].toLowerCase() + '@example.com',
            image: 'http://lorempixel.com/50/50/people?' + index
          };
          contact._lowername = contact.name.toLowerCase();
          return contact;
        });
      }
    }




    /** @ngInject */
    function ProgramController($document, $state, Program)
    {
        var vm = this;

        // Data
        vm.taToolbar = [
          ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote', 'bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
          ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent', 'html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
        ];
        vm.program = Program.data;
        vm.conductorSelectFilter = '';
        vm.ngFlowOptions = {
            // You can configure the ngFlow from here
            /*target                   : 'api/media/image',
             chunkSize                : 15 * 1024 * 1024,
             maxChunkRetries          : 1,
             simultaneousUploads      : 1,
             testChunks               : false,
             progressCallbacksInterval: 1000*/
        };
        vm.ngFlow = {
            // ng-flow will be injected into here through its directive
            flow: {}
        };
        vm.dropping = false;

        // Methods
        vm.gotoPrograms = gotoPrograms;
        vm.onConductorsSelectorOpen = onConductorsSelectorOpen;
        vm.onConductorsSelectorClose = onConductorsSelectorClose;
        vm.fileAdded = fileAdded;
        vm.upload = upload;
        vm.fileSuccess = fileSuccess;

        //////////

        init();

        /**
         * Initialize
         */
        function init()
        {
            // Select the correct program from the data.
            // This is an unnecessary step for a real world app
            // because normally, you would request the program
            // with its id and you would get only one program.
            // For demo purposes, we are grabbing the entire
            // json file which have more than one program details
            // and then hand picking the requested program from
            // it.
            var id = $state.params.id;

            for ( var i = 0; i < vm.program.length; i++ )
            {
                if ( vm.program[i].id === parseInt(id) )
                {
                    vm.program = vm.program[i];
                    break;
                }
            }
            // END - Select the correct program from the data
        }

        /**
         * Go to programs page
         */
        function gotoPrograms()
        {
            $state.go('app.programming.programs');
        }

        /**
         * On conductor selector open
         */
        function onConductorsSelectorOpen()
        {
            // The md-select directive eats keydown events for some quick select
            // logic. Since we have a search input here, we don't need that logic.
            $document.find('md-select-header input[type="search"]').on('keydown', function (e)
            {
                e.stopPropagation();
            });
        }

        /**
         * On conductor selector close
         */
        function onConductorsSelectorClose()
        {
            // Clear the filter
            vm.conductorSelectFilter = '';

            // Unbind the input event
            $document.find('md-select-header input[type="search"]').unbind('keydown');
        }

        /**
         * File added callback
         * Triggers when files added to the uploader
         *
         * @param file
         */
        function fileAdded(file)
        {
            // Prepare the temp file data for media list
            var uploadingFile = {
                id  : file.uniqueIdentifier,
                file: file,
                type: 'uploading'
            };

            // Append it to the media list
            vm.program.images.unshift(uploadingFile);
        }

        /**
         * Upload
         * Automatically triggers when files added to the uploader
         */
        function upload()
        {
            // Set headers
            vm.ngFlow.flow.opts.headers = {
                'X-Requested-With': 'XMLHttpRequest',
                //'X-XSRF-TOKEN'    : $cookies.get('XSRF-TOKEN')
            };

            vm.ngFlow.flow.upload();
        }

        /**
         * File upload success callback
         * Triggers when single upload completed
         *
         * @param file
         * @param message
         */
        function fileSuccess(file, message)
        {
            // Iterate through the media list, find the one we
            // are added as a temp and replace its data
            // Normally you would parse the message and extract
            // the uploaded file data from it
            angular.forEach(vm.program.images, function (media, index)
            {
                if ( media.id === file.uniqueIdentifier )
                {
                    // Normally you would update the media item
                    // from database but we are cheating here!
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(media.file.file);
                    fileReader.onload = function (event)
                    {
                        media.url = event.target.result;
                    };

                    // Update the image type so the overlay can go away
                    media.type = 'image';
                }
            });
        }
    }
})();
