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