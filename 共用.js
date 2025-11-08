const deviceWidth = device.width;
const deviceHeight = device.height;

const targetWidth = 1080;
const targetHeight = 2400;

// 计算缩放比例
const scaleX = deviceWidth / targetWidth;
const scaleY = deviceHeight / targetHeight;

var 上一次点击坐标 = {
    x: null,
    y: null
}; // 全局：保存最后一次点击坐标
var 总路径 = "/storage/emulated/0/Pictures/Screenshots/";

function 点击(a, b) {
    c = a * scaleX;
    d = b * scaleY;
    click(c, d);
}

function 按压(a, b, e) {
    c = a * scaleX;
    d = b * scaleY;
    press(c, d, e);
}

function 滑动(a, b, c, d, e) {
    f = a * scaleX;
    g = b * scaleY;
    h = c * scaleX;
    i = d * scaleY;
    swipe(f, g, h, i, e);
}

function 滑动1(qx, qy, zx, zy, duration) {
    var startX = Math.floor(qx * scaleX);
    var startY = Math.floor(qy * scaleY);
    var endX = Math.floor(zx * scaleX);
    var endY = Math.floor(zy * scaleY);
    
    // 添加随机偏移模拟真人
    var offsetX = random(-5, 5);
    var offsetY = random(-5, 5);
    var actualDuration = duration + random(-100, 100);
    
    swipe(startX + offsetX, startY + offsetY, endX + offsetX, endY + offsetY, actualDuration);
}

