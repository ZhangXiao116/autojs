/**
 * 共用函数库 - 自动化脚本工具集
 * 提供截图、点击、滑动、图片识别、控件操作等常用功能
 * 支持多设备分辨率自适应
 */

// 设备信息
const deviceWidth = device.width;
const deviceHeight = device.height;

// 设计分辨率（基于1080×2400设计）
const targetWidth = 1080;
const targetHeight = 2400;

// 计算缩放比例（用于不同分辨率设备）
const scaleX = deviceWidth / targetWidth;
const scaleY = deviceHeight / targetHeight;

/**
 * 全局变量 - 记录最后一次点击坐标
 * 用途：在某些情况下需要重复点击同一位置时使用
 */
var 上一次点击坐标 = {
    x: null,
    y: null
};

/**
 * 图片存储路径
 * 用途：所有截图和模板图片都存储在这个目录
 */
var 总路径 = "/storage/emulated/0/Pictures/Screenshots/";

/**
 * 点击屏幕指定坐标
 * @param {number} x - 要点击的X坐标（基于1080×2400设计分辨率）
 * @param {number} y - 要点击的Y坐标（基于1080×2400设计分辨率）
 * @example
 * 点击(500, 1000); // 点击屏幕(500,1000)位置，会自动适配当前设备分辨率
 */
function 点击(x, y) {
    var actualX = x * scaleX;
    var actualY = y * scaleY;
    click(actualX, actualY);
    
    // 记录点击坐标
    上一次点击坐标.x = actualX;
    上一次点击坐标.y = actualY;
}

/**
 * 长按屏幕指定坐标
 * @param {number} x - 要按压的X坐标（基于1080×2400设计分辨率）
 * @param {number} y - 要按压的Y坐标（基于1080×2400设计分辨率）
 * @param {number} duration - 按压持续时间（毫秒）
 * @example
 * 按压(500, 1000, 1000); // 在(500,1000)位置长按1秒钟
 */
function 按压(x, y, duration) {
    var actualX = x * scaleX;
    var actualY = y * scaleY;
    press(actualX, actualY, duration);
    
    // 记录点击坐标
    上一次点击坐标.x = actualX;
    上一次点击坐标.y = actualY;
}

/**
 * 在屏幕上滑动
 * @param {number} startX - 滑动起点的X坐标（基于1080×2400设计分辨率）
 * @param {number} startY - 滑动起点的Y坐标（基于1080×2400设计分辨率）
 * @param {number} endX - 滑动终点的X坐标（基于1080×2400设计分辨率）
 * @param {number} endY - 滑动终点的Y坐标（基于1080×2400设计分辨率）
 * @param {number} duration - 滑动持续时间（毫秒）
 * @example
 * 滑动(500, 1500, 500, 500, 1000); // 从(500,1500)滑动到(500,500)，用时1秒
 */
function 滑动(startX, startY, endX, endY, duration) {
    var actualStartX = startX * scaleX;
    var actualStartY = startY * scaleY;
    var actualEndX = endX * scaleX;
    var actualEndY = endY * scaleY;
    swipe(actualStartX, actualStartY, actualEndX, actualEndY, duration);
}

/**
 * 真人版滑动（带随机偏移，模拟真人操作）
 * @param {number} startX - 滑动起点的X坐标（基于1080×2400设计分辨率）
 * @param {number} startY - 滑动起点的Y坐标（基于1080×2400设计分辨率）
 * @param {number} endX - 滑动终点的X坐标（基于1080×2400设计分辨率）
 * @param {number} endY - 滑动终点的Y坐标（基于1080×2400设计分辨率）
 * @param {number} duration - 滑动持续时间（毫秒）
 * @example
 * 滑动1(500, 1500, 500, 500, 1000); // 带随机偏移的滑动，更接近真人操作
 */
function 滑动1(startX, startY, endX, endY, duration) {
    var actualStartX = Math.floor(startX * scaleX);
    var actualStartY = Math.floor(startY * scaleY);
    var actualEndX = Math.floor(endX * scaleX);
    var actualEndY = Math.floor(endY * scaleY);
    
    // 添加随机偏移模拟真人操作
    var offsetX = random(-5, 5);
    var offsetY = random(-5, 5);
    var actualDuration = duration + random(-100, 100);
    
    swipe(actualStartX + offsetX, actualStartY + offsetY, 
          actualEndX + offsetX, actualEndY + offsetY, actualDuration);
}

