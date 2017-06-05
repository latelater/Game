require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"floor":[function(require,module,exports){
"use strict";
cc._RF.push(module, '4d71c+R5iJKAIdlQQXZAOwy', 'floor');
// scripts\floor.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function onLoad() {}

});

cc._RF.pop();
},{}],"star":[function(require,module,exports){
"use strict";
cc._RF.push(module, 'e6be44a35tCRYsB32aOiAfM', 'star');
// scripts\star.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        speed: cc.v2(0, 0),
        maxSpeed: cc.v2(0, 0),
        acce: 0,
        direction: 0,
        jumpSpeed: 0,
        gravity: 0,
        groundY: 0
    },

    onLoad: function onLoad() {
        this.groundY = this.node.y;
        this.jumping = false;
        this.collisionX = 0; //x轴是否碰撞，0：没有碰撞，-1：左方有碰撞，1：右方有碰撞
        this.collisionY = 0;
        cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        var color = new cc.Color(this.node.color);
        this.newColor = color.clone();
        console.log(this.newColor);
    },

    onDestroy: function onDestroy() {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },
    onKeyDown: function onKeyDown(event) {
        switch (event.keyCode) {
            case cc.KEY.a:
            case cc.KEY.left:
                this.direction = -1;
                break;
            case cc.KEY.d:
            case cc.KEY.right:
                this.direction = 1;
                break;
            case cc.KEY.w:
            case cc.KEY.up:
                if (!this.jumping) {
                    this.jumping = true;
                    this.speed.y = this.jumpSpeed;
                }

        }
    },
    onKeyUp: function onKeyUp(event) {
        switch (event.keyCode) {
            case cc.KEY.a:
            case cc.KEY.left:
            case cc.KEY.d:
            case cc.KEY.right:
                this.direction = 0;
                break;
        }
    },


    onCollisionEnter: function onCollisionEnter(other, self) {

        this.node.color = cc.Color.RED;

        this.touchingNumber++;

        // 1st step 
        // get pre aabb, go back before collision
        var otherAabb = other.world.aabb;
        var otherPreAabb = other.world.preAabb.clone();

        var selfAabb = self.world.aabb;
        var selfPreAabb = self.world.preAabb.clone();

        // 2nd step
        // forward x-axis, check whether collision on x-axis
        selfPreAabb.x = selfAabb.x;
        otherPreAabb.x = otherAabb.x;

        if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
            if (this.speed.x < 0 && selfPreAabb.xMax > otherPreAabb.xMax) {
                this.node.x = otherPreAabb.xMax - this.node.parent.x;
                this.collisionX = -1;
            } else if (this.speed.x > 0 && selfPreAabb.xMin < otherPreAabb.xMin) {
                this.node.x = otherPreAabb.xMin - selfPreAabb.width - this.node.parent.x;
                this.collisionX = 1;
            }

            this.speed.x = 0;
            other.touchingX = true;
            return;
        }

        // 3rd step
        // forward y-axis, check whether collision on y-axis
        selfPreAabb.y = selfAabb.y;
        otherPreAabb.y = otherAabb.y;

        if (cc.Intersection.rectRect(selfPreAabb, otherPreAabb)) {
            if (this.speed.y < 0 && selfPreAabb.yMax > otherPreAabb.yMax) {
                this.node.y = otherPreAabb.yMax - this.node.parent.y;
                this.jumping = false;
                this.collisionY = -1;
            } else if (this.speed.y > 0 && selfPreAabb.yMin < otherPreAabb.yMin) {
                this.node.y = otherPreAabb.yMin - selfPreAabb.height - this.node.parent.y;
                this.collisionY = 1;
            }

            this.speed.y = 0;
            other.touchingY = true;
        }
    },

    onCollisionExit: function onCollisionExit(other) {
        this.touchingNumber--;
        // if (this.touchingNumber === 0) {
        //     this.node.color = cc.Color.WHITE;
        // }

        if (other.touchingX) {
            this.collisionX = 0;
            other.touchingX = false;
        } else if (other.touchingY) {
            other.touchingY = false;
            this.collisionY = 0;
            this.jumping = true;
        }

        this.node.color = this.newColor;
    },

    update: function update(dt) {

        if (this.collisionY === 0) {
            //如果Y轴没有碰撞
            this.speed.y += this.gravity * dt;
            if (Math.abs(this.speed.y) > this.maxSpeed.y) {
                this.speed.y = this.speed.y > 0 ? this.maxSpeed.y : -this.maxSpeed.y;
            }
        }

        if (this.direction === 0) {
            if (this.speed.x > 0) {
                this.speed.x -= this.acce * dt;
                if (this.speed.x <= 0) this.speed.x = 0;
            } else if (this.speed.x < 0) {
                this.speed.x += this.acce * dt;
                if (this.speed.x >= 0) this.speed.x = 0;
            }
        } else {
            this.speed.x += (this.direction > 0 ? 1 : -1) * this.acce * dt;
            if (Math.abs(this.speed.x) > this.maxSpeed.x) {
                this.speed.x = this.speed.x > 0 ? this.maxSpeed.x : -this.maxSpeed.x;
            }
        }

        this.node.x += this.speed.x * dt;
        this.node.y += this.speed.y * dt;
        if (this.node.y <= this.groundY) {
            this.node.y = this.groundY;
            this.jumping = false;
        }
    }
});