/* ======================  真人版（纯 ES5）  ====================== */
function 图片识别(小图片数组, 超时毫秒, 扩展对象) {
    var cfg = {
        点击: true,
        阈值: 0.9,
        区域: null,
        随机偏移: true,
        偏移范围: 5,
        长按: false,
        按时长: 0,
        双击: false,
        双击间隔: 80,
        最大点击次数: Infinity,
        二次确认: false,
        回调: null,
        日志: true,
        灰度: false,
        旋转: null,
        找色: false,
        首次延迟: 500,
        循环延迟: 500
    };
    if (扩展对象) {
        for (var key in 扩展对象) {
            if (扩展对象.hasOwnProperty(key)) cfg[key] = 扩展对象[key];
        }
    }
    if (cfg.按时长 === 0) cfg.按时长 = random(300, 600);

    var 开始时间 = Date.now();
    var 小图对象数组 = [];
    for (var i = 0; i < 小图片数组.length; i++) {
        var name = 小图片数组[i];
        var img = images.read(总路径 + name);
        if (img) 小图对象数组.push({
            name: name,
            img: img
        });
        else if (cfg.日志) log("⚠️ 未找到图片文件：" + name);
    }
    if (小图对象数组.length === 0) {
        if (cfg.日志) log("没有任何有效的小图");
        return false;
    }

    function 回收资源() {
        for (var j = 0; j < 小图对象数组.length; j++) {
            try {
                小图对象数组[j].img.recycle();
            } catch (e) {}
        }
    }

    try {
        while (true) {
            if (Date.now() - 开始时间 >= 超时毫秒) {
                if (cfg.日志) log("⏰ 已超时");
                break;
            }

            var 大图片 = captureScreen();
            if (!大图片) continue;

            for (var k = 0; k < 小图对象数组.length; k++) {
                var name = 小图对象数组[k].name;
                var img = 小图对象数组[k].img;

                var 角度列表 = cfg.旋转 || [0];
                for (var a = 0; a < 角度列表.length; a++) {
                    var 角度 = 角度列表[a];
                    var option = {
                        threshold: cfg.阈值,
                        region: cfg.区域,
                        grayscale: cfg.灰度,
                        rotation: 角度 || 0,
                        pixelMatch: cfg.找色
                    };
                    var p = findImage(大图片, img, option);
                    if (!p) continue;

                    /* 首次点击 */
                    var x = p.x + img.width / 2;
                    var y = p.y + img.height / 2;
                    if (cfg.随机偏移) {
                        x += random(-cfg.偏移范围, cfg.偏移范围);
                        y += random(-cfg.偏移范围, cfg.偏移范围);
                    }
                    上一次点击坐标.x = x;
                    上一次点击坐标.y = y;
                    /* 新增：如果禁止点击，直接返回成功 */
                    if (!cfg.点击) {
                        if (cfg.日志) log("✅ 图片 " + name + " 已找到（未点击），返回成功");
                        回收资源();
                        return true;
                    }
                    if (cfg.点击) {
                        if (cfg.回调) cfg.回调({
                            name: name,
                            x: x,
                            y: y
                        });
                        if (cfg.长按) {
                            press(x, y, cfg.按时长);
                        } else if (cfg.双击) {
                            press(x, y, 50);
                            sleep(cfg.双击间隔);
                            press(x, y, 50);
                        } else {
                            press(x, y, random(20, 80));
                        }
                    }
                    sleep(cfg.首次延迟);

                    /* 子循环：点到消失 */
                    var 循环次数 = 0;
                    var 未检测到次数 = 0;
                    while (true) {
                        if (Date.now() - 开始时间 >= 超时毫秒) {
                            if (cfg.日志) log("子循环超时");
                            回收资源();
                            return false;
                        }
                        if (循环次数 >= cfg.最大点击次数) {
                            if (cfg.日志) log("达到最大点击次数，放弃");
                            回收资源();
                            return false;
                        }

                        大图片 = captureScreen();
                        var newP = findImage(大图片, img, {
                            threshold: cfg.阈值 + 0.05,
                            region: cfg.区域,
                            grayscale: cfg.灰度
                        });
                        if (!newP) {
                            未检测到次数++;
                            if (cfg.二次确认 && 未检测到次数 < 2) {
                                sleep(100);
                                continue;
                            }
                            if (cfg.日志) log("✅ 图片 " + name + " 已消失，共点击 " + (循环次数 + 1) + " 次");
                            回收资源();
                            return true;
                        } else {
                            未检测到次数 = 0;
                        }

                        x = newP.x + img.width / 2;
                        y = newP.y + img.height / 2;
                        if (cfg.随机偏移) {
                            x += random(-cfg.偏移范围, cfg.偏移范围);
                            y += random(-cfg.偏移范围, cfg.偏移范围);
                        }
                        上一次点击坐标.x = x;
                        上一次点击坐标.y = y;
                        if (cfg.日志) log("循环点击 " + name + " 第 " + (++循环次数) + " 次 (" + x + "," + y + ")");
                        if (cfg.点击) {
                            if (cfg.回调) cfg.回调({
                                name: name,
                                x: x,
                                y: y
                            });
                            if (cfg.长按) {
                                press(x, y, cfg.按时长);
                            } else if (cfg.双击) {
                                press(x, y, 50);
                                sleep(cfg.双击间隔);
                                press(x, y, 50);
                            } else {
                                press(x, y, random(20, 80));
                            }
                        }
                        sleep(cfg.循环延迟);
                    }
                }
            }
            sleep(200);
        }
    } finally {
        回收资源();
    }
    return false;
}

/* ======================  假人版（可自定义偏移，默认不偏移）  ====================== */
function 图片识别假人(小图片数组, 超时毫秒, 扩展对象) {
    // 默认假人：不偏移
    var 假人默认 = {
        随机偏移: false,
        偏移范围: 0
    };

    // 如果调用者显式传了偏移范围，就交给他控制
    if (扩展对象) {
        // 只要传了“偏移范围”字段，就允许他自己设
        if (typeof 扩展对象.偏移范围 !== "undefined") {
            // 打开随机开关，并采用他指定的像素值
            假人默认.随机偏移 = true;
            假人默认.偏移范围 = 扩展对象.偏移范围;
        }
        // 其余字段继续合并
        for (var k in 扩展对象) {
            if (扩展对象.hasOwnProperty(k) && k !== "偏移范围")
                假人默认[k] = 扩展对象[k];
        }
    }

    return 图片识别(小图片数组, 超时毫秒, 假人默认);
}



/*
 *  找图一次 增强版（纯 ES5 语法）
 *  老调用：找图一次(["a.png","b.png"], false)
 *  新功能通过第三个对象参数开启
 */
