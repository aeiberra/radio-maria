/*
(function ()
{
    'use strict';

    angular
        .module('app.programming', [])
        .config(config);

    /!** @ngInject *!/
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider
            .state('app.programming', {
                url    : '/programming',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/programming/programming.html',
                        controller : 'ProgrammingController as vm'
                    }
                },
                resolve: {
                    ProgrammingData: function (msApi)
                    {
                        return msApi.resolve('programming@get');
                    }
                }
            });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/programming');

        // Api
        msApiProvider.register('programming', ['app/data/programming/programming.json']);

        // Navigation
        msNavigationServiceProvider.saveItem('fuse', {
            title : 'APP',
            group : true,
            weight: 1
        });

        msNavigationServiceProvider.saveItem('fuse.programming', {
            title    : 'Programas',
            icon     : 'icon-calendar-text',
            state    : 'app.programming',
            /!*stateParams: {
                'param1': 'page'
             },*!/
            translate: 'PROGRAMMING.PROGRAMMING_NAV',
            weight   : 1
        });
    }
})();
*/
(function ()
{
  'use strict';

  angular
    .module('app.programming',
      [
        // 3rd Party Dependencies
        'datatables',
        'flow',
        'nvd3',
        'textAngular',
        'uiGmapgoogle-maps',
        'xeditable'
      ]
    )
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
  {
    // State
    $stateProvider
      .state('app.programming', {
        abstract: true,
        url     : '/programming'
      })
      .state('app.programming.programs', {
        url      : '/programs',
        views    : {
          'content@app': {
            templateUrl: 'app/main/apps/programming/view/programs/programs.html',
            controller : 'ProgramsController as vm'
          }
        },
        resolve  : {
          Programs: function (msApi)
          {
            return msApi.resolve('programming.programs@get');
          }
        },
        bodyClass: 'programming'
      })
      .state('app.programming.programs.detail', {
        url      : '/:id',
        views    : {
          'content@app': {
            templateUrl: 'app/main/apps/programming/view/program/program.html',
            controller : 'ProgramController as vm'
          }
        },
        resolve  : {
          Program: function (msApi)
          {
            return msApi.resolve('programming.program@get');
          }
        },
        bodyClass: 'programming'
      });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/apps/programming');

    // Api
    msApiProvider.register('programming.programs', ['app/data/programming/programs.json']);
    msApiProvider.register('programming.program', ['app/data/programming/program.json']);
    msApiProvider.register('programming.statuses', ['app/data/programming/statuses.json']);

    // Navigation
    msNavigationServiceProvider.saveItem('apps.programming', {
      title : 'Programacion',
      icon  : 'icon-cart',
      weight: 3
    });


    msNavigationServiceProvider.saveItem('apps.programming.programs', {
      title: 'Programas',
      state: 'app.programming.programs'
    });
  }
})();
