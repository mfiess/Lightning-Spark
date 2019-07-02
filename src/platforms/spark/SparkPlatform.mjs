import fs from "fs";
import canvas from "canvas";
import http from "http";
import https from "https";

export default class SparkPlatform {
    
    init(stage) {
        this.stage = stage;
        this._looping = false;
        this._awaitingLoop = false;
    }

    destroy() {
    }

    startLoop() {
        this._looping = true;
        if (!this._awaitingLoop) {
            this.loop();
        }
    }

    stopLoop() {
        this._looping = false;
    }

    loop() {
        let self = this;
        let lp = function() {
            self._awaitingLoop = false;
            if (self._looping) {
                self.stage.drawFrame();
                if (self.changes) {
                    // We depend on blit to limit to 60fps.
                    setImmediate(lp);
                } else {
                    setTimeout(lp, 16);
                }
                self._awaitingLoop = true;
            }
        }
        setTimeout(lp, 16);
    }

    uploadGlTexture(gl, textureSource, source, options) {
        gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, textureSource.w, textureSource.h, 0, options.format, options.type, source);
    }

    loadSrcTexture({src}, cb) {
        let sparkImage = sparkscene.create({t:"image",url:src});
        const sparkGl = this.stage.gl;
        sparkImage.ready.then( function(obj) {
            let texture = sparkImage.texture();
            cb(null, {source: sparkGl.createWebGLTexture(texture), w: sparkImage.resource.w, h: sparkImage.resource.h, premultiplyAlpha: false, flipBlueRed: false, internal: sparkImage});
        });
    }

    createRoundRect(cb, stage, w, h, radius, strokeWidth, strokeColor, fill, fillColor) {
        if (fill === undefined) fill = true;
        if (strokeWidth === undefined) strokeWidth = 0;

        fillColor = fill ? fillColor : "none";
        var boundW = w;
        var boundH = h;
        var data = "data:image/svg,"+'<svg viewBox="0 0 '+boundW+' '+boundH+'" xmlns="http://www.w3.org/2000/svg"><rect width="'+w+'" height="'+h+'" fill="'+fillColor+'" rx="'+radius+'" stroke="'+strokeColor+'" stroke-width="'+strokeWidth+'"/></svg>';
    
        var imageObj = sparkscene.create({ t: "image", url:data});
        imageObj.ready.then( function(obj) {
            imageObj.w = w;
            imageObj.h = h;
            cb(null, imageObj);
        });
    }

    createShadowRect(cb, stage, w, h, radius, blur, margin) {
        var boundW = w + margin * 2;
        var boundH = h + margin * 2;
        var data = "data:image/svg,"+
            '<svg viewBox="0 0 '+boundW+' '+boundH+'" xmlns="http://www.w3.org/2000/svg" version="1.1"> \
                    <linearGradient id="rectGradient" gradientUnits="userSpaceOnUse" x1="0%" y1="180%" x2="100%" y2="-60%" gradientTransform="rotate(0)"> \
                    <stop offset="20%" stop-color="#00FF00" stop-opacity="0.5"/> \
                    <stop offset="50%" stop-color="#0000FF" stop-opacity=".8"/> \
                    <stop offset="80%" stop-color="#00FF00" stop-opacity=".5"/> \
                    </linearGradient> \
                    <filter id="rectBlur" x="0" y="0"> \
                    <feGaussianBlur in="SourceGraphic" stdDeviation="'+blur+'" /> \
                    </filter> \
                </defs> \
                <g enable-background="new" > \
                    <rect x="0" y="0" width="'+boundW+'" height="'+boundH+'" fill="url(#rectGradient)"  rx="'+radius+'" stroke-width="'+margin+'" filter="url(#rectBlur)"/> \
                </g> \
                </svg>';
    
        var imageObj = sparkscene.create({ t: "image", url:"/Users/mfiess200/Downloads/simple-ightning-spark-apps-20190620_mod/simpleRoundRect/dist/spark/static/banana.png"});
        imageObj.ready.then( function(obj) {
            imageObj.w = imageObj.resource.w;
            imageObj.h = imageObj.resource.h;
            cb(null, imageObj);
        });
    }

    createSvg(cb, stage, url, w, h) {
        var imageObj = sparkscene.create({ t: "image", url:ur});
        imageObj.ready.then( function(obj) {
            imageObj.w = w;
            imageObj.h = h;
            cb(null, imageObj);
        }, function(obj) {
            cb(null, imageObj);;
        });
    }

    createWebGLContext(w, h) {
        let options = {width: w, height: h, title: "WebGL"};
        const windowOptions = this.stage.getOption('window');
        if (windowOptions) {
            options = Object.assign(options, windowOptions);
        }
        let gl = sparkgles2.init(options);
        return gl;
    }

    getWebGLCanvas() {
        return;
    }

    getTextureOptionsForDrawingCanvas(canvas) {
        let options = {};

        options.source = this.stage.gl.createWebGLTexture(canvas.texture());
        options.w = canvas.w;
        options.h = canvas.h;
        options.premultiplyAlpha = false;
        options.flipBlueRed = false
        options.internal = canvas;

        return options;
    }

    getHrTime() {
        let hrTime = process.hrtime();
        return 1e3 * hrTime[0] + (hrTime[1] / 1e6);
    }

    getDrawingCanvas() {
        // We can't reuse this canvas because textures may load async.
        return new canvas.Canvas(0, 0);
    }

    nextFrame(changes) {
        this.changes = changes;
        //gles2.nextFrame(changes);
    }

    registerKeyHandler(keyhandler) {
        console.warn("No support for key handling");
    }

}