function 找图一次(图片数组, 返回详情, 扩展对象) {
    var cfg = {
        点击: true,
        阈值: 0.95,
        区域: null,
        随机偏移: false,
        偏移范围: 5,
        长按: false,
        按时长: 0,
        双击: false,
        双击间隔: 80,
        回调: null,
        日志: true,
        多目标: false,
        找色: false,
        超时: 0,
        间隔: 100
    };
    if (扩展对象) {
        for (var key in 扩展对象) {
            if (扩展对象.hasOwnProperty(key)) cfg[key] = 扩展对象[key];
        }
    }
    if (cfg.按时长 === 0) cfg.按时长 = random(300, 600);

    var 大图片 = captureScreen();
    if (!大图片) {
        if (cfg.日志) log("❌ 截屏失败");
        return 返回详情 ? null : false;
    }

    var 结果池 = [];

    function 点击坐标(x, y) {
        if (cfg.随机偏移) {
            x += random(-cfg.偏移范围, cfg.偏移范围);
            y += random(-cfg.偏移范围, cfg.偏移范围);
        }
        if (cfg.长按) {
            press(x, y, cfg.按时长);
        } else if (cfg.双击) {
            press(x, y, 50);
            sleep(cfg.双击间隔);
            press(x, y, 50);
        } else {
            press(x, y, random(20, 80));
        }
    }

    var 开始时间 = Date.now();
    do {
        for (var i = 0; i < 图片数组.length; i++) {
            var name = 图片数组[i];
            var path = files.join(总路径, name);
            var 小图片 = images.read(path);
            if (!小图片) {
                if (cfg.日志) log("⚠️ 加载失败：" + name);
                continue;
            }

            var option = {
                threshold: cfg.阈值
            };
            if (cfg.区域) option.region = cfg.区域;
            if (cfg.灰度) option.grayscale = true;
            if (cfg.找色) option.pixelMatch = true;

            var p = findImage(大图片, 小图片, option);
            if (p) {
                var x = p.x + 小图片.getWidth() / 2;
                var y = p.y + 小图片.getHeight() / 2;
                var obj = {
                    name: name,
                    x: x,
                    y: y
                };

                if (cfg.回调) cfg.回调(obj);
                if (cfg.点击) 点击坐标(x, y);

                小图片.recycle();

                if (cfg.多目标) {
                    结果池.push(obj);
                    continue;
                }
                return 返回详情 ? obj : true;
            }
            小图片.recycle();
        }
        if (cfg.超时 > 0) sleep(cfg.间隔);
    } while (cfg.超时 > 0 && Date.now() - 开始时间 < cfg.超时);

    if (cfg.多目标) return 返回详情 ? (结果池.length ? 结果池 : null) : !!结果池.length;
    return 返回详情 ? null : false;
}


function 截屏权限() {
    /*let thread = threads.start(function() {
        sleep(1000);
        按压(550+random(-10,10), 2046+random(-5,-5),random(10,400));
    });*/
    sleep(2000)
    if (!requestScreenCapture()) {
        thread.interrupt();
        toast("请手动授权截图权限");
        exit();
    } else {
        log("已经获得截屏权限");
        /*if(app.versionName=="4.1.1 Alpha2")
        {
        sleep(1000);
        按压(550+random(-5,5),2046+random(-5,5),random(10,400));
        thread.interrupt();
        }

        */
    }
    sleep(random(2000, 3000));
}



/**
 *  增强版 控件()
 *  老调用：控件("text=登录",10000,1,0,0)   照旧生效
 *  新调用：控件("text=登录",10000,1,0,0,{
 *            点击方式:"long",      // click/long/double/swipe
 *            滑动终点:[x,y],      // 点击方式为 swipe 时必填
 *            滑动时长:600,
 *            长按时长:800,
 *            双击间隔:120,
 *            点击前等待:300,      // 找到后、点击前额外 sleep
 *            点击后等待:500,      // 点击后 sleep
 *            可点击检测:true,     // 只点 clickable=true 且 visibleToUser=true
 *            失败截图:true,       // 点击失败时自动截图（钩子函数，实现留空）
 *            滑动查找:true,       // 找不到时先上滑再下滑
 *            滑动方向:"up",       // up/down
 *            滑动距离:0.4,        // 屏幕比例 0.4=40%
 *            滑动次数:5,
 *            成功回调:null,       // 点击成功时回调 function(x,y){}
 *            失败回调:null        // 超时仍未找到时回调 function(){}
 *         });
 */