/**
 * 智能图片识别 - 在屏幕上查找并点击指定图片
 * @param {string[]} imageArray - 要查找的图片文件名数组
 * @param {number} timeout - 查找超时时间（毫秒）
 * @param {Object} [options] - 扩展选项（可选）
 * @param {boolean} [options.点击=true] - 是否自动点击找到的图片
 * @param {number} [options.阈值=0.9] - 图片匹配相似度阈值（0-1）
 * @param {number[]} [options.区域] - 查找区域[x,y,width,height]（可选）
 * @param {boolean} [options.随机偏移=true] - 是否在点击时添加随机偏移
 * @param {number} [options.偏移范围=5] - 随机偏移的范围（像素）
 * @param {boolean} [options.长按=false] - 是否使用长按代替点击
 * @param {number} [options.按时长=300-600] - 长按的持续时间（毫秒）
 * @param {boolean} [options.双击=false] - 是否使用双击
 * @param {number} [options.双击间隔=80] - 双击间隔时间（毫秒）
 * @param {Function} [options.回调] - 找到图片时的回调函数
 * @returns {boolean} 是否成功找到并点击图片
 * @example
 * // 基本用法：查找图片并点击
 * 图片识别(["按钮.png", "图标.jpg"], 5000);
 * 
 * // 高级用法：带配置选项
 * 图片识别(["确认按钮.png"], 3000, {
 *     阈值: 0.8,
 *     长按: true,
 *     按时长: 1000,
 *     回调: function(result) {
 *         log("找到图片位置：" + result.x + "," + result.y);
 *     }
 * });
 */
function 图片识别(imageArray, timeout, options) {
    // 默认配置
    var config = {
        点击: true,
        阈值: 0.9,
        区域: null,
        随机偏移: true,
        偏移范围: 5,
        长按: false,
        按时长: random(300, 600),
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
    
    // 合并用户配置
    if (options) {
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                config[key] = options[key];
            }
        }
    }

    var startTime = Date.now();
    var imageObjects = [];
    
    // 加载所有图片
    for (var i = 0; i < imageArray.length; i++) {
        var imageName = imageArray[i];
        var image = images.read(总路径 + imageName);
        if (image) {
            imageObjects.push({
                name: imageName,
                img: image
            });
        } else if (config.日志) {
            log("⚠️ 未找到图片文件：" + imageName);
        }
    }
    
    if (imageObjects.length === 0) {
        if (config.日志) log("没有任何有效的小图");
        return false;
    }

    // 资源回收函数
    function cleanup() {
        for (var j = 0; j < imageObjects.length; j++) {
            try {
                imageObjects[j].img.recycle();
            } catch (e) {}
        }
    }

    try {
        while (true) {
            // 检查超时
            if (Date.now() - startTime >= timeout) {
                if (config.日志) log("⏰ 图片识别已超时");
                break;
            }

            // 截取屏幕
            var screen = captureScreen();
            if (!screen) continue;

            // 遍历所有图片进行查找
            for (var k = 0; k < imageObjects.length; k++) {
                var imageName = imageObjects[k].name;
                var image = imageObjects[k].img;

                var angles = config.旋转 || [0];
                for (var a = 0; a < angles.length; a++) {
                    var angle = angles[a];
                    var findOptions = {
                        threshold: config.阈值,
                        region: config.区域,
                        grayscale: config.灰度,
                        rotation: angle || 0,
                        pixelMatch: config.找色
                    };
                    
                    var point = findImage(screen, image, findOptions);
                    if (!point) continue;

                    // 计算点击位置
                    var x = point.x + image.width / 2;
                    var y = point.y + image.height / 2;
                    
                    // 添加随机偏移
                    if (config.随机偏移) {
                        x += random(-config.偏移范围, config.偏移范围);
                        y += random(-config.偏移范围, config.偏移范围);
                    }
                    
                    // 记录点击坐标
                    上一次点击坐标.x = x;
                    上一次点击坐标.y = y;
                    
                    // 如果不点击，直接返回成功
                    if (!config.点击) {
                        if (config.日志) log("✅ 图片 " + imageName + " 已找到（未点击）");
                        cleanup();
                        return true;
                    }
                    
                    // 执行点击操作
                    if (config.点击) {
                        // 调用回调函数
                        if (config.回调) {
                            config.回调({
                                name: imageName,
                                x: x,
                                y: y
                            });
                        }
                        
                        // 根据配置执行不同类型的点击
                        if (config.长按) {
                            press(x, y, config.按时长);
                        } else if (config.双击) {
                            press(x, y, 50);
                            sleep(config.双击间隔);
                            press(x, y, 50);
                        } else {
                            press(x, y, random(20, 80));
                        }
                    }
                    
                    sleep(config.首次延迟);

                    // 循环点击直到图片消失
                    var clickCount = 0;
                    var notFoundCount = 0;
                    while (true) {
                        // 检查超时和最大点击次数
                        if (Date.now() - startTime >= timeout) {
                            if (config.日志) log("子循环超时");
                            cleanup();
                            return false;
                        }
                        if (clickCount >= config.最大点击次数) {
                            if (config.日志) log("达到最大点击次数，放弃");
                            cleanup();
                            return false;
                        }

                        // 重新截屏查找
                        screen = captureScreen();
                        var newPoint = findImage(screen, image, {
                            threshold: config.阈值 + 0.05,
                            region: config.区域,
                            grayscale: config.灰度
                        });
                        
                        if (!newPoint) {
                            notFoundCount++;
                            if (config.二次确认 && notFoundCount < 2) {
                                sleep(100);
                                continue;
                            }
                            if (config.日志) log("✅ 图片 " + imageName + " 已消失，共点击 " + (clickCount + 1) + " 次");
                            cleanup();
                            return true;
                        } else {
                            notFoundCount = 0;
                        }

                        // 更新点击位置
                        x = newPoint.x + image.width / 2;
                        y = newPoint.y + image.height / 2;
                        if (config.随机偏移) {
                            x += random(-config.偏移范围, config.偏移范围);
                            y += random(-config.偏移范围, config.偏移范围);
                        }
                        
                        上一次点击坐标.x = x;
                        上一次点击坐标.y = y;
                        
                        if (config.日志) log("循环点击 " + imageName + " 第 " + (++clickCount) + " 次 (" + x + "," + y + ")");
                        
                        // 执行点击
                        if (config.点击) {
                            if (config.回调) {
                                config.回调({
                                    name: imageName,
                                    x: x,
                                    y: y
                                });
                            }
                            
                            if (config.长按) {
                                press(x, y, config.按时长);
                            } else if (config.双击) {
                                press(x, y, 50);
                                sleep(config.双击间隔);
                                press(x, y, 50);
                            } else {
                                press(x, y, random(20, 80));
                            }
                        }
                        sleep(config.循环延迟);
                    }
                }
            }
            sleep(200);
        }
    } finally {
        cleanup();
    }
    return false;
}

