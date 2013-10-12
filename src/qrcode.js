define(function(require, exports, module) {
	var $ = require('$');
	var QRCodeAlg = require('./qrcodealg');
	var qrcodeAlgObjCache = [];

	/**
	 * 二维码构造函数，主要用于绘制
	 * @param  {参数列表} opt 传递参数
	 * @return {}     
	 */	
	var qrcode = function(opt) {
		if (typeof opt === 'string') { // 只编码ASCII字符串
			opt = {
				text: opt
			};
		}
		//设置默认参数
		this.options = $.extend({}, {
			text:"",
			render: "",
			width: 256,
			height: 256,
			correctLevel: 3,
			background: "#ffffff",
			foreground: "#000000"
		}, opt);

		//使用QRCodeAlg创建二维码结构 
		var qrCodeAlg = null;
		for(var i = 0, l = qrcodeAlgObjCache.length; i < l; i++){
			if(qrcodeAlgObjCache[i].text == this.options.text && qrcodeAlgObjCache[i].text.correctLevel == this.options.correctLevel){
				qrCodeAlg = qrcodeAlgObjCache[i].obj;
				break;
			}
		}
		if(i == l){
		  qrCodeAlg = new QRCodeAlg(this.options.text, this.options.correctLevel);
		  qrcodeAlgObjCache.push({text:this.options.text, correctLevel: this.options.correctLevel, obj:qrCodeAlg});
		}
		
		if(this.options.render){
			switch (this.options.render){
				case "canvas":
					return this.createCanvas(qrCodeAlg);
				case "table":
					return this.createTable(qrCodeAlg);
				case "svg":
					return this.createSVG(qrCodeAlg);
				default:
					return this.createDefault(qrCodeAlg);
			}
		}
		return this.createDefault(qrCodeAlg);
	};
	/**
	 * 使用Canvas来画二维码
	 * @return {} 
	 */
	
	qrcode.prototype.createDefault = function(qrCodeAlg) {
		var canvas = document.createElement('canvas'); 
		if(canvas.getContext)
			return this.createCanvas(qrCodeAlg);
		SVG_NS = 'http://www.w3.org/2000/svg';
    	if( !!document.createElementNS && !!document.createElementNS(SVG_NS, 'svg').createSVGRect )
    		return this.createSVG(qrCodeAlg);
		return this.createTable(qrCodeAlg);
	};
	qrcode.prototype.createCanvas = function(qrCodeAlg) {
		//创建canvas节点
		var canvas = document.createElement('canvas');
		canvas.width = this.options.width;
		canvas.height = this.options.height;
		var ctx = canvas.getContext('2d');

		//计算每个点的长宽
		var tileW = (this.options.width / qrCodeAlg.getModuleCount()).toPrecision(4);
		var tileH = this.options.height / qrCodeAlg.getModuleCount().toPrecision(4);

		//绘制
		for (var row = 0; row < qrCodeAlg.getModuleCount(); row++) {
			for (var col = 0; col < qrCodeAlg.getModuleCount(); col++) {
				ctx.fillStyle = qrCodeAlg.modules[row][ col] ? this.options.foreground : this.options.background;
				var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
				var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
				ctx.fillRect(Math.round(col * tileW), Math.round(row * tileH), w, h);
			}
		}
		//返回绘制的节点
		return canvas;
	};
	/**
	 * 使用table来绘制二维码
	 * @return {} 
	 */
	qrcode.prototype.createTable = function(qrCodeAlg) {
		//创建table节点
		var s = [];
		s.push('<table style="border:0px; margin:0px; padding:0px; border-collapse:collapse; background-color: '+
			this.options.background +
			';">');
		// 计算每个节点的长宽；取整，防止点之间出现分离
		var tileW = Math.floor(this.options.width / qrCodeAlg.getModuleCount());
		var tileH = Math.floor(this.options.height / qrCodeAlg.getModuleCount());

		// 绘制二维码
				foreTd = '<td style="border:0px; margin:0px; padding:0px; width:'+tileW+'px; background-color: '+this.options.foreground+'"></td>',
				backTd = '<td style="border:0px; margin:0px; padding:0px; width:'+tileW+'px; background-color: '+this.options.background+'"></td>',
	  		l =  qrCodeAlg.getModuleCount();

		for (var row = 0; row < l; row++) {
			s.push('<tr style="border:0px; margin:0px; padding:0px; height: ' + tileH +'px">');
			for (var col = 0; col < l; col++) {
				s.push(qrCodeAlg.modules[row][col] ? foreTd : backTd);
			}
			s.push('</tr>'); 
		}
		s.push('</table>');

		var $table = $(s.join(''));
	
		return $table[0];
	};
	

	/**
	 * 使用SVG开绘制二维码
	 * @return {} 
	 */
	qrcode.prototype.createSVG = function(qrCodeAlg) {
		var s = '<svg xmlns="http://www.w3.org/2000/svg" height="'+this.options.height+'" width="'+this.options.width+'">';
		//计算每个二维码矩阵中每个点的长宽
		var tileW = Math.floor(this.options.width / qrCodeAlg.getModuleCount());
		var tileH = Math.floor(this.options.height / qrCodeAlg.getModuleCount());
		var rectHead = '<rect ',
		    foreRect = ' width="'+tileW+'" height="'+tileH+'" fill="'+this.options.foreground+'"></rect>',
				backRect = ' width="'+tileW+'" height="'+tileH+'" fill="'+this.options.background+'"></rect>';
		//绘制二维码
		for (var row = 0; row < qrCodeAlg.getModuleCount(); row++) {			
			for (var col = 0; col < qrCodeAlg.getModuleCount(); col++) {
				s += rectHead + ' y="' + row*tileH + '"" x="' + col*tileW +'"';
				s += qrCodeAlg.modules[row][ col] ? foreRect : backRect;
			}
		}
		s += '</svg>';
		$svg = $(s);
		//返回svg节点
		return $svg[0];
	};

	module.exports = qrcode;
});