function 控件(控件名, 总耗时, 第几个, offerx, offery, 选项) {
    /* ---------- 0. 默认值 ---------- */
    if (offerx === undefined) offerx = 0;
    if (offery === undefined) offery = 0;
    选项 = 选项 || {};
    var 点击方式 = 选项.点击方式 || "click";
    var 长按时长 = 选项.长按时长 || random(600, 900);
    var 双击间隔 = 选项.双击间隔 || 120;
    var 滑动终点 = 选项.滑动终点 || null;
    var 滑动时长 = 选项.滑动时长 || 300;
    var 点击前等待 = 选项.点击前等待 || 0;
    var 点击后等待 = 选项.点击后等待 || 500;
    var 可点击检测 = 选项.可点击检测 || false;
    var 失败截图 = 选项.失败截图 || false;
    var 滑动查找 = 选项.滑动查找 || false;
    var 滑动方向 = 选项.滑动方向 || "up";
    var 滑动距离 = 选项.滑动距离 || 0.4;
    var 滑动次数 = 选项.滑动次数 || 5;
    var 成功回调 = 选项.成功回调 || null;
    var 失败回调 = 选项.失败回调 || null;
    var 命中标记 = false;

    /* ---------- 1. 解析控件 ---------- */
    var parts = 控件名.split(/\s*=\s*/);
    var type = parts[0].trim();
    var name = parts[1].trim();

    /* ---------- 2. 查找函数 ---------- */
    function find() {
        var res;
        switch (type) {
            case "id":
                res = id(name).find();
                break;
            case "className":
                res = className(name).find();
                break;
            case "desc":
                res = desc(name).find();
                break;
            case "text":
                res = text(name).find();
                break;
            case "textMatches":
                res = textMatches(name).find();
                break;
            case "textStartsWith":
                res = textStartsWith(name).find();
                break;
            default:
                log("控件类型不存在: " + type);
                return null;
        }
        if (res && res.length > 0) {
            log("已找到 " + res.length + " 个控件（type=" + type + ", name=" + name + "）");
        }
        return res;
    }

    /* ---------- 3. 滑动查找 ---------- */
    function 滑动查找() {
        var dist = Math.round((滑动方向 === "up" ? -1 : 1) * deviceHeight * 滑动距离);
        for (var i = 0; i < 滑动次数; i++) {
            swipe(deviceWidth / 2, deviceHeight / 2,
                deviceWidth / 2, deviceHeight / 2 + dist, 300);
            sleep(500);
            var tmp = find();
            if (tmp && tmp.length) return tmp;
        }
        return null;
    }

    /* ---------- 4. 真正点击 ---------- */
    function 真实点击(x, y) {
        if (点击方式 === "long") {
            press(x, y, 长按时长);
        } else if (点击方式 === "double") {
            press(x, y, 50);
            sleep(双击间隔);
            press(x, y, 50);
        } else if (点击方式 === "swipe") {
            if (!滑动终点) {
                log("错误：滑动终点未配置");
                return;
            }
            swipe(x, y, 滑动终点[0] * scaleX, 滑动终点[1] * scaleY, 滑动时长);
        } else {
            press(x, y, random(30, 80));
        }
    }

    /* ---------- 5. 主循环 + 每秒倒计时 ---------- */
    var 开始时间 = new Date().getTime();
    var 上次倒计时秒 = -1;
    while (true) {
        var 已用 = new Date().getTime() - 开始时间;
        var 剩余 = 总耗时 - 已用;
        if (剩余 <= 0) break;

        /* 每秒打印一次剩余秒 */
        var 剩余秒 = Math.ceil(剩余 / 1000);
        if (剩余秒 !== 上次倒计时秒) {
            log(">>> 查找「" + name + "」剩余 " + 剩余秒 + " 秒");
            上次倒计时秒 = 剩余秒;
        }

        var elements = find();
        if (!elements || !elements.length) {
            if (滑动查找) elements = 滑动查找();
            if (!elements || !elements.length) {
                sleep(200);
                continue;
            }
        }

        /* ---------- 6. 内层：点到消失 ---------- */
        do {
            var elem = elements.get(Math.max(0, 第几个 - 1));
            var b = elem.bounds();
            var x = (b.left + b.right) / 2 + offerx * scaleX;
            var y = (b.top + b.bottom) / 2 + offery * scaleY;

            if (x < 0 || x > deviceWidth || y < 0 || y > deviceHeight) {
                log("控件坐标越界，跳过");
                return false;
            }
            if (可点击检测 && (!elem.clickable() || !elem.visibleToUser())) {
                log("控件不可点击或不可见，跳过");
                return false;
            }

            if (点击前等待) sleep(点击前等待);

            /* 标记命中并执行点击 */
            命中标记 = true;
            真实点击(x, y);
            上一次点击坐标.x = x;
            上一次点击坐标.y = y;
            if (成功回调) 成功回调(x, y);
            if (点击后等待) sleep(点击后等待);

            /* 重新获取 */
            elements = find();
        } while (elements && elements.length && (new Date().getTime() - 开始时间 < 总耗时));

        /* 早退：已经点过，直接结束 */
        return 命中标记;
    }

    /* ---------- 7. 超时仍未找到 ---------- */
    if (失败截图) {
        log("点击失败，准备截图...");
        // 截屏和图片存储("控件失败_" + name);
    }
    if (失败回调) 失败回调();
    return false;
}