/**
 * 假人版图片识别（无随机偏移，适合精确操作）
 * @param {string[]} imageArray - 要查找的图片文件名数组
 * @param {number} timeout - 查找超时时间（毫秒）
 * @param {Object} [options] - 扩展选项（可选）
 * @returns {boolean} 是否成功找到并点击图片
 * @example
 * 图片识别假人(["精确按钮.png"], 3000); // 精确点击，无随机偏移
 */
function 图片识别假人(imageArray, timeout, options) {
    // 默认配置：无偏移
    var defaultConfig = {
        随机偏移: false,
        偏移范围: 0
    };

    // 合并用户配置
    if (options) {
        // 如果用户指定了偏移范围，则启用随机偏移
        if (typeof options.偏移范围 !== "undefined") {
            defaultConfig.随机偏移 = true;
            defaultConfig.偏移范围 = options.偏移范围;
        }
        // 合并其他配置
        for (var key in options) {
            if (options.hasOwnProperty(key) && key !== "偏移范围") {
                defaultConfig[key] = options[key];
            }
        }
    }

    return 图片识别(imageArray, timeout, defaultConfig);
}

/**
 * 单次图片查找 - 快速查找图片一次
 * @param {string[]} imageArray - 要查找的图片文件名数组
 * @param {boolean} returnDetail - 是否返回详细信息
 * @param {Object} [options] - 扩展选项（可选）
 * @returns {boolean|Object} 找到返回true或详细信息，未找到返回false
 * @example
 * // 简单查找
 * if (找图一次(["图标.png"], false)) {
 *     log("找到图标");
 * }
 * 
 * // 获取详细信息
 * var result = 找图一次(["按钮.png"], true);
 * if (result) {
 *     log("找到按钮，位置：" + result.x + "," + result.y);
 * }
 */