cc._RF.pop();
},{}]},{},["floor","star"])

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHRzL2Zsb29yLmpzIiwiYXNzZXRzL3NjcmlwdHMvc3Rhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDSTs7QUFFQTtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVlE7O0FBYVo7QUFDQTs7QUFqQks7Ozs7Ozs7Ozs7QUNBVDtBQUNJOztBQUVBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFQUTs7QUFVWjtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0g7O0FBRUQ7QUFDSTtBQUNBO0FBQ0E7QUFDQTtBQUNIO0FBRUQ7QUFDSTtBQUNJO0FBQ0E7QUFDSTtBQUNBO0FBQ0o7QUFDQTtBQUNJO0FBQ0E7QUFDSjtBQUNBO0FBQ0k7QUFDSTtBQUNBO0FBQ0g7O0FBZFQ7QUFpQkg7QUFFRDtBQUNJO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDSTtBQUNBO0FBTlI7QUFRSDs7O0FBRUQ7O0FBRUk7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNJO0FBQ0k7QUFDQTtBQUNIO0FBRUc7QUFDQTtBQUNIOztBQUVEO0FBQ0E7QUFDQTtBQUNIOztBQUVEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0k7QUFDSTtBQUNBO0FBQ0E7QUFDSDtBQUVHO0FBQ0E7QUFDSDs7QUFFRDtBQUNBO0FBQ0g7QUFFSjs7QUFFRDtBQUNJO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0k7QUFDQTtBQUNIO0FBRUc7QUFDQTtBQUNBO0FBQ0g7O0FBRUQ7QUFDSDs7QUFHRDs7QUFFSTtBQUE0QjtBQUN4QjtBQUNBO0FBQ0k7QUFDSDtBQUNKOztBQUVEO0FBQ0k7QUFDSTtBQUNBO0FBQ0g7QUFFRztBQUNBO0FBQ0g7QUFDSjtBQUVHO0FBQ0E7QUFDSTtBQUNIO0FBQ0o7O0FBRUQ7QUFDQTtBQUNBO0FBQ0k7QUFDQTtBQUNIO0FBQ0o7QUE5S0kiLCJzb3VyY2VzQ29udGVudCI6WyJjYy5DbGFzcyh7XHJcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXHJcblxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIGZvbzoge1xyXG4gICAgICAgIC8vICAgIGRlZmF1bHQ6IG51bGwsICAgICAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGF0dGFjaGluZ1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxyXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcclxuICAgICAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcclxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcclxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXHJcbiAgICAgICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxyXG4gICAgICAgIC8vIH0sXHJcbiAgICAgICAgLy8gLi4uXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xyXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcclxuXHJcbiAgICAvLyB9LFxyXG59KTtcclxuIiwiY2MuQ2xhc3Moe1xyXG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxyXG5cclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICBzcGVlZDogY2MudjIoMCwgMCksXHJcbiAgICAgICAgbWF4U3BlZWQ6IGNjLnYyKDAsIDApLFxyXG4gICAgICAgIGFjY2U6IDAsXHJcbiAgICAgICAgZGlyZWN0aW9uOiAwLFxyXG4gICAgICAgIGp1bXBTcGVlZDowLFxyXG4gICAgICAgIGdyYXZpdHk6MCxcclxuICAgICAgICBncm91bmRZOiAwXHJcbiAgICB9LFxyXG5cclxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZ3JvdW5kWSA9IHRoaXMubm9kZS55O1xyXG4gICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuY29sbGlzaW9uWCA9IDA7Ly946L205piv5ZCm56Kw5pKe77yMMO+8muayoeacieeisOaSnu+8jC0x77ya5bem5pa55pyJ56Kw5pKe77yMMe+8muWPs+aWueacieeisOaSnlxyXG4gICAgICAgIHRoaXMuY29sbGlzaW9uWSA9IDA7XHJcbiAgICAgICAgY2MuZGlyZWN0b3IuZ2V0Q29sbGlzaW9uTWFuYWdlcigpLmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIC8vIGNjLmRpcmVjdG9yLmdldENvbGxpc2lvbk1hbmFnZXIoKS5lbmFibGVkRGVidWdEcmF3ID0gdHJ1ZTtcclxuICAgICAgICBjYy5zeXN0ZW1FdmVudC5vbihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuS0VZX0RPV04sIHRoaXMub25LZXlEb3duLCB0aGlzKTtcclxuICAgICAgICBjYy5zeXN0ZW1FdmVudC5vbihjYy5TeXN0ZW1FdmVudC5FdmVudFR5cGUuS0VZX1VQLCB0aGlzLm9uS2V5VXAsIHRoaXMpO1xyXG5cclxuICAgICAgICB2YXIgY29sb3IgPSBuZXcgY2MuQ29sb3IodGhpcy5ub2RlLmNvbG9yKTtcclxuICAgICAgICB0aGlzLm5ld0NvbG9yID0gY29sb3IuY2xvbmUoKTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm5ld0NvbG9yKTtcclxuICAgIH0sXHJcblxyXG4gICAgb25EZXN0cm95KCkge1xyXG4gICAgICAgIGNjLmRpcmVjdG9yLmdldENvbGxpc2lvbk1hbmFnZXIoKS5lbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgY2MuZGlyZWN0b3IuZ2V0Q29sbGlzaW9uTWFuYWdlcigpLmVuYWJsZWREZWJ1Z0RyYXcgPSBmYWxzZTtcclxuICAgICAgICBjYy5zeXN0ZW1FdmVudC5vZmYoY2MuU3lzdGVtRXZlbnQuRXZlbnRUeXBlLktFWV9ET1dOLCB0aGlzLm9uS2V5RG93biwgdGhpcyk7XHJcbiAgICAgICAgY2Muc3lzdGVtRXZlbnQub2ZmKGNjLlN5c3RlbUV2ZW50LkV2ZW50VHlwZS5LRVlfVVAsIHRoaXMub25LZXlVcCwgdGhpcyk7XHJcbiAgICB9LFxyXG5cclxuICAgIG9uS2V5RG93bihldmVudCkge1xyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIGNjLktFWS5hOlxyXG4gICAgICAgICAgICBjYXNlIGNjLktFWS5sZWZ0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAtMTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIGNjLktFWS5kOlxyXG4gICAgICAgICAgICBjYXNlIGNjLktFWS5yaWdodDpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIGNjLktFWS53OlxyXG4gICAgICAgICAgICBjYXNlIGNjLktFWS51cDpcclxuICAgICAgICAgICAgICAgIGlmKCF0aGlzLmp1bXBpbmcpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGVlZC55ID0gdGhpcy5qdW1wU3BlZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25LZXlVcChldmVudCkge1xyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIGNjLktFWS5hOlxyXG4gICAgICAgICAgICBjYXNlIGNjLktFWS5sZWZ0OlxyXG4gICAgICAgICAgICBjYXNlIGNjLktFWS5kOlxyXG4gICAgICAgICAgICBjYXNlIGNjLktFWS5yaWdodDpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25Db2xsaXNpb25FbnRlcjogZnVuY3Rpb24gKG90aGVyLCBzZWxmKSB7XHJcblxyXG4gICAgICAgIHRoaXMubm9kZS5jb2xvciA9IGNjLkNvbG9yLlJFRDtcclxuXHJcbiAgICAgICAgdGhpcy50b3VjaGluZ051bWJlcisrO1xyXG5cclxuICAgICAgICAvLyAxc3Qgc3RlcCBcclxuICAgICAgICAvLyBnZXQgcHJlIGFhYmIsIGdvIGJhY2sgYmVmb3JlIGNvbGxpc2lvblxyXG4gICAgICAgIHZhciBvdGhlckFhYmIgPSBvdGhlci53b3JsZC5hYWJiO1xyXG4gICAgICAgIHZhciBvdGhlclByZUFhYmIgPSBvdGhlci53b3JsZC5wcmVBYWJiLmNsb25lKCk7XHJcblxyXG4gICAgICAgIHZhciBzZWxmQWFiYiA9IHNlbGYud29ybGQuYWFiYjtcclxuICAgICAgICB2YXIgc2VsZlByZUFhYmIgPSBzZWxmLndvcmxkLnByZUFhYmIuY2xvbmUoKTtcclxuXHJcbiAgICAgICAgLy8gMm5kIHN0ZXBcclxuICAgICAgICAvLyBmb3J3YXJkIHgtYXhpcywgY2hlY2sgd2hldGhlciBjb2xsaXNpb24gb24geC1heGlzXHJcbiAgICAgICAgc2VsZlByZUFhYmIueCA9IHNlbGZBYWJiLng7XHJcbiAgICAgICAgb3RoZXJQcmVBYWJiLnggPSBvdGhlckFhYmIueDtcclxuXHJcbiAgICAgICAgaWYgKGNjLkludGVyc2VjdGlvbi5yZWN0UmVjdChzZWxmUHJlQWFiYiwgb3RoZXJQcmVBYWJiKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zcGVlZC54IDwgMCAmJiAoc2VsZlByZUFhYmIueE1heCA+IG90aGVyUHJlQWFiYi54TWF4KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlLnggPSBvdGhlclByZUFhYmIueE1heCAtIHRoaXMubm9kZS5wYXJlbnQueDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGlzaW9uWCA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuc3BlZWQueCA+IDAgJiYgKHNlbGZQcmVBYWJiLnhNaW4gPCBvdGhlclByZUFhYmIueE1pbikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubm9kZS54ID0gb3RoZXJQcmVBYWJiLnhNaW4gLSBzZWxmUHJlQWFiYi53aWR0aCAtIHRoaXMubm9kZS5wYXJlbnQueDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGlzaW9uWCA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3BlZWQueCA9IDA7XHJcbiAgICAgICAgICAgIG90aGVyLnRvdWNoaW5nWCA9IHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIDNyZCBzdGVwXHJcbiAgICAgICAgLy8gZm9yd2FyZCB5LWF4aXMsIGNoZWNrIHdoZXRoZXIgY29sbGlzaW9uIG9uIHktYXhpc1xyXG4gICAgICAgIHNlbGZQcmVBYWJiLnkgPSBzZWxmQWFiYi55O1xyXG4gICAgICAgIG90aGVyUHJlQWFiYi55ID0gb3RoZXJBYWJiLnk7XHJcblxyXG4gICAgICAgIGlmIChjYy5JbnRlcnNlY3Rpb24ucmVjdFJlY3Qoc2VsZlByZUFhYmIsIG90aGVyUHJlQWFiYikpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3BlZWQueSA8IDAgJiYgKHNlbGZQcmVBYWJiLnlNYXggPiBvdGhlclByZUFhYmIueU1heCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubm9kZS55ID0gb3RoZXJQcmVBYWJiLnlNYXggLSB0aGlzLm5vZGUucGFyZW50Lnk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29sbGlzaW9uWSA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuc3BlZWQueSA+IDAgJiYgKHNlbGZQcmVBYWJiLnlNaW4gPCBvdGhlclByZUFhYmIueU1pbikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubm9kZS55ID0gb3RoZXJQcmVBYWJiLnlNaW4gLSBzZWxmUHJlQWFiYi5oZWlnaHQgLSB0aGlzLm5vZGUucGFyZW50Lnk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbGxpc2lvblkgPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNwZWVkLnkgPSAwO1xyXG4gICAgICAgICAgICBvdGhlci50b3VjaGluZ1kgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG9uQ29sbGlzaW9uRXhpdDogZnVuY3Rpb24gKG90aGVyKSB7XHJcbiAgICAgICAgdGhpcy50b3VjaGluZ051bWJlci0tO1xyXG4gICAgICAgIC8vIGlmICh0aGlzLnRvdWNoaW5nTnVtYmVyID09PSAwKSB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMubm9kZS5jb2xvciA9IGNjLkNvbG9yLldISVRFO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgaWYgKG90aGVyLnRvdWNoaW5nWCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxpc2lvblggPSAwO1xyXG4gICAgICAgICAgICBvdGhlci50b3VjaGluZ1ggPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAob3RoZXIudG91Y2hpbmdZKSB7XHJcbiAgICAgICAgICAgIG90aGVyLnRvdWNoaW5nWSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxpc2lvblkgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmp1bXBpbmcgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ub2RlLmNvbG9yID0gdGhpcy5uZXdDb2xvcjtcclxuICAgIH0sXHJcblxyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbGxpc2lvblkgPT09IDApIHsvL+WmguaenFnovbTmsqHmnInnorDmkp5cclxuICAgICAgICAgICAgdGhpcy5zcGVlZC55ICs9IHRoaXMuZ3Jhdml0eSAqIGR0O1xyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5zcGVlZC55KSA+IHRoaXMubWF4U3BlZWQueSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcGVlZC55ID0gdGhpcy5zcGVlZC55ID4gMCA/IHRoaXMubWF4U3BlZWQueSA6IC10aGlzLm1heFNwZWVkLnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zcGVlZC54ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zcGVlZC54IC09IHRoaXMuYWNjZSAqIGR0O1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3BlZWQueCA8PSAwKSB0aGlzLnNwZWVkLnggPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuc3BlZWQueCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3BlZWQueCArPSB0aGlzLmFjY2UgKiBkdDtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNwZWVkLnggPj0gMCkgdGhpcy5zcGVlZC54ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zcGVlZC54ICs9ICh0aGlzLmRpcmVjdGlvbiA+IDAgPyAxIDogLTEpICogdGhpcy5hY2NlICogZHQ7XHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnNwZWVkLngpID4gdGhpcy5tYXhTcGVlZC54KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNwZWVkLnggPSB0aGlzLnNwZWVkLnggPiAwID8gdGhpcy5tYXhTcGVlZC54IDogLXRoaXMubWF4U3BlZWQueDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ub2RlLnggKz0gdGhpcy5zcGVlZC54ICogZHQ7XHJcbiAgICAgICAgdGhpcy5ub2RlLnkgKz0gdGhpcy5zcGVlZC55ICogZHQ7XHJcbiAgICAgICAgaWYodGhpcy5ub2RlLnkgPD0gdGhpcy5ncm91bmRZKXtcclxuICAgICAgICAgICAgdGhpcy5ub2RlLnkgPSB0aGlzLmdyb3VuZFk7XHJcbiAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbn0pOyJdLCJzb3VyY2VSb290IjoiIn0=