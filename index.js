/*
  Default view module
*/
var _ = require('lodash');
var path = require('path');

var auth = app.helpers.isAuthenticated
var SyncModule = require('./SyncModule')

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
          path: '/obr-checkin-config',
          name: 'Integração Checkin',
        },
      ],
      order: 7
    },
    SyncModule.statusMenu
  ],

  initialize: function(app){
    // Add views path to view engine
    var viewsFolder = path.join(__dirname, '/public/tournamenter-obr-checkin')
    app.server.get('views').push(viewsFolder)

    // Add route to change configs/get
    app.server.all('/obr-checkin-sync',       auth, SyncModule.updateConfig)
    app.server.all('/obr-checkin-last-sync',  auth, SyncModule.getLastSync)

    // Render Configuration screen
    app.server.get('/obr-checkin-config',     auth, function (req, res) {
      return res.render('obr-checkin-config', { path: req.route.path });
    })

    // Init SyncModule
    SyncModule.init(app)
  },

  render: function(req, res, next, locals){
    var viewPath = __dirname+'/index';

    var relViewPath = path.relative(path.resolve(__dirname+'/../../views'), viewPath);

    res.render(relViewPath, _.extend(locals, {
      layout: path.join(__dirname, 'layout.ejs'),
    }));
  },
}