function 找图一次(imageArray, returnDetail, options) {
    // 默认配置
    var config = {
        点击: true,
        阈值: 0.95,
        区域: null,
        随机偏移: false,
        偏移范围: 5,
        长按: false,
        按时长: random(300, 600),
        双击: false,
        双击间隔: 80,
        回调: null,
        日志: true,
        多目标: false,
        找色: false,
        超时: 0,
        间隔: 100
    };
    
    // 合并用户配置
    if (options) {
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                config[key] = options[key];
            }
        }
    }

    var screen = captureScreen();
    if (!screen) {
        if (config.日志) log("❌ 截屏失败");
        return returnDetail ? null : false;
    }

    var results = [];

    // 点击坐标函数
    function clickCoordinate(x, y) {
        if (config.随机偏移) {
            x += random(-config.偏移范围, config.偏移范围);
            y += random(-config.偏移范围, config.偏移范围);
        }
        if (config.长按) {
            press(x, y, config.按时长);
        } else if (config.双击) {
            press(x, y, 50);
            sleep(config.双击间隔);
            press(x, y, 50);
        } else {
            press(x, y, random(20, 80));
        }
    }

    var startTime = Date.now();
    do {
        for (var i = 0; i < imageArray.length; i++) {
            var imageName = imageArray[i];
            var imagePath = files.join(总路径, imageName);
            var smallImage = images.read(imagePath);
            
            if (!smallImage) {
                if (config.日志) log("⚠️ 加载失败：" + imageName);
                continue;
            }

            var findOptions = {
                threshold: config.阈值
            };
            if (config.区域) findOptions.region = config.区域;
            if (config.灰度) findOptions.grayscale = true;
            if (config.找色) findOptions.pixelMatch = true;

            var point = findImage(screen, smallImage, findOptions);
            if (point) {
                var x = point.x + smallImage.getWidth() / 2;
                var y = point.y + smallImage.getHeight() / 2;
                var result = {
                    name: imageName,
                    x: x,
                    y: y
                };

                // 调用回调
                if (config.回调) config.回调(result);
                
                // 执行点击
                if (config.点击) clickCoordinate(x, y);

                smallImage.recycle();

                // 多目标模式
                if (config.多目标) {
                    results.push(result);
                    continue;
                }
                
                return returnDetail ? result : true;
            }
            smallImage.recycle();
        }
        
        if (config.超时 > 0) sleep(config.间隔);
    } while (config.超时 > 0 && Date.now() - startTime < config.超时);

    if (config.多目标) {
        return returnDetail ? (results.length ? results : null) : !!results.length;
    }
    
    return returnDetail ? null : false;
}

/**
 * 申请截屏权限
 * @example
 * 截屏权限(); // 申请截屏权限，如果失败会提示用户手动授权
 */
function 截屏权限() {
    sleep(2000);
    if (!requestScreenCapture()) {
        toast("请手动授权截图权限");
        exit();
    } else {
        log("已经获得截屏权限");
    }
    sleep(random(2000, 3000));
}

/**
 * 智能控件操作 - 查找并操作屏幕上的控件
 * @param {string} controlName - 控件查找条件，格式："类型=值"
 * @param {number} timeout - 查找超时时间（毫秒）
 * @param {number} index - 控件序号（从1开始）
 * @param {number} [offsetX=0] - X坐标偏移量
 * @param {number} [offsetY=0] - Y坐标偏移量
 * @param {Object} [options] - 扩展选项（可选）
 * @param {string} [options.点击方式="click"] - 点击方式：click/long/double/swipe
 * @param {number[]} [options.滑动终点] - 滑动终点坐标[x,y]（滑动时必填）
 * @param {number} [options.滑动时长=300] - 滑动持续时间（毫秒）
 * @param {number} [options.长按时长=600-900] - 长按持续时间（毫秒）
 * @param {number} [options.双击间隔=120] - 双击间隔时间（毫秒）
 * @param {number} [options.点击前等待=0] - 点击前等待时间（毫秒）
 * @param {number} [options.点击后等待=500] - 点击后等待时间（毫秒）
 * @param {boolean} [options.可点击检测=false] - 是否检测控件可点击性
 * @param {boolean} [options.失败截图=false] - 失败时是否截图
 * @param {boolean} [options.滑动查找=false] - 是否启用滑动查找
 * @param {string} [options.滑动方向="up"] - 滑动方向：up/down
 * @param {number} [options.滑动距离=0.4] - 滑动距离（屏幕比例）
 * @param {number} [options.滑动次数=5] - 最大滑动次数
 * @param {Function} [options.成功回调] - 成功点击时的回调函数
 * @param {Function} [options.失败回调] - 查找失败时的回调函数
 * @returns {boolean} 是否成功操作控件
 * @example
 * // 基本用法：查找文本控件并点击
 * 控件("text=登录", 5000, 1);
 * 
 * // 高级用法：带各种配置
 * 控件("id=btnSubmit", 8000, 1, 0, 0, {
 *     点击方式: "long",
 *     长按时长: 1000,
 *     可点击检测: true,
 *     成功回调: function(x, y) {
 *         log("成功点击控件，坐标：" + x + "," + y);
 *     }
 * });
 */