/* ====================== 使用示例 ====================== */
/*
if (typeof module !== "undefined" && module.exports) {
    // 如果您用 commonjs 导出 
    module.exports.控件 = 控件;
}
*/
/* 老调用，完全兼容 */
// 控件("text=允许", 8000, 1, 0, 0);

/* 新调用，打开全部增强 */
/*
控件("text=允许", 8000, 1, 0, 0, {
    点击方式: "long",
    长按时长: 1000,
    可点击检测: true,
    滑动查找: true,
    滑动方向: "down",
    失败截图: true,
    成功回调: function(x, y) {
        log("成功点击允许，坐标：" + x + "," + y);
    },
    失败回调: function() {
        log("找了 8 秒也没找到允许按钮！");
    }
});
*/


// 主函数：截屏并添加文字标记
function 截屏和图片存储(图片标记) {
    // 使用时间戳命名图片
    var 时间戳 = new Date().getTime();
    var 文件名 = 时间戳 + ".png";
    var 路径 = "/storage/emulated/0/Pictures/Screenshots/" + 文件名;

    if (files.exists(路径)) {
        log("文件已存在！");
        exit();
    }

    const 图片 = captureScreen();
    图片.saveTo(路径);
    log("截图已保存到：" + 路径);

    /* ================= 以下开始绘图 ================= */
    importClass(android.graphics.Bitmap);
    importClass(android.graphics.BitmapFactory);
    importClass(android.graphics.Paint);
    importClass(android.graphics.Typeface);
    importClass(java.io.ByteArrayOutputStream);

    var bitmap = BitmapFactory.decodeFile(路径);
    var mutableBitmap = bitmap.copy(Bitmap.Config.ARGB_8888, true);
    var canvas = new android.graphics.Canvas(mutableBitmap);

    var width = mutableBitmap.getWidth();
    var height = mutableBitmap.getHeight();

    /* ------------ 第一行：图片标记 ------------ */
    var paint = new Paint();
    paint.setARGB(255, 0, 255, 0); // 红色
    paint.setTextSize(100);
    paint.setTypeface(Typeface.DEFAULT_BOLD);
    paint.setAntiAlias(true);

    var textWidth = paint.measureText(图片标记);
    var textHeight = paint.getTextSize();
    var x1 = (width - textWidth) / 2;
    var y1 = (height + textHeight) / 2 - textHeight / 2; // 垂直居中后稍上移

    canvas.drawText(图片标记, x1, y1, paint);

    /* ------------ 第二行：月.日 几点钟 ------------ */
    var now = new Date();
    var month = now.getMonth() + 1; // 月份从 0 开始
    var day = now.getDate();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    minutes = minutes < 10 ? "0" + minutes : minutes; // 补零
    var timeStr = month + "." + day + "  " + hours + ":" + minutes;

    paint.setTextSize(70); // 字号小一点
    var timeWidth = paint.measureText(timeStr);
    var timeHeight = paint.getTextSize();
    var x2 = (width - timeWidth) / 2;
    var y2 = y1 + textHeight + 30; // 向下偏移

    canvas.drawText(timeStr, x2, y2, paint);

    /* ------------ 保存覆盖原文件 ------------ */
    var stream = new ByteArrayOutputStream();
    mutableBitmap.compress(Bitmap.CompressFormat.PNG, 100, stream);
    var bytes = stream.toByteArray();
    files.writeBytes(路径, bytes);

    /* ------------ 通知相册刷新 ------------ */
    importClass(android.content.Intent);
    importClass(android.net.Uri);

    function scanFile(path) {
        var file = new java.io.File(path);
        var uri = Uri.fromFile(file);
        var intent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, uri);
        context.sendBroadcast(intent);
    }

    scanFile(路径);
    log("已通知相册刷新");
    log("图片路径：\n" + 路径);
}


