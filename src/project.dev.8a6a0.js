window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
        o = b;
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  backlogGroup: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "87752eeZy1Gqa4kHeXOAgp2", "backlogGroup");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {
        window.g_backlogGroup = this;
        this.m_shapes = [];
        this.node.on("touchstart", this.touchStart, this);
        this.node.on("touchmove", this.touchMove, this);
        this.node.on("touchend", this.touchEnd, this);
        this.node.on("touchcancel", this.touchCancel, this);
      },
      start: function start() {
        this.createShape();
      },
      createShape: function createShape() {
        for (var i = 0; i < this.node.children.length; i++) {
          var shape = g_shapeBuilder.createShape();
          shape.node.scale = 0;
          this.node.children[i].addChild(shape.node);
          shape.node.runAction(cc.scaleTo(.3, .5));
          this.m_shapes[i] = shape;
        }
      },
      getCurrentShap: function getCurrentShap(pos) {
        if (pos.y > 0 || pos.y < -213 || pos.x < 0 || pos.x > 640) return null;
        this.m_currentIndex = Math.floor(pos.x / 213);
        return this.m_shapes[this.m_currentIndex];
      },
      clearMoveShape: function clearMoveShape() {
        if (null != this.m_moveShap) {
          this.m_moveShap.node.removeFromParent();
          this.m_moveShap = null;
        }
      },
      clearCurrentShape: function clearCurrentShape() {
        var currentShape = this.m_shapes[this.m_currentIndex];
        if (null != currentShape) {
          currentShape.node.removeFromParent();
          this.m_shapes[this.m_currentIndex] = null;
        }
      },
      createNewShapes: function createNewShapes() {
        null == this.m_shapes[0] && null == this.m_shapes[1] && null == this.m_shapes[2] && this.createShape();
      },
      touchStart: function touchStart(event) {
        this.clearMoveShape();
        var pos = this.node.convertToNodeSpaceAR(event.getLocation());
        var currentShape = this.getCurrentShap(pos);
        if (null == currentShape) return;
        this.m_moveShap = new Object();
        this.m_moveShap.position = currentShape.position;
        this.m_moveShap.node = cc.instantiate(currentShape.node);
        this.m_moveShap.node.x = pos.x;
        this.m_moveShap.node.y = pos.y + this.m_moveShap.position.height / 2 * 64 + 64;
        this.m_moveShap.node.scale = 1;
        this.node.addChild(this.m_moveShap.node);
        currentShape.node.active = false;
      },
      touchMove: function touchMove(event) {
        if (null == this.m_moveShap) return;
        var pos = event.getLocation();
        pos = this.node.convertToNodeSpaceAR(pos);
        this.m_moveShap.node.x = pos.x;
        this.m_moveShap.node.y = pos.y + this.m_moveShap.position.height / 2 * 64 + 64;
      },
      touchEnd: function touchEnd(event) {
        if (null == this.m_moveShap) return;
        var pos = this.m_moveShap.node.getPosition();
        pos = this.node.convertToWorldSpaceAR(pos);
        if (g_blockGroup.setShape(pos, this.m_moveShap.node.children[0], this.m_moveShap.node.rotation, this.m_moveShap.position)) {
          this.clearMoveShape();
          this.clearCurrentShape();
          this.createNewShapes();
        } else {
          this.showCurrentShape();
          this.clearMoveShape();
        }
        this.checkCanContinue() || g_failed.show();
      },
      checkCanContinue: function checkCanContinue() {
        for (var i = 0; i < this.m_shapes.length; i++) {
          if (null == this.m_shapes[i]) continue;
          if (g_blockGroup.canPut(this.m_shapes[i].position.checklist)) return true;
        }
        return false;
      },
      touchCancel: function touchCancel(event) {
        this.showCurrentShape();
        this.clearMoveShape();
      },
      showCurrentShape: function showCurrentShape() {
        var currentShape = this.m_shapes[this.m_currentIndex];
        null != currentShape && (currentShape.node.active = true);
      },
      destroyAll: function destroyAll() {
        if (null != this.m_shapes) for (var i = 0; i < this.m_shapes.length; i++) if (null != this.m_shapes[i]) {
          this.m_shapes[i].node.removeFromParent();
          this.m_shapes[i].node.destroy();
          this.m_shapes[i].node = null;
          this.m_shapes[i] = null;
        }
        this.m_currentIndex = null;
        if (null != this.m_moveShap) {
          this.m_moveShap.node.removeFromParent();
          this.m_moveShap.node.destroy();
          this.m_moveShap.node = null;
          this.m_moveShap = null;
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  blockGroup: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fd497ZUn+5NipwJJ+q8fXPW", "blockGroup");
    "use strict";
    var dataManager = require("dataManager");
    cc.Class({
      extends: cc.Component,
      properties: {
        m_imageAtlas: cc.SpriteAtlas,
        m_score: cc.Label,
        m_scoreHistory: cc.Label
      },
      onLoad: function onLoad() {
        window.g_blockGroup = this;
        this.m_blockMap = new Array();
        this.m_deleteNodes = new Array();
        this.m_scoreNum = 0;
        this.dataManager = dataManager();
        this.init();
        this.loadBlockGroup();
      },
      start: function start() {
        this.dataManager.load();
        this.m_scoreHistory.string = "" + this.dataManager.getScore();
      },
      init: function init() {
        for (var i = 0; i < 10; i++) {
          this.m_blockMap[i] = new Array();
          this.m_deleteNodes[i] = new Array();
          for (var j = 0; j < 10; j++) {
            this.m_blockMap[i][j] = null;
            this.m_deleteNodes[i][j] = null;
          }
        }
      },
      loadBlockGroup: function loadBlockGroup() {
        var scale = 64 / 68;
        var weight = 68 * scale;
        for (var i = 0; i < 10; i++) {
          var y = i * weight;
          for (var j = 0; j < 10; j++) {
            var x = j * weight;
            var block = new cc.Node();
            this.node.addChild(block);
            block.anchorX = 0;
            block.anchorY = 1;
            block.x = x;
            block.y = -y;
            block.scale = scale;
            var sprite = block.addComponent(cc.Sprite);
            var frame = this.m_imageAtlas.getSpriteFrame("11");
            sprite.spriteFrame = frame;
          }
        }
      },
      isNotInAvalibleArea: function isNotInAvalibleArea(pos, position) {
        return !(pos.x - 64 * position.width / 2 >= -32 && pos.x + 64 * position.width / 2 <= 672 && pos.y + 64 * position.height / 2 <= 32 && pos.y - 64 * position.height / 2 >= -672);
      },
      checkPosition: function checkPosition(pos, position) {
        pos = this.node.convertToNodeSpaceAR(pos);
        if (this.isNotInAvalibleArea(pos, position)) return false;
        this.resetPosition(pos, position);
        var y = Math.abs(pos.x - position.center.x) / 64;
        var x = Math.abs(pos.y - position.center.y) / 64;
        this.m_checklist = [];
        for (var i = 0; i < position.checklist.length; i++) {
          var x_index = position.checklist[i].x + x;
          var y_index = position.checklist[i].y + y;
          this.m_checklist[i] = {
            x: x_index,
            y: y_index
          };
          if (null != this.m_blockMap[x_index][y_index]) return false;
        }
        return true;
      },
      setShape: function setShape(pos, node, rotation, position) {
        if (this.checkPosition(pos, position)) {
          this.setMapFlag(node, rotation);
          this.clearUp();
          return true;
        }
        return false;
      },
      setMapFlag: function setMapFlag(node, rotation) {
        for (var i = 0; i < this.m_checklist.length; i++) if (null != this.m_checklist[i]) {
          var child = cc.instantiate(node);
          child.y = 64 * -this.m_checklist[i].x - 32;
          child.x = 64 * this.m_checklist[i].y + 32;
          child.rotation = rotation;
          child.width = 56;
          child.height = 56;
          this.m_blockMap[this.m_checklist[i].x][this.m_checklist[i].y] = child;
          this.node.addChild(child);
          this.updateScore();
          this.m_checklist[i] = null;
        }
      },
      resetPosition: function resetPosition(pos, position) {
        if (position.width % 2 == 0) {
          var remainderX = pos.x % 64;
          pos.x = remainderX >= 32 ? 64 * Math.ceil(pos.x / 64) : 64 * Math.floor(pos.x / 64);
        } else pos.x = 64 * Math.floor(pos.x / 64) + 32;
        if (position.height % 2 == 0) {
          var remainderY = pos.y % 64;
          pos.y = remainderY <= -32 ? 64 * Math.floor(pos.y / 64) : 64 * Math.ceil(pos.y / 64);
        } else pos.y = 64 * Math.ceil(pos.y / 64) - 32;
      },
      clearUp: function clearUp() {
        var rows = new Array();
        var cols = new Array();
        for (var i = 0; i < 10; i++) {
          var isFull = true;
          for (var j = 0; j < 10; j++) if (null == this.m_blockMap[i][j]) {
            var isFull = false;
            break;
          }
          isFull && rows.push(i);
        }
        for (var _i = 0; _i < 10; _i++) {
          var isFull = true;
          for (var _j = 0; _j < 10; _j++) if (null == this.m_blockMap[_j][_i]) {
            var isFull = false;
            break;
          }
          isFull && cols.push(_i);
        }
        while (rows.length > 0) {
          var row = rows.pop();
          for (var _i2 = 0; _i2 < 10; _i2++) {
            var node = this.m_blockMap[row][_i2];
            this.m_deleteNodes[row][_i2] = node;
            this.m_blockMap[row][_i2] = null;
            this.updateScore();
            if (null != node) {
              var finished = cc.callFunc(function(target, node) {
                for (var _j2 = 0; _j2 < 10; _j2++) this.removeShap(row, _j2);
              }, this, node);
              this.cleanUpAction(node, finished, _i2, true);
            }
          }
        }
        while (cols.length > 0) {
          var col = cols.pop();
          for (var _i3 = 0; _i3 < 10; _i3++) {
            var node = this.m_blockMap[_i3][col];
            this.m_deleteNodes[_i3][col] = node;
            this.m_blockMap[_i3][col] = null;
            this.updateScore();
            if (null != node) {
              var finished = cc.callFunc(function(target, node) {
                for (var _j3 = 0; _j3 < 10; _j3++) this.removeShap(_j3, col);
              }, this, node);
              this.cleanUpAction(node, finished, _i3, false);
            }
          }
        }
      },
      cleanUpAction: function cleanUpAction(node, finished, index, isRow) {
        var time = .3;
        var fadeTo = cc.fadeTo(time - time / 10 * index, 0);
        var moveTo;
        var delay;
        if (isRow) {
          delay = cc.delayTime(time / 10 * index);
          moveTo = cc.moveBy(time, cc.v2(0, -200));
        } else {
          delay = cc.delayTime(time / 10 * (9 - index));
          moveTo = cc.moveBy(time, cc.v2(200, 0));
        }
        var spawn = cc.sequence(delay, cc.spawn(fadeTo, moveTo));
        0 == index && (spawn = cc.sequence(spawn, finished));
        node.runAction(spawn);
      },
      removeShap: function removeShap(row, col) {
        var node = this.m_deleteNodes[row][col];
        if (null != node) {
          node.removeFromParent();
          node = null;
        }
      },
      canPut: function canPut(checklist) {
        for (var i = 0; i < 10; i++) for (var j = 0; j < 10; j++) {
          if (null != this.m_blockMap[i][j]) continue;
          var x_index = Math.abs(checklist[0].x - i);
          var y_index = Math.abs(j - checklist[0].y);
          var failed = false;
          for (var checkIndex = 1; checkIndex < checklist.length; checkIndex++) {
            var x = checklist[checkIndex].x + x_index;
            var y = checklist[checkIndex].y + y_index;
            if (x < 0 || y < 0 || x >= 10 || y >= 10 || null != this.m_blockMap[x][y]) {
              failed = true;
              break;
            }
          }
          if (!failed) return true;
        }
        return false;
      },
      destroyAll: function destroyAll() {
        for (var i = 0; i < 10; i++) for (var j = 0; j < 10; j++) if (null != this.m_blockMap[i][j]) {
          if (null == this.m_blockMap[i][j]) continue;
          this.m_blockMap[i][j].removeFromParent();
          this.m_blockMap[i][j].destroy();
          this.m_blockMap[i][j] = null;
        }
        if (null != this.m_checklist) for (var _i4 = 0; _i4 < this.m_checklist.lenght; _i4++) this.m_checklist[_i4] = null;
        this.m_score.string = "0";
        this.m_scoreNum = 0;
      },
      updateScore: function updateScore() {
        this.m_scoreNum += 1;
        this.m_score.string = "" + this.m_scoreNum;
        var scoreHistoryNum = this.dataManager.getScore();
        if (this.m_scoreNum > scoreHistoryNum) {
          this.dataManager.updateScore(this.m_scoreNum);
          this.m_scoreHistory.string = "" + this.m_scoreNum;
        }
      }
    });
    cc._RF.pop();
  }, {
    dataManager: "dataManager"
  } ],
  dataManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "36ec5TYaxxExLKEmFQypR1m", "dataManager");
    "use strict";
    function createDataManager() {
      var obj = new Object();
      obj.userData = {};
      obj.load = function() {
        var str = cc.sys.localStorage.getItem("userData");
        if (null == str || "" == str) {
          obj.userData = {
            score: 0
          };
          return;
        }
        obj.userData = JSON.parse(str);
      };
      obj.save = function() {
        var str = JSON.stringify(obj.userData);
        cc.sys.localStorage.setItem("userData", str);
      };
      obj.updateScore = function(score) {
        obj.userData.score = score;
        obj.save();
      };
      obj.getScore = function() {
        null == obj.userData.score && (obj.userData.score = 0);
        return obj.userData.score;
      };
      return obj;
    }
    module.exports = createDataManager;
    cc._RF.pop();
  }, {} ],
  failed: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2c881TQNENFEJ5Az8b2GIau", "failed");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {
        window.g_failed = this;
        this.node.active = false;
      },
      start: function start() {},
      show: function show() {
        this.node.active = true;
      },
      restart: function restart() {
        g_backlogGroup.destroyAll();
        g_blockGroup.destroyAll();
        this.node.active = false;
        g_backlogGroup.createShape();
      }
    });
    cc._RF.pop();
  }, {} ],
  game: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2dde2R24ANMqY4Z26aVguBe", "game");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        m_audioSource: {
          default: null,
          type: cc.AudioClip
        }
      },
      start: function start() {
        cc.audioEngine.play(this.m_audioSource, false, 1);
      }
    });
    cc._RF.pop();
  }, {} ],
  shapeBuilder: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "bd2dfbUrVRL7oIvsK7Cznw9", "shapeBuilder");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        m_shapeAtlas: cc.SpriteAtlas,
        m_shapes: [ cc.Prefab ],
        m_data: cc.JsonAsset
      },
      onLoad: function onLoad() {
        window.g_shapeBuilder = this;
        this.m_rotations = [ 0, 270, 180, 90 ];
        this.m_typeProbability = [ 5, 5, 10, 15, 15, 10, 15, 15, 10 ];
        this.m_calcProbability = new Array();
      },
      start: function start() {
        for (var i = 0; i < this.m_typeProbability.length; i++) 0 == i ? this.m_calcProbability.push(this.m_typeProbability[i]) : this.m_calcProbability.push(this.m_calcProbability[i - 1] + this.m_typeProbability[i]);
      },
      createShape: function createShape() {
        var type = this.createTypeByProbability();
        var rotation = randomNum(0, 3);
        var shape = cc.instantiate(this.m_shapes[type]);
        shape.rotation = this.m_rotations[rotation];
        shape.active = true;
        var node = new Object();
        node.node = shape;
        node.position = this.m_data.json.shapes[type].positions[rotation];
        return node;
      },
      createTypeByProbability: function createTypeByProbability() {
        var random = randomNum(0, 100);
        cc.log(random);
        for (var i = 0; i < this.m_calcProbability.length; i++) if (random <= this.m_calcProbability[i]) return i;
        return 0;
      }
    });
    cc._RF.pop();
  }, {} ],
  testGroup: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "13e715i6k9K15x4WM/G+GAe", "testGroup");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      start: function start() {}
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "backlogGroup", "blockGroup", "dataManager", "failed", "game", "shapeBuilder", "testGroup" ]);