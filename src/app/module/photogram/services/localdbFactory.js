(function () {
  'use strict';
  // SQL to model mapping
  // match
  //    id (Match.id)
  //    last_update (ChatMessage[last].createdAt)
  //    last_message (ChatMessage[last].text
  //    name (Profile.name)
  //    profile_id (Profile.id)
  //    photo (Profile.photo1.url)
  //    read (managed locally)
  //
  // chat_message
  //    id (ChatMessage.id)
  //    chat_id (Match.id)
  //    date (ChatMessage.createdAt)
  //    sender (ChatMessage.sender)
  //    message (ChatMessage.text)
  //    image (ChatMessage.image)

  // See http://www.w3.org/TR/webdatabase/ for the database API
  // And https://github.com/litehelpers/Cordova-sqlite-storage for implementation notes

  angular.module('app.photogram').factory('LocalDB', ["$q", "$log", "appName", "buildEnv", function ($q, $log, appName, buildEnv) {

    var db;

    var service = {
      // fields
      userId: '',
      // methods
      init: init,
      getMatches: getMatches,
      saveMatch: saveMatch,
      deleteMatch: deleteMatch,
      getChatMessages: getChatMessages,
      saveChatMessage: saveChatMessage,
      setChatRead: setChatRead,
      getUnreadChats: getUnreadChats,
      getProfiles: getProfiles,
      saveProfile: saveProfile,
      deleteDb: deleteDb
    };

    return service;

    /**
   * At least in Chrome, console.log on a SQLError/SQLException object outputs [Object object] and console.log on
   * JSON.stringify(error) outputs {}. So extract the fields to a plain new object for nice logging
   */
    function convertError(e) {
      return { code: e.code, message: e.message };
    }

    function FileUrl(fileUrl) {
      this.url = function () {
        return fileUrl;
      };
    }

    function _mapMatchResultSet(sqlResultSet) {
      var len = sqlResultSet.rows.length;
      var result = [];
      // id varchar primary key, other_user_id varchar, object match, updated_at integer, read integer
      for (var i = 0; i < len; i++) {
        var row = sqlResultSet.rows.item(i);
        var match = new Match();
        var parsed = JSON.parse(row.match);
        parsed.udpatedAt = new Date(row.updated_at); // updated_at can be updated directly by sql when there's a new message, so use this value
        _.assign(match, parsed);
        match.id = parsed.objectId;
        match.lastMessage = row.last_message;
        match.read = row.read === 1 ? true : false;
        match.createdAt = new Date(match.createdAt);
        match.updatedAt = new Date(match.updatedAt);

        result.push(match);
      }
      return result;
    }

    function _mapChatMessageResultSet(sqlResultSet) {
      var len = sqlResultSet.rows.length;
      var result = [];
      // (id varchar primary key, chat_id varchar, created_at integer, message text)
      for (var i = 0; i < len; i++) {
        var row = sqlResultSet.rows.item(i);
        var chatMessage = new ChatMessage();
        var parsed = JSON.parse(row.chat_message);
        _.assign(chatMessage, parsed);
        chatMessage.id = parsed.objectId;
        chatMessage.createdAt = new Date(chatMessage.createdAt);
        //if(chatMessage.image)
        //  chatMessage.image = new FileUrl(chatMessage.image.url())
        //if(chatMessage.audio)
        //  chatMessage.audio = new FileUrl(chatMessage.audio.url())
        result.push(chatMessage);
      }
      return result;
    }

    function _mapProfileResultSet(sqlResultSet) {
      var len = sqlResultSet.rows.length;
      var result = [];
      // (id varchar primary key, chat_id varchar, created_at integer, message text)
      for (var i = 0; i < len; i++) {
        var row = sqlResultSet.rows.item(i);
        var profile = new Profile();
        var parsed = JSON.parse(row.profile);
        _.assign(profile, parsed);
        profile.id = parsed.objectId;
        profile.updatedAt = new Date(profile.updatedAt);
        result.push(profile);
      }
      return result;
    }

    // Service functions ----------------------

    function init() {
      // Use the native sqlite plugin if it exists
      var databaseName = appName + '-' + buildEnv;
      db = window.sqlitePlugin ? window.sqlitePlugin.openDatabase({ name: databaseName + '.db', location: 2 }) : window.openDatabase(databaseName, '', 'LocalDB', 2 * 1024 * 1024);

      var M = new Migrator(db);

      // Set your migrations in the order that they need to occur
      M.migration(1, function (tx) {
        // the pattern in the table columns is the id primary key, then the object JSON in a text, then the columns the table might be queried by
        tx.executeSql('CREATE TABLE profile (id varchar primary key, profile text, user_id varchar)');
        tx.executeSql('CREATE TABLE match (id varchar primary key, match text, other_user_id varchar, other_profile_id varchar, updated_at integer, last_message varchar, read integer)');
        tx.executeSql('CREATE TABLE chat_message (id varchar primary key, chat_message text, chat_id varchar, created_at integer)');
      });

      // Execute will do all the migrations required for the particular user (e.g., if they're at v1 take them to v2 and then v3)
      return M.execute().then(function () {
        //now go about executing your SQL or whatever to load the page or site
        return $q.when();
      });
    }

    /**
   * Deletes data from the database tables
   * @returns {Promise} when the tables have been truncated
   */
    function deleteDb() {
      init();
      $log.log('Deleting database data');
      var deferred = $q.defer();
      db.transaction(function (tx) {
        tx.executeSql('DELETE FROM match');
        tx.executeSql('DELETE FROM profile');
        tx.executeSql('DELETE FROM chat_message');
      }, function (e) {
        $log.error('Error delete database data: ' + e.message);
        deferred.reject(convertError(e));
      }, function () {
        $log.log('Database data deleted');
        deferred.resolve();
      });
      return deferred.promise;
    }

    function getMatches() {
      var deferred = $q.defer();
      db.readTransaction(function (tx) {
        tx.executeSql('SELECT * FROM match ORDER BY updated_at DESC', [], function (tx, sqlResultSet) {
          deferred.resolve(_mapMatchResultSet(sqlResultSet));
        });
      }, function (e) {
        deferred.reject(convertError(e));
      });
      return deferred.promise;
    }

    function getProfiles() {
      var deferred = $q.defer();
      db.readTransaction(function (tx) {
        tx.executeSql('SELECT * FROM profile', [], function (tx, sqlResultSet) {
          deferred.resolve(_mapProfileResultSet(sqlResultSet));
        });
      }, function (e) {
        deferred.reject(convertError(e));
      });
      return deferred.promise;
    }

    //function getProfile(profileId) {
    //  var deferred = $q.defer()
    //  db.readTransaction(function(tx) {
    //      tx.executeSql('SELECT * FROM profile where id=?', [profileId], function(tx, sqlResultSet) {
    //        deferred.resolve(_mapProfileResultSet(sqlResultSet))
    //      })
    //    }, function(e) {
    //      deferred.reject(convertError(e))
    //    }
    //  )
    //  return deferred.promise
    //}

    function saveMatch(match, profile) {
      var deferred = $q.defer();
      // Store the profile id as otherProfile on the match so the profile property works when we deserialise
      // Make a copy so we can remove the profile data which is saved in a different table
      var matchData = JSON.parse(JSON.stringify(match));
      matchData.otherProfile = { id: profile.id };
      db.transaction(function (tx) {
        // (id varchar primary key, match text, other_user_id varchar, other_profile_id varchar, updated_at integer, read integer)'
        tx.executeSql('INSERT OR REPLACE INTO match (id, match, other_user_id, other_profile_id, updated_at, read) ' + 'VALUES (?,?,?,?,?,?)', [match.id, JSON.stringify(matchData), profile.uid, profile.id, match.updatedAt.getTime(), 0]);

        // (id varchar primary key, profile text, user_id varchar)
        tx.executeSql('INSERT OR REPLACE INTO profile (id, profile, user_id) ' + 'VALUES (?,?,?)', [profile.id, JSON.stringify(profile), profile.uid]);
      }, function (e) {
        deferred.reject(convertError(e));
        $log.error('Error saving match: ' + e.message);
      }, function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function saveProfile(profile) {
      var deferred = $q.defer();

      db.transaction(function (tx) {
        // (id varchar primary key, profile text, user_id varchar)
        tx.executeSql('INSERT OR REPLACE INTO profile (id, profile, user_id) ' + 'VALUES (?,?,?)', [profile.id, JSON.stringify(profile), profile.uid]);
      }, function (e) {
        deferred.reject(convertError(e));
        $log.error('Error saving profile: ' + e.message);
      }, function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function deleteMatch(matchId) {
      var deferred = $q.defer();
      db.transaction(function (tx) {
        tx.executeSql('DELETE FROM match WHERE id=?', [matchId]);
        tx.executeSql('DELETE FROM chat_message WHERE chat_id=?', [matchId]);
      }, function (e) {
        deferred.reject(convertError(e));
        $log.error('LocalDB Error deleting match: ' + e.message);
      }, function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    function getChatMessages(chatId) {
      var deferred = $q.defer();
      db.readTransaction(function (tx) {
        tx.executeSql('SELECT * FROM chat_message WHERE chat_id = ? ORDER BY created_at ASC', [chatId], function (tx, sqlResultSet) {
          deferred.resolve(_mapChatMessageResultSet(sqlResultSet));
        });
      }, function (e) {
        deferred.reject(convertError(e));
      });
      return deferred.promise;
    }

    /**
   * Save a chat message (if it doesn't already exist)
   * @param msg the chat message
   * @returns {Promise<boolean>} A promise which resolves to if this was inserted or false if already in the database
   */
    function saveChatMessage(msg) {
      var deferred = $q.defer();
      var isNew = false;

      db.transaction(function (tx) {
        if (service.userId !== msg.sender) {
          // update the read flag to unread if the message doesn't exist in the local db
          tx.executeSql('UPDATE match SET read = 0 WHERE NOT EXISTS (SELECT 1 FROM chat_message WHERE id = ?)', [msg.id]);
        }

        // (id varchar primary key, chat_message text, chat_id varchar, created_at integer)
        tx.executeSql('INSERT OR IGNORE INTO chat_message ' + '(id, chat_message, chat_id, created_at) ' + 'VALUES (?,?,?,?)', [msg.id, JSON.stringify(msg), msg.match.id, msg.createdAt.getTime()], function (tx, sqlResultSet) {
          isNew = sqlResultSet.rowsAffected > 0;
        });

        // If the message is newer then update the match updated_at
        tx.executeSql('UPDATE match SET updated_at = ?, last_message = ? WHERE id = ? and ? > updated_at', [msg.createdAt.getTime(), msg.lastMessage, msg.match.id, msg.createdAt.getTime()]);
      }, function (e) {
        deferred.reject(convertError(e));
        $log.error('Error saving chat message: ' + e.message);
      }, function () {
        $log.debug('saved chat message new:' + isNew);
        deferred.resolve(isNew);
      });
      return deferred.promise;
    }

    /**
   * Marks a match/chat as read
   * @param chatId
   * @param {boolean} read the read flag
   * @returns {Promise} A promise which resolves when the database transaction has completed
   */
    function setChatRead(chatId, read) {
      if (!_.isBoolean(read)) {
        throw 'read must be a boolean. Was ' + read;
      }

      // sqlite does not have a boolean value, use 0/1
      var readValue = read ? 1 : 0;

      var deferred = $q.defer();
      db.transaction(function (tx) {
        tx.executeSql('UPDATE match SET read = ? WHERE id = ?', [readValue, chatId]);
      }, function (e) {
        deferred.reject(convertError(e));
        $log.error('Error updating read flag: ' + e.message);
      }, function () {
        deferred.resolve();
      });
      return deferred.promise;
    }

    /**
   * @returns {object} an object with the keys as the match id's which are unread
   */
    function getUnreadChats() {
      var deferred = $q.defer();
      db.readTransaction(function (tx) {
        tx.executeSql('SELECT id FROM match WHERE read = 0', [], function (tx, sqlResultSet) {
          var len = sqlResultSet.rows.length;
          var unreadChats = {};
          for (var i = 0; i < len; i++) {
            var row = sqlResultSet.rows.item(i);
            unreadChats[row.id] = true;
          }
          deferred.resolve(unreadChats);
        });
      }, function (e) {
        deferred.reject(convertError(e));
      });
      return deferred.promise;
    }

    // Modified from https://github.com/llamaluvr/JS-Migrator_Promise
    function Migrator(db) {
      // Pending migrations to run
      var migrations = [];

      var state = 0;

      var MIGRATOR_TABLE = 'version';

      // Use this method to actually add a migration.
      // You'll probably want to start with 1 for the migration number.
      this.migration = function (number, func) {
        migrations[number] = func;
      };

      // Execute a given migration by index
      function doMigration(number) {
        var deferred = $q.defer();
        if (migrations[number]) {
          db.transaction(function (t) {
            t.executeSql('update ' + MIGRATOR_TABLE + ' set version = ?', [number], function (t) {
              $log.info('Beginning migration ' + number);
              migrations[number](t);
              $log.info('Completed migration ' + number);
              doMigration(number + 1).then(function () {
                return deferred.resolve();
              });
            }, function (t, err) {
              $log.error('Error!: %o (while upgrading to %s from %s)', err.message, number);
              deferred.reject(convertError(e));
            });
          });
        } else {
          $log.debug('Migrations complete.');
          state = 2;
          deferred.resolve();
        }

        return deferred.promise;
      }

      // helper that actually calls doMigration from doIt.
      function migrateStartingWith(ver) {
        state = 1;
        $log.debug('Main Migrator starting');
        //return doMigration(ver + 1)
        var deferred = $q.defer();

        try {
          return doMigration(ver + 1).then(function () {
            return deferred.resolve();
          });
        } catch (e) {
          deferred.reject(e);
        }

        return deferred.promise;
      }

      this.execute = function () {
        var deferred = $q.defer();
        if (state > 0) {
          throw 'Migrator is only valid once -- create a new one if you want to do another migration.';
        }
        db.transaction(function (t) {
          t.executeSql('select version from ' + MIGRATOR_TABLE, [], function (t, res) {
            var rows = res.rows;
            var version = rows.item(0).version;
            $log.info('Existing database present, migrating from ' + version);
            migrateStartingWith(version).then(function () {
              return deferred.resolve();
            });
          }, function (t, err) {
            if (err.message.match(/no such table/i)) {
              t.executeSql('create table ' + MIGRATOR_TABLE + '(version integer)', [], function () {
                t.executeSql('insert into ' + MIGRATOR_TABLE + ' values(0)', [], function () {
                  $log.info('New migration database created...');
                  migrateStartingWith(0).then(function () {
                    return deferred.resolve();
                  });
                }, function (t, err) {
                  $log.error('Unrecoverable error inserting initial version into db: %o', err.message);
                  deferred.reject(convertError(e));
                });
              }, function (t, err) {
                $log.error('Unrecoverable error creating version table: %o', err.message);
                deferred.reject(convertError(e));
              });
            } else {
              $log.error('Unrecoverable error resolving schema version: %o', err.message);
              deferred.reject(convertError(e));
            }
          });
        });

        return deferred.promise;
      };
    }
  }]);
})(); // end IIFE