function 控件(controlName, timeout, index, offsetX, offsetY, options) {
    // 设置默认值
    if (offsetX === undefined) offsetX = 0;
    if (offsetY === undefined) offsetY = 0;
    
    options = options || {};
    var 点击方式 = options.点击方式 || "click";
    var 长按时长 = options.长按时长 || random(600, 900);
    var 双击间隔 = options.双击间隔 || 120;
    var 滑动终点 = options.滑动终点 || null;
    var 滑动时长 = options.滑动时长 || 300;
    var 点击前等待 = options.点击前等待 || 0;
    var 点击后等待 = options.点击后等待 || 500;
    var 可点击检测 = options.可点击检测 || false;
    var 失败截图 = options.失败截图 || false;
    var 滑动查找 = options.滑动查找 || false;
    var 滑动方向 = options.滑动方向 || "up";
    var 滑动距离 = options.滑动距离 || 0.4;
    var 滑动次数 = options.滑动次数 || 5;
    var 成功回调 = options.成功回调 || null;
    var 失败回调 = options.失败回调 || null;
    var found = false;

    // 解析控件条件
    var parts = controlName.split(/\s*=\s*/);
    var type = parts[0].trim();
    var name = parts[1].trim();

    // 控件查找函数
    function findControl() {
        var result;
        switch (type) {
            case "id":
                result = id(name).find();
                break;
            case "className":
                result = className(name).find();
                break;
            case "desc":
                result = desc(name).find();
                break;
            case "text":
                result = text(name).find();
                break;
            case "textMatches":
                result = textMatches(name).find();
                break;
            case "textStartsWith":
                result = textStartsWith(name).find();
                break;
            default:
                log("控件类型不存在: " + type);
                return null;
        }
        if (result && result.length > 0) {
            log("已找到 " + result.length + " 个控件（type=" + type + ", name=" + name + "）");
        }
        return result;
    }

    // 滑动查找函数
    function slideFind() {
        var distance = Math.round((滑动方向 === "up" ? -1 : 1) * deviceHeight * 滑动距离);
        for (var i = 0; i < 滑动次数; i++) {
            swipe(deviceWidth / 2, deviceHeight / 2,
                  deviceWidth / 2, deviceHeight / 2 + distance, 300);
            sleep(500);
            var tempResult = findControl();
            if (tempResult && tempResult.length) return tempResult;
        }
        return null;
    }

    // 真实点击函数
    function realClick(x, y) {
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

    // 主循环
    var startTime = new Date().getTime();
    var lastCountdown = -1;
    
    while (true) {
        var elapsed = new Date().getTime() - startTime;
        var remaining = timeout - elapsed;
        if (remaining <= 0) break;

        // 倒计时显示
        var remainingSeconds = Math.ceil(remaining / 1000);
        if (remainingSeconds !== lastCountdown) {
            log(">>> 查找「" + name + "」剩余 " + remainingSeconds + " 秒");
            lastCountdown = remainingSeconds;
        }

        var elements = findControl();
        if (!elements || !elements.length) {
            if (滑动查找) elements = slideFind();
            if (!elements || !elements.length) {
                sleep(200);
                continue;
            }
        }

        // 点击找到的控件
        do {
            var element = elements.get(Math.max(0, index - 1));
            var bounds = element.bounds();
            var x = (bounds.left + bounds.right) / 2 + offsetX * scaleX;
            var y = (bounds.top + bounds.bottom) / 2 + offsetY * scaleY;

            // 坐标边界检查
            if (x < 0 || x > deviceWidth || y < 0 || y > deviceHeight) {
                log("控件坐标越界，跳过");
                return false;
            }
            
            // 可点击性检查
            if (可点击检测 && (!element.clickable() || !element.visibleToUser())) {
                log("控件不可点击或不可见，跳过");
                return false;
            }

            // 点击前等待
            if (点击前等待) sleep(点击前等待);

            // 执行点击
            found = true;
            realClick(x, y);
            上一次点击坐标.x = x;
            上一次点击坐标.y = y;
            
            // 成功回调
            if (成功回调) 成功回调(x, y);
            
            // 点击后等待
            if (点击后等待) sleep(点击后等待);

            // 重新查找控件
            elements = findControl();
        } while (elements && elements.length && (new Date().getTime() - startTime < timeout));

        return found;
    }

    // 超时处理
    if (失败截图) {
        log("点击失败，准备截图...");
    }
    if (失败回调) 失败回调();
    return false;
}

/**
 * 截图并添加标记文字
 * @param {string} imageLabel - 要在图片上添加的标记文字
 * @returns {string} 截图保存的完整路径
 * @example
 * var path = 截屏和图片存储("登录页面"); // 截图并标记为"登录页面"
 * log("截图已保存：" + path);
 */
function 截屏和图片存储(imageLabel) {
    // 生成文件名
    var timestamp = new Date().getTime();
    var filename = timestamp + ".png";
    var fullPath = "/storage/emulated/0/Pictures/Screenshots/" + filename;

    // 检查文件是否已存在
    if (files.exists(fullPath)) {
        log("文件已存在！");
        return fullPath;
    }

    // 截屏并保存
    const screenshot = captureScreen();
    screenshot.saveTo(fullPath);
    log("截图已保存到：" + fullPath);

    /* ================= 添加文字标记 ================= */
    importClass(android.graphics.Bitmap);
    importClass(android.graphics.BitmapFactory);
    importClass(android.graphics.Paint);
    importClass(android.graphics.Typeface);
    importClass(java.io.ByteArrayOutputStream);

    var bitmap = BitmapFactory.decodeFile(fullPath);
    var mutableBitmap = bitmap.copy(Bitmap.Config.ARGB_8888, true);
    var canvas = new android.graphics.Canvas(mutableBitmap);

    var width = mutableBitmap.getWidth();
    var height = mutableBitmap.getHeight();

    /* ------------ 第一行：图片标记 ------------ */
    var paint = new Paint();
    paint.setARGB(255, 0, 255, 0); // 绿色文字
    paint.setTextSize(100);
    paint.setTypeface(Typeface.DEFAULT_BOLD);
    paint.setAntiAlias(true);

    var textWidth = paint.measureText(imageLabel);
    var textHeight = paint.getTextSize();
    var x1 = (width - textWidth) / 2;
    var y1 = (height + textHeight) / 2 - textHeight / 2;

    canvas.drawText(imageLabel, x1, y1, paint);

    /* ------------ 第二行：时间标记 ------------ */
    var now = new Date();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var timeStr = month + "." + day + "  " + hours + ":" + minutes;

    paint.setTextSize(70);
    var timeWidth = paint.measureText(timeStr);
    var timeHeight = paint.getTextSize();
    var x2 = (width - timeWidth) / 2;
    var y2 = y1 + textHeight + 30;

    canvas.drawText(timeStr, x2, y2, paint);

    /* ------------ 保存图片 ------------ */
    var stream = new ByteArrayOutputStream();
    mutableBitmap.compress(Bitmap.CompressFormat.PNG, 100, stream);
    var bytes = stream.toByteArray();
    files.writeBytes(fullPath, bytes);

    /* ------------ 通知相册刷新 ------------ */
    importClass(android.content.Intent);
    importClass(android.net.Uri);

    function scanFile(path) {
        var file = new java.io.File(path);
        var uri = Uri.fromFile(file);
        var intent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, uri);
        context.sendBroadcast(intent);
    }

    scanFile(fullPath);
    log("已通知相册刷新");
    log("图片路径：" + fullPath);
    
    return fullPath;
}

