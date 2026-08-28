/*
  Default view module
*/
var _ = require('lodash');
var path = require('path');
var request = require('request')

var auth = app.helpers.isAuthenticated
var package = require('./package.json')
var SyncModule = require('./SyncModule')

var hasUpdate = null

module.exports = {
  type: ['menu'],

  getAssets: function (app){
    return {
      css: [],

      js: [],

      jst: [],

      serve: [
        `${__dirname}/public`,
      ]
    }
  },

  menus: [
    {
      name: 'OBR Checkin',
      childs: [
        {
          path: '/tournamenter-obr-checkin',
          name: 'Pontuador',
        },
        {
          path: '/obr-checkin-config',
          name: 'Configurar (Importar/Exportar)',
        },
        {
          path: '/obr-checkin-desafio',
          name: 'Desafio Surpresa',
        },
        {
          path: '/obr-checkin-rounds',
          name: 'Gerar Tabela de Horários',
        },
        {
          path: '/ManualOBRCheckinTournamenter.pdf',
          name: 'Manual (.pdf)',
        },
      ],
      order: 6
    },
    // Realtime badge for Sincronization with OBR Checkin
    SyncModule.statusMenu
    // {name: 'Pontuador', path: '/tournamenter-obr-checkin', order: 6},
    // {name: 'Importador OBR Checkin', path: '/tournamenter-obr-checkin/importar.html', order: 7},
  ],

  initialize: function(app){
    // Get 'Table' model from App
    var tournamenterRoot = app.config.root;
    var tableModelPath = path.join(tournamenterRoot, './models/Table');
    var TableModel = require(tableModelPath)
    
    // Inject OBR Scoring systems
    TableModel.evaluateMethods.obr2017 = require('./sorters/obr2017');
    TableModel.evaluateMethods.obr2018nacional = require('./sorters/obr2018nacional');
    TableModel.evaluateMethods.obr2024 = require('./sorters/obr2024');
    TableModel.evaluateMethods.obr2025 = require('./sorters/obr2025');
    TableModel.evaluateMethods.artistica2025 = require('./sorters/artistica2025');
    TableModel.evaluateMethods.artistica2026 = require('./sorters/artistica2026');

    // Set 'obr2025' as default sorting algorithm
    TableModel.attributes.evaluateMethod.defaultsTo = 'obr2025';
    
    // Set columns count to 6 as default, with names
    TableModel.attributes.columns.defaultsTo = 6;
    TableModel.attributes.headerScore.defaultsTo = 
     'Round 1, Tempo 1, Round 2, Tempo 2, Round 3, Tempo 3';

    // Set default to Portugese on columns
    TableModel.attributes.headerTeam.defaultsTo = 'Equipe';

    // Update Default Tournamenter Logo
    app.config.appLogo = path.join(__dirname, '/public/tournamenter-obr-checkin/obr.png')

    // Add views path to view engine
    var viewsFolder = path.join(__dirname, '/public/tournamenter-obr-checkin')
    var views = app.server.get('views').push(viewsFolder)

    // Add route to change configs/get
    app.server.all('/obr-checkin-sync',       auth, SyncModule.updateConfig)
    app.server.all('/obr-checkin-last-sync',  auth, SyncModule.getLastSync)

    // Render Configuration screen
    app.server.get('/obr-checkin-config',     auth, function (req, res) {
      return res.render('obr-checkin-config', { path: req.route.path });
    })

    // Render desafio screen
    app.server.get('/obr-checkin-desafio',    auth, function (req, res) {
      return res.render('obr-checkin-desafio', { path: req.route.path });
    })

    // Render Gerador de rounds screen
    app.server.get('/obr-checkin-rounds',    auth, function (req, res) {
      return res.render('obr-checkin-rounds', { path: req.route.path });
    })

    // Set home screen to show a big huge button to guide judges
    app.server.get('/obr-checkin-home',     auth, function (req, res) {
      return res.render('obr-checkin-home', { path: req.route.path, newestVersion: hasUpdate});
    })

    // Init SyncModule
    SyncModule.init(app)

    // Check uptades on this package
    request({
      url: 'http://registry.npmjs.org/' + package.name,
      json: true,
    }, function (err, response, body){
      if (err){
        // Just check for updates if internet...
        return;
      }
      if (response.statusCode != 200 || !body) {
        // No problem. Just ignore
        return;
      }

      var currentVersion = package.version
      var newestVersion = body && body['dist-tags'] && body['dist-tags'].latest

      if (newestVersion != currentVersion) {
        hasUpdate = newestVersion
        console.log()
        console.log('>>>>>>>>>> NOVO UPDATE PARA O tournamenter-obr-checkin')
        console.log('>>>>>>>>>> Versão: '+newestVersion)
        console.log()
      }
    })
  },

  render: function(req, res, next, locals){
    var viewPath = __dirname+'/index';

    var relViewPath = path.relative(path.resolve(__dirname+'/../../views'), viewPath);

    res.render(relViewPath, _.extend(locals, {
      layout: path.join(__dirname, 'layout.ejs'),
    }));
  },
}