function unload(次数, startX, startY) {
    // 可根据设计时分辨率设定，跨设备自动缩放（可选）
    // setScreenMetrics(1080, 1920);   // 示例：1080×1920 设计分辨率

    let x = startX * scaleX + random(-3, 3);
    let y = startY * scaleY + random(-3, 3);

    for (let i = 0; i < 次数; i++) {
        // 点击
        press(x, y, random(100, 300));
        sleep(random(200, 400)); // 可视情况调整间隔

        // 每点 3 次后纵坐标 +300，否则横坐标 +200
        if ((i + 1) % 4 === 0) {
            y += (215 + random(-3, 3));
            x = startX * scaleX + random(-3, 3); // 横坐标复位
        } else {
            x += (210 + random(-3, 3));
        }
    }
    sleep(random(800, 1100));
    press(750 * scaleX + random(-3, 3), 2180 * scaleY + random(-3, 3), random(100, 300));
    sleep(random(700, 1100))
    press(522 * scaleX + random(-3, 3), 2010 * scaleY + random(-3, 3), random(100, 300))
}


function done(任务名) {
    sleep(1000)
    var dir = "/storage/emulated/0/";
    var file = dir + "信号文件.txt";
    files.createWithDirs(file);

    var content = 任务名 + ":done";
    files.write(file, content);
    java.lang.Runtime.getRuntime().exec("sync");

    // ✅ 校验
    var readBack = files.read(file);
    if (readBack.trim() !== content) {
        log("⚠️ 写入失败，重试...");
        sleep(300);
        files.write(file, content);
    } else {
        log("✅ 信号已写入：" + content);
    }
}

function locallog(任务名, 错误) {
    // 定义要写入的文件路径（例如：/sdcard/脚本/log.txt）
    let filePath = "/storage/emulated/0/Download/Notes/export/日志.txt";

    // 要追加的内容
    let contentToAppend = 任务名 + "——" + 错误 + "\n\n\n";

    try {
        // 检查文件是否存在，如果不存在则创建
        if (!files.exists(filePath)) {
            files.createWithDirs(filePath);
        }

        // 以追加模式打开文件并写入内容
        let file = open(filePath, "a"); // "a" 表示追加模式
        file.write(contentToAppend);
        file.flush();
        file.close();

        toast("内容已成功追加到文件");
    } catch (e) {
        console.error("追加文件时出错: " + e);
    }
}

exports.截屏权限 = 截屏权限;
exports.点击 = 点击;
exports.滑动 = 滑动;
exports.滑动1 = 滑动1;
exports.按压 = 按压;

exports.图片识别 = 图片识别;
exports.图片识别假人 = 图片识别假人;
exports.找图一次 = 找图一次;
exports.截屏和图片存储 = 截屏和图片存储;
exports.控件 = 控件;

exports.上一次点击坐标 = 上一次点击坐标;
exports.unload = unload;
exports.locallog = locallog;
exports.done = done;