/**
 * 连续点击操作（用于批量操作）
 * @param {number} count - 点击次数
 * @param {number} startX - 起始X坐标
 * @param {number} startY - 起始Y坐标
 * @example
 * unload(12, 200, 800); // 从(200,800)开始连续点击12次
 */
function unload(count, startX, startY) {
    var x = startX * scaleX + random(-3, 3);
    var y = startY * scaleY + random(-3, 3);

    for (var i = 0; i < count; i++) {
        // 点击
        press(x, y, random(100, 300));
        sleep(random(200, 400));

        // 每4次点击后换行
        if ((i + 1) % 4 === 0) {
            y += (215 + random(-3, 3));
            x = startX * scaleX + random(-3, 3);
        } else {
            x += (210 + random(-3, 3));
        }
    }
    
    sleep(random(800, 1100));
    press(750 * scaleX + random(-3, 3), 2180 * scaleY + random(-3, 3), random(100, 300));
    sleep(random(700, 1100));
    press(522 * scaleX + random(-3, 3), 2010 * scaleY + random(-3, 3), random(100, 300));
}

/**
 * 任务完成信号
 * @param {string} taskName - 任务名称
 * @example
 * done("微信自动任务"); // 标记微信自动任务完成
 */
function done(taskName) {
    sleep(1000);
    var dir = "/storage/emulated/0/";
    var file = dir + "信号文件.txt";
    files.createWithDirs(file);

    var content = taskName + ":done";
    files.write(file, content);
    java.lang.Runtime.getRuntime().exec("sync");

    // 验证写入
    var readBack = files.read(file);
    if (readBack.trim() !== content) {
        log("⚠️ 写入失败，重试...");
        sleep(300);
        files.write(file, content);
    } else {
        log("✅ 信号已写入：" + content);
    }
}

/**
 * 本地日志记录
 * @param {string} taskName - 任务名称
 * @param {string} error - 错误信息
 * @example
 * locallog("登录任务", "密码错误"); // 记录登录任务的错误信息
 */
function locallog(taskName, error) {
    var filePath = "/storage/emulated/0/Download/Notes/export/日志.txt";
    var content = taskName + "——" + error + "\n\n\n";

    try {
        if (!files.exists(filePath)) {
            files.createWithDirs(filePath);
        }

        var file = open(filePath, "a");
        file.write(content);
        file.flush();
        file.close();

        toast("内容已成功追加到文件");
    } catch (e) {
        console.error("追加文件时出错: " + e);
    }
}

// ================= 导出所有函数 =================
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

/**
 * 函数参数元数据（供UI界面使用）
 * 格式说明：[是否必填, 默认值, 参数描述, 参数类型, 嵌套参数]
 */
if (typeof module !== 'undefined') {
  module.exports.__functionParams = {
      "截屏权限": [
          [false, null, "不需要参数，直接调用即可申请截屏权限", "none"]
      ],
      "点击": [
          [true, null, "X坐标（基于1080×2400设计分辨率）", "number"],
          [true, null, "Y坐标（基于1080×2400设计分辨率）", "number"]
      ],
      "按压": [
          [true, null, "X坐标（基于1080×2400设计分辨率）", "number"],
          [true, null, "Y坐标（基于1080×2400设计分辨率）", "number"],
          [true, null, "按压持续时间（毫秒）", "number"]
      ],
      "滑动": [
          [true, null, "起点X坐标", "number"],
          [true, null, "起点Y坐标", "number"],
          [true, null, "终点X坐标", "number"],
          [true, null, "终点Y坐标", "number"],
          [true, null, "滑动时长（毫秒）", "number"]
      ],
      "滑动1": [
          [true, null, "起点X坐标", "number"],
          [true, null, "起点Y坐标", "number"],
          [true, null, "终点X坐标", "number"],
          [true, null, "终点Y坐标", "number"],
          [true, null, "滑动时长（毫秒）", "number"]
      ],
      "图片识别": [
          [true, null, "图片文件名数组，如：['图片1.png', '图片2.jpg']", "array"],
          [true, null, "查找超时时间（毫秒）", "number"],
          [false, {}, "扩展配置对象", "object", {
              "点击": [false, true, "是否自动点击找到的图片", "boolean"],
              "阈值": [false, 0.9, "图片匹配相似度阈值（0-1）", "number"],
              "区域": [false, null, "查找区域[x,y,width,height]", "array"],
              "随机偏移": [false, true, "是否在点击时添加随机偏移", "boolean"],
              "偏移范围": [false, 5, "随机偏移的范围（像素）", "number"],
              "长按": [false, false, "是否使用长按代替点击", "boolean"],
              "按时长": [false, "300-600", "长按的持续时间（毫秒）", "string"],
              "双击": [false, false, "是否使用双击", "boolean"],
              "双击间隔": [false, 80, "双击间隔时间（毫秒）", "number"],
              "最大点击次数": [false, "Infinity", "最大点击次数", "string"],
              "二次确认": [false, false, "是否启用二次确认", "boolean"],
              "日志": [false, true, "是否输出日志", "boolean"],
              "灰度": [false, false, "是否使用灰度匹配", "boolean"],
              "旋转": [false, null, "旋转角度数组", "array"],
              "找色": [false, false, "是否使用找色模式", "boolean"],
              "首次延迟": [false, 500, "首次点击后延迟（毫秒）", "number"],
              "循环延迟": [false, 500, "循环点击间隔（毫秒）", "number"]
          }]
      ],
      "图片识别假人": [
          [true, null, "图片文件名数组", "array"],
          [true, null, "查找超时时间（毫秒）", "number"],
          [false, {}, "扩展配置对象", "object", {
              "随机偏移": [false, false, "是否启用随机偏移", "boolean"],
              "偏移范围": [false, 0, "随机偏移的范围（像素）", "number"],
              "阈值": [false, 0.95, "图片匹配相似度阈值（0-1）", "number"],
              "区域": [false, null, "查找区域[x,y,width,height]", "array"],
              "长按": [false, false, "是否使用长按代替点击", "boolean"],
              "按时长": [false, "300-600", "长按的持续时间（毫秒）", "string"],
              "双击": [false, false, "是否使用双击", "boolean"],
              "双击间隔": [false, 80, "双击间隔时间（毫秒）", "number"]
          }]
      ],
      "找图一次": [
          [true, null, "图片文件名数组", "array"],
          [true, null, "是否返回详细信息(true/false)", "boolean"],
          [false, {}, "扩展配置对象", "object", {
              "点击": [false, true, "是否自动点击找到的图片", "boolean"],
              "阈值": [false, 0.95, "图片匹配相似度阈值（0-1）", "number"],
              "区域": [false, null, "查找区域[x,y,width,height]", "array"],
              "随机偏移": [false, false, "是否启用随机偏移", "boolean"],
              "偏移范围": [false, 5, "随机偏移的范围（像素）", "number"],
              "长按": [false, false, "是否使用长按代替点击", "boolean"],
              "按时长": [false, "300-600", "长按的持续时间（毫秒）", "string"],
              "双击": [false, false, "是否使用双击", "boolean"],
              "双击间隔": [false, 80, "双击间隔时间（毫秒）", "number"],
              "多目标": [false, false, "是否查找多个目标", "boolean"],
              "找色": [false, false, "是否使用找色模式", "boolean"],
              "超时": [false, 0, "查找超时时间（毫秒）", "number"],
              "间隔": [false, 100, "查找间隔时间（毫秒）", "number"]
          }]
      ],
      "控件": [
          [true, null, "控件条件，格式：'类型=值'，如：'text=登录'", "string"],
          [true, null, "查找超时时间（毫秒）", "number"],
          [true, null, "控件序号（从1开始）", "number"],
          [false, 0, "X坐标偏移量", "number"],
          [false, 0, "Y坐标偏移量", "number"],
          [false, {}, "扩展配置对象", "object", {
              "点击方式": [false, "click", "点击方式：click/long/double/swipe", "string"],
              "滑动终点": [false, null, "滑动终点坐标[x,y]", "array"],
              "滑动时长": [false, 300, "滑动持续时间（毫秒）", "number"],
              "长按时长": [false, "600-900", "长按持续时间（毫秒）", "string"],
              "双击间隔": [false, 120, "双击间隔时间（毫秒）", "number"],
              "点击前等待": [false, 0, "点击前等待时间（毫秒）", "number"],
              "点击后等待": [false, 500, "点击后等待时间（毫秒）", "number"],
              "可点击检测": [false, false, "是否检测控件可点击性", "boolean"],
              "失败截图": [false, false, "失败时是否截图", "boolean"],
              "滑动查找": [false, false, "是否启用滑动查找", "boolean"],
              "滑动方向": [false, "up", "滑动方向：up/down", "string"],
              "滑动距离": [false, 0.4, "滑动距离（屏幕比例）", "number"],
              "滑动次数": [false, 5, "最大滑动次数", "number"]
          }]
      ],
      "截屏和图片存储": [
          [true, null, "图片标记文字", "string"]
      ],
      "unload": [
          [true, null, "点击次数", "number"],
          [true, null, "起始X坐标", "number"],
          [true, null, "起始Y坐标", "number"]
      ],
      "done": [
          [true, null, "任务名称", "string"]
      ],
      "locallog": [
          [true, null, "任务名称", "string"],
          [true, null, "错误信息", "string"]
      ]
  };
}