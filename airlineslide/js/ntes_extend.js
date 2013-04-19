/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-2-23
 * Time: 上午1:22
 * a project to enhance ntes
 */

(function(){


/**
 * 把源对象的属性扩展到目标对象
 * @method extend
 * @param {Any} target 目标对象
 * @param {Any*} [source] 源对象。若有同名属性，则后者覆盖前者
 * @return {Any} 目标对象
 */
/*    function extend(target) {
    if (target == null) { throw new Error('target cannot be null'); }

    var i = 0, len = arguments.length, p, src;
    while (++i < len) {
        src = arguments[i];
        if (src != null) {
            for (p in src) { target[p] = src[p]; }
        }
    }

    return target;
}*/

/**
 * 检查节点是否XML节点
 * @method isXMLNode
 * @param {Element} node 节点
 * @return {Boolean} 节点是否XML节点
 */
function isXMLNode(node) {
    var docElt = (node.ownerDocument || node).documentElement;
    return docElt ? docElt.nodeName !== 'HTML' : false;
}

/**
 * 检查对象是否window对象
 * @method isWindow
 * @param {Any} obj 待测对象
 * @return {Boolean} 待测对象是否window对象
 */
function isWindow(obj) { return obj != null && obj == obj.window; }

/**
 * 获取节点当前样式
 * @method getStyle
 * @param {Element} node 节点
 * @param {String} name 样式名
 * @return {String} 样式值
 */
function getStyle(node, name) {
    if ( !isSupportStyle(node) ) { return null; }

    name = fixStyleName(name);

    var hook = (cssHooks[name] || 1).get;
    if (hook) {
        return hook(node);
    } else {
        var curVal = node.style[name];
        if ( !base.isUndefined(curVal) ) {
            return curVal !== '' ? curVal : getCurrentStyle(node, name);
        }
    }
}

// 检查节点是否支持样式操作
function isSupportStyle(node) {
    return !(isWindow(node) || isXMLNode(node) || node.nodeType !== 1);
}

var rDash = /-([a-z])/g;
// 修复样式名 font-weight -> fontWeight
function fixStyleName(name) {
    return cssProps[name] || name.replace(rDash, function($0, $1) {
        return $1.toUpperCase();
    });
}

// 特殊属性名
var cssProps = {
    'float': 'cssFloat' in testElt.style ? 'cssFloat' : 'styleFloat'
};

/**
 * 获取节点尺寸
 * @method getSize
 * @param {Element} node 节点
 * @param {String} which 宽度（width）或高度（height）
 * @param {String} extra 额外部分：填充（padding），边距（margin），边框（border）。
 *   多个参数用空格隔开
 * @return {Number} 尺寸值
 */
function getSize(node, which, extra) {
    // 首字母大写
    which = which.toLowerCase().replace(/^[a-z]/, function($0) {
        return $0.toUpperCase();
    });

    if ( !node.ownerDocument || node.nodeType !== 1 || isXMLNode(node) ) {
        return null;
    } else if ( isWindow(node) ) {	// window对象，直接取浏览器可用范围
        return node.ownerDocument.documentElement['client' + which];
    } else if (node.nodeType === 9) {		// 根节点
        return node.documentElement['scroll' + which];
    }

    // 获取节点尺寸（包含padding、border）
    // IE下，如果未设置宽高，clientWidth/Height的值为0，所以要用offsetWidth/Height
    var size = node['offset' + which];

    // 计算额外部分
    extra = extra || '';
    var borderStyle = getStyle(node, 'borderStyle');
    (which === 'Width' ? ['Left', 'Right'] : ['Top', 'Bottom']).forEach(function(direction) {
        if (extra.indexOf('padding') === -1) {
            size -= parseFloat( getStyle(node, 'padding' + direction) ) || 0;
        }
        if (extra.indexOf('border') === -1) {
            if (borderStyle && borderStyle !== 'none') {
                size -= parseFloat( getStyle(node, 'border' + direction + 'Width') ) || 0;
            }
        }
        if (extra.indexOf('margin') !== -1) {
            size += parseFloat( getStyle(node, 'margin' + direction) ) || 0;
        }
    });

    return size;
}

/*
 * @ domready
 * @ extend jraiser
 * @ todo tuning the sequence ,ensure the domready is always before image and css loaded (windows)
 * */
$.domready = function(fn){
    // http://dustindiaz.com/smallest-domready-ever
    /in/.test(document.readyState) // in = loadINg
        ? setTimeout('$.domready('+fn+')', 9)
        : fn()
};

/*
 * @extend the basic function to the element
 * */
$.util.extend($.element ,{
    /**
     * 获取当前第一个节点的宽度
     * @method width
     * @for NodeList
     * @return {Number} 节点宽度
     */
    /**
     * 设置当前所有节点的宽度
     * @method width
     * @for NodeList
     * @param {Number|String} val 宽度值
     * @return {NodeList} 当前节点集合
     */
    width: function(val) {
        return val != null ?
            this.css('width', val) : getSize(this, 'Width');
    }
})
})()
