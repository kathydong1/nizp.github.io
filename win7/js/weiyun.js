(function (d) {
	
	//设置页面元素的宽高  以及简单的移入移出功能
	function lisH() {
		this.ul = d.querySelector('.leftBar');
		this.lis = this.ul.children;
		this.mRight = d.querySelector('.mRight');
		this.mLeft = d.querySelector('.mLeft');
		this.as = d.querySelectorAll('.navList a');
		this.contentRight = d.querySelector('.contentRight');
	}
	lisH.prototype = {
		constructor: lisH,
		init: function () {
			var _this = this;
			window.onresize = function () {
				_this.mRight.style.height = window.innerHeight - 51 + 'px';
				_this.mLeft.style.width = window.innerWidth - 160 + 'px';
				_this.mLeft.style.height = window.innerHeight - 51 + 'px';
				_this.contentRight.style.width = _this.mLeft.offsetWidth - 185 + 'px';
			};
			window.onresize();
			this.over();
			this.aOver();
		},
		over: function () {
			for ( var i = 0; i < this.lis.length; i++ ) {
				this.lis[i].onmouseover = function () {
					if ( this.className != 'navGap' && this.className != 'active') {
						this.className = 'hover';
					}
				};
				this.lis[i].onmouseout = function () {
					if ( this.className != 'navGap' && this.className != 'active' ) {
						this.className = '';
					}
				};
			}
		},
		aOver: function () {
			for ( var i = 0; i < this.as.length; i++ ) {
				this.as[i].onmouseover = function () {
					addClass(this,'active');
				};
				this.as[i].onmouseout = function () {
					removeClass(this,'active');
				};
			}
		}
	};
	var l = new lisH();
	l.init();
	
	

	function setCon() {
		this.fileList = d.querySelector('.fileList');
		this.tree = d.querySelector('.tree');
		this.treeDivs = this.tree.getElementsByTagName('div'); 
		this.title = d.querySelector('.title');
		this.items = this.fileList.children;
		this.checkAll = d.querySelector('.pathNav label');

		//重命名  删除  添加  移动到  重新加载
		this.move = d.querySelector('.move');
		this.rename = d.querySelector('.rename');
		this.deleted = d.querySelector('.delete');
		this.create = d.querySelector('.create');
		this.reload = d.querySelector('.reload');
		
		//框选功能
		this.disX = 0;
		this.disY = 0;
		
	}
	setCon.prototype = {
		constructor: setCon,
		init: function () {
			this.structure(0);//首次加载页面
			this.setTree();//加载树形菜单
			this.treeCheck(0);//树形菜单选中设置
			this.treeClick();//树形菜单点击事件
			this.titleClick();//文件导航点击事件
			this.checkA();//全选按钮
			this.labelCheck();
			this.createFile();//添加文件夹
			this.deleteFile();//删除文件夹
			this.renamed();//重新命名
			this.reLoded();//重新加载
			this.selectTab();//框选功能
		},
		//渲染文件区域
		structure: function (num) {
			//找到id为0 的下面的所有数据
			this.fileList.innerHTML = '';
			for ( var i = 0; i < data.length; i++ ) {
				if ( data[i].pid == num ) {
					this.fileList.innerHTML += this.template(data[i]);
					this.fileEvent();
				}
			}
		},
		//生成结构的模板
		template: function (datas) {
			var html = '';
			html += `
				<div class="item" data-id="${datas.id}">
					<label></label>
					<div class="div"></div>
					<p>${datas.title}</p>
					<input type="text">
				</div>
			`
			return html;
		},
		//渲染菜单区域	
		setTree: function () {
			this.tree.innerHTML = '';
			this.tree.innerHTML = this.treeTemplate(-1);
		},
		treeTemplate: function (id) {
			//找到当前的id找到下面有多少个pid与之对应 
			var _this = this;
			childs = this.findChild(id);
			//生成结构
			var html = '<ul>';
			childs.forEach(function (item) {
				var index = _this.getIndex(item.pid).length;
				//判断当前元素下是否有子元素
				for ( var i = 0; i < data.length; i++ ) {
					if ( data[i].pid == item.id ) {
						var iClass = 'iShow';
					} 
				}
				html += `<li>
					<div class="treeTitle ${iClass}" data-id="${item.id}" style="padding-left:${(index+1)*14}px">
						<span>
							<strong>${item.title}</strong>
							<i></i>
						</span>
					</div>
					${_this.treeTemplate(item.id)}
				</li>`
			});
			html += '</ul>';
			return html;
		},
		//根据id来找到其下面所有的子数据
		findChild: function (id) {
			var childs = [];
			for ( var i = 0; i < data.length; i++ ) {
				if ( data[i].pid == id ) {
					childs.push(data[i]);
				}
			}
			return childs;
		},
		//判断当前这个文件在第几层
		getIndex: function getIndex(pid) {
			//根据当前的pid向上查找有多少层的父级元素
			var arr = [];
			for ( var i = 0; i < data.length; i++ ) {
				if ( data[i].id == pid ) {
					arr.push(data[i]);
					arr = arr.concat(getIndex(data[i].pid));
				}
			}
			return arr;
		},
		//设置树形菜单的当前选中状态
		treeCheck: function (num) {
			for ( var i = 0; i < this.treeDivs.length; i++ ) {
				if ( this.treeDivs[i].getAttribute('data-id') == num ) {//obj.dataset.id
					addClass(this.treeDivs[i],'active');
				} else {
					removeClass(this.treeDivs[i],'active');
				}
			}
		},
		//利用时间委托 给树形菜单添加点击事件
		treeClick: function () {
			var _this = this;
			this.tree.addEventListener('click',function (ev) {
				
				if ( ev.target.tagName == 'STRONG' || ev.target.tagName == 'I' ) {
					var par = ev.target.parentNode.parentNode;
					_this.clickEvent(par);
				} else if ( ev.target.className == 'treeTitle' ) {
					_this.clickEvent(ev.target);
				}
			});
		},
		clickEvent: function (obj) {

			//找到当前id下有多少个子元素  渲染到fileList
			this.fileList.innerHTML = '';
			var num = obj.getAttribute('data-id');
			
			//根据id找到当前元素在数据中的位置
			for ( var i = 0; i < data.length; i++ ) {
				if ( data[i].id == num ) {
					var inner = data[i].title;
				}
			}
			
			this.structure(num);
			this.treeCheck(num);
			
			this.checkAll.className = '';

			var pidNum = this.findPid(num);
			//根据pid找到其所有的父级
			var arr = this.getIndex(pidNum).reverse();
			var len = arr.length+1;
			var html = '';
			arr.forEach(function (item,i) {
				html += `<a href="javascript:;" style="z-index:${len--}" data-id="${item.id}">${item.title}</a>`;
			});
			html += `<span style="z-index: 1" data-id="${num}">${inner}</span>`;
			this.title.innerHTML = html;
		},
		//根据当前的id找到其的pid
		findPid: function (num) {
			for ( var i = 0; i < data.length; i++ ) {
				if ( data[i].id == num ) {
					var pidNum = data[i].pid;
				}
			}
			return pidNum;
		},
		//点击title渲染页面  以及右侧树形菜单
		titleClick: function () {
			var _this = this;
			this.title.addEventListener('click',function (ev) {
				if ( ev.target.tagName = 'A' ) {
					_this.clickEvent(ev.target);
				}
			})
		},
		//文件夹移入移出   点击选中事件
		fileEvent: function () {
			var _this = this;
			for ( var i = 0; i < this.items.length; i++ ) {
				this.items[i].addEventListener('mouseenter',function () {
					addClass(this,'active');
					this.firstElementChild.style.display = 'block';
				});
				this.items[i].addEventListener('mouseleave',function () {
					if ( this.firstElementChild.className != 'check' ) {
						removeClass(this,'active');
						this.firstElementChild.style.display = 'none';
					}
				});
			}
		},
		//文件选中功能
		labelCheck: function () {
			var _this = this;
			this.fileList.addEventListener('click',function (ev) {
				if ( ev.target.tagName === 'LABEL' ) {
					if ( ev.target.className == 'check' ) {
						removeClass(ev.target,'check');
					} else {
						addClass(ev.target,'check');
					}
					if ( _this.fileAllCkeck() ) {
						_this.checkAll.className = 'checked';
					} else {
						_this.checkAll.className = '';
					}
					ev.cancelBubble = true;
				} else if (ev.target.tagName == 'DIV' && ev.target !== this || ev.target.tagName == 'P' ) {
					var par = ev.target.className == 'item active' ? ev.target : ev.target.parentNode;
					_this.clickEvent(par);
					_this.structure(par.dataset.id); 
				}
			});
		},
		//点击全选按钮
		checkA: function () {
			var _this = this;
			this.checkAll.addEventListener('click',function () {
				if ( this.className == 'checked' ) {
					removeClass(this,'checked');
					for ( var i = 0; i < _this.items.length; i++ ) {
						removeClass(_this.items[i],'active');
						_this.items[i].firstElementChild.style.display = 'none';
						removeClass(_this.items[i].firstElementChild,'check');
					}
				} else {
					addClass(this,'checked');
					for ( var i = 0; i < _this.items.length; i++ ) {
						addClass(_this.items[i],'active');
						_this.items[i].firstElementChild.style.display = 'block';
						addClass(_this.items[i].firstElementChild,'check');
					}
				}
			});
		},
		//根据选中多少来判断是否应该全选
		fileAllCkeck: function () {
			var checked = true;
			for ( var i = 0; i < this.items.length; i++ ) {
				if ( this.items[i].firstElementChild.className != 'check' ) {
					checked = false;
				}
			}
			return checked;
		},
		createFile: function () {
			var _this = this;
			this.create.addEventListener('click',function () {
				//先找到当前是在哪个文件夹下面  向数据中放入新创建的数据
				var nowId = Number(d.querySelector('.title span').dataset.id);
				//创建文件夹
				_this.createLast(nowId);
				
			});
		},
		//创建文件夹
		createLast: function (nowId) {
			var _this = this;
			
			var div1 = document.createElement('div');
			div1.className = 'item';
			var label = document.createElement('label');
			var div2 = document.createElement('div');
			div2.className = 'div';
			var p = document.createElement('p');
			var inputs = document.createElement('input');
			inputs.type = 'text';
			
			
			div1.appendChild(label);
			div1.appendChild(div2);
			div1.appendChild(p);
			div1.appendChild(inputs);
			
			this.fileList.appendChild(div1);
			
			p.style.display = 'none';
			inputs.style.display = 'block';
			inputs.focus();
			
			inputs.onblur = function () {
				var value = inputs.value.trim();
				if ( value == '' ) {
					_this.fileList.removeChild(div1);
				} else {
					if ( _this.checkName(nowId,inputs) ) {
						inputs.focus();
						return;
					} else {
						p.innerHTML = value;
						p.style.display = 'block';
						inputs.style.display = 'none';
						inputs.value = '';
						_this.checkAll.className = '';
						//向data中push数据
						var obj = {
							id: new Date().getTime(),
							pid: nowId,
							title: value
						}
						div1.dataset.id = obj.id;
						data.push(obj);
						
						div1.addEventListener('mouseenter',function () {
							addClass(this,'active');
							this.firstElementChild.style.display = 'block';
						});
						div1.addEventListener('mouseleave',function () {
							if ( this.firstElementChild.className != 'check' ) {
								removeClass(this,'active');
								this.firstElementChild.style.display = 'none';
							}
						});
						//找到当前这个id在数据中第几层
						var index = _this.getIndex(nowId).length;
						
						//找到当前这个元素的父级在树形菜单当中的位置
						var div = d.querySelector('.treeTitle[data-id="'+ nowId +'"]');
						
						var nextUl = div.nextElementSibling;

						nextUl.appendChild(_this.addTree(obj,index));
						
						if ( _this.fileList.innerHTML !== '' ) {
							addClass(div,'iShow');
						}
	
					}
				}
			};
		},
		addTree: function (obj,index) {
			var li = d.createElement('li');
			li.innerHTML = `
				<div class="treeTitle" data-id="${obj.id}" style="padding-left:${(index+1)*14}px">
					<span>
						<strong>${obj.title}</strong>
						<i></i>
					</span>
				</div>
				<ul></ul>
			`;
			return li;
		},
		//判断是否重名
		checkName: function checkName(nowId,inputs) {
			var onOff = false;
			var arr = this.findChild(nowId);
			arr.forEach(function (item) {
				if ( item.title == inputs.value ) {
					onOff = true;
				}
			});
			return onOff;
		},	
		//删除功能
		deleteFile: function () {
			var _this = this;
			this.deleted.addEventListener('click',function () {
				var label = _this.fileList.querySelectorAll('label');
				for ( var i = 0; i < label.length; i++ ) {
					if ( label[i].className == 'check' ) {
						var par = label[i].parentNode;
						_this.fileList.removeChild(par);
						_this.checkAll.className = '';
						//从数据中删除该项  以及其下面所有的子数据
						var num = par.dataset.id;
						
						var nowPid = _this.findPid(num);
						console.log(nowPid);
						for ( var j = 0; j < data.length; j++ ) {
							if ( data[j].id == nowPid ) {
								var nowId = data[j].id;
							}
							if ( data[j].id == num || data[j].pid == num ) {
								data.splice(j,1);
							}
						}
						_this.tree.innerHTML = _this.treeTemplate(-1);
						_this.treeCheck(nowId);
					}
				}
			});
		},
		//重命名
		renamed: function () {
			var _this = this;
			this.rename.addEventListener('click',function () {
				var check = _this.fileList.querySelectorAll('.active');
				if ( check.length > 1 ) {
					alert('只能修改一个名字');
				} else if ( check.length == 0 ) {
					return;
				} else{
					var nowId = Number(d.querySelector('.title span').dataset.id);
					
					//找到修改的这个文件的id对应在树形菜单当中修改名
					var fileId = check[0].dataset.id;
					console.log(fileId);
					
					var p = check[0].getElementsByTagName('p')[0];
					var inputs = check[0].getElementsByTagName('input')[0];
					p.style.display = 'none';
					inputs.style.display = 'block';
					inputs.focus();
					_this.blured(inputs,p,nowId,fileId);
				}
				
			});
		},
		//input的失焦事件
		blured: function (inputs,p,num,fileId) {
			var _this = this;
			inputs.onblur = function () {
				if ( this.value !== '' ) {
					if ( _this.checkName(num,inputs) ) {
						inputs.focus();
						return;
					} else {
						p.innerHTML = inputs.value;
						//改变树形菜单当中的名字
						var strong = d.querySelector('.treeTitle[data-id="'+ fileId +'"]').getElementsByTagName('strong')[0];
						strong.innerHTML = inputs.value;
						//修改数据中的名字
						for ( var i = 0; i < data.length; i++) {
							if ( data[i].id == fileId ) {
								data[i].title = inputs.value;
							}
						}
						console.log(data);
					}
				} 
				p.style.display = 'block';
				this.style.display = 'none';
			}
		},
		//刷新功能
		reLoded: function () {
			var _this = this;
			this.reload.addEventListener('click',function () {
				_this.structure(0);
				_this.setTree();
				_this.treeCheck(0);
				_this.title.innerHTML = `<span data-id="0">微云</span>`;
				_this.checkAll.className = '';
			});
		},
		//框选功能
		selectTab: function () {
			var _this = this;
			document.addEventListener('mousedown',function (ev) {
				var inputs = d.getElementsByTagName('input');
				for ( var i = 0; i < inputs.length; i++ ) {
					inputs[i].blur();
				}
				var div = null;
				if ( ev.target.tagName == 'INPUT' ) {
					ev.target.focus();
					ev.cancelBubble = true;
					return;
				}
				_this.disX = ev.pageX;
				_this.disY = ev.pageY;
				document.addEventListener('mousemove',move);
				function move(ev) {
					
					if ( Math.abs(ev.pageX - _this.disX) > 10 || Math.abs(ev.pageY - _this.disY) > 10 ) {
						
						if ( !div ) {
							div = document.createElement('div');
							div.className = 'selectTab';
							document.body.appendChild(div);
						}
						
						div.style.width = div.style.height = 0;
						div.style.left = _this.disX + 'px';
						div.style.top = _this.disY + 'px';
						
						
						div.style.left = Math.min(_this.disX,ev.pageX) + 'px';
						div.style.top = Math.min(_this.disY,ev.pageY) + 'px';
						
						div.style.width = Math.abs(ev.pageX - _this.disX) + 'px';
						div.style.height = Math.abs(ev.pageY - _this.disY) + 'px';
						
						
						for ( var i = 0; i < _this.items.length; i++ ) {
							if ( _this.duang(_this.items[i],div) ) {
								addClass(_this.items[i],'active');
								var label = _this.items[i].firstElementChild;
								label.style.display = 'block';
								addClass(label,'check');
							} else {
								removeClass(_this.items[i],'active');
								var label = _this.items[i].firstElementChild;
								label.style.display = 'none';
								removeClass(label,'check');
							}
						}
						
						if ( _this.fileAllCkeck() ) {
							_this.checkAll.className = 'checked';
						} else {
							_this.checkAll.className = '';
						}
						
						
					}
					
				};
				document.addEventListener('mouseup',up)
				function up() {
					document.removeEventListener('mousemove',move);
					document.removeEventListener('mousemove',up);
					if (div) {
						document.body.removeChild(div);
						div = null;
					}
				};
				ev.preventDefault();
			});
		},
		//检测是否碰撞到的函数
		duang: function (obj,obj2){
			
			var l1 = obj.offsetLeft;
			var t1 = obj.offsetTop;
			var r1 = l1 + obj.offsetWidth;
			var b1 = t1 + obj.offsetHeight;
			
			var l2 = obj2.offsetLeft;
			var t2 = obj2.offsetTop;
			var r2 = l2 + obj2.offsetWidth;
			var b2 = t2 + obj2.offsetHeight;
			
			if(r1 < l2 || t1 > b2 || l1 > r2 || b1 < t2){
				return false;
			}else{
				return true;
			}
		}
	};

	var sC = new setCon();
	sC.init();
	
	
	function search() {
		this.inputs = d.querySelector('.search input');
		this.ul = d.querySelector('.search ul');
	}
	
	search.prototype = {
		init: function () {
			this.searched();
		},
		searched: function () {
			var _this = this;
			this.inputs.onfocus = function () {
				_this.ul.style.display = 'block';
			};
			this.inputs.oninput = function () {
				var val = this.value;
				jsonp({
					url: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su',
					callback: 'cb',
					data: {
						wd: val 
					},
					succ: function (data) {
						_this.ul.innerHTML = '';
						for ( var i = 0; i < data.s.length; i++ ) {
							var li = document.createElement('li');
							li.innerHTML = '<a href="https://www.baidu.com/s?ie=utf-8&f=3&rsv_bp=0&rsv_idx=1&tn=baidu&wd='+data.s[i]+'" target="_self">'+data.s[i]+'</a>';
						_this.ul.appendChild(li);	
						}
					},
					fail: function (str) {
						alert(str);
					}
				});
			}
		},
		ulClick: function () {
			this.ul.onmousedown = function (ev) {
				ev.cancelBubble = true;
			};
		}
	}
	
	
	var sS = new search();
	sS.init();
	
	
})(document);
