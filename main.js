function Mine(tr, td, mineNum) {
    this.tr = tr; //行数
    this.td = td; //列数
    this.mineNum = mineNum; //雷数
    this.numNum = (tr * td - mineNum);
    this.squares = []; // 存储所有方块的信息 ，他是一个二维数组, 按照行与列的顺序排放 存取使用行列的形式
    this.tds = []; //存储所有单元格的dom对象 二维数组
    this.surplusMine = mineNum; //剩余雷的数量
    this.allRight = false; //右击标的小红旗是否全是雷 用来判断用户是否获胜

    this.parent = document.querySelector('.gameBox');
}

Mine.prototype.randomNum = function () {
    var square = new Array(this.tr * this.td); //生成一个空数组，但是有长度，长度为格子总数
    for (var i = 0; i < square.length; i++) {
        square[i] = i;
    }
    square.sort(function () {
        return 0.5 - Math.random()
    });
    // console.log(square);
    return square.slice(0, this.mineNum); //截取数组
}

//初始化
Mine.prototype.init = function () {
    // this.randomNum();
    // console.log(this.randomNum());
    var rn = this.randomNum(); //雷的位置
    var n = 0; //用来找到格子对应的索引
    //位置是随机的
    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = [];

        for (var j = 0; j < this.td; j++) {
            // n++;
            // this.squares[i][j] = 
            //取一个方块在数组里的数据要使用行与列的形式去取。找方块周围的方块，利用坐标去取，
            //行与列的形式与坐标形式刚好相反的
            if (rn.indexOf(++n) != -1) {
                //等于 -1 等于此数组内找不到数字 
                //如果这个条件成立，说明现在循环到这个索引在雷的数组里扎到了，那就表示这个索引对应的是雷
                this.squares[i][j] = {
                    type: 'mine',
                    x: j,
                    y: i
                };

            } else {
                this.squares[i][j] = {
                    type: 'number',
                    x: j,
                    y: i,
                    value: 0
                };
            }
        }
    }
    this.parent.oncontextmenu = function () {
        return false;
    }
    // console.log(this.squares);
    this.updateNum();
    this.creatDom();


    this.mineNumDom = document.querySelector('.mineNum');
    this.mineNumDom.innerHTML = this.surplusMine;
    //剩余的雷数
}


//创建表格
Mine.prototype.creatDom = function () {
    var self = this;
    var table = document.createElement('table');
    for (var i = 0; i < this.tr; i++) { // 行
        var domTr = document.createElement('tr');
        this.tds[i] = [];
        for (var j = 0; j < this.td; j++) { //列
            var domTd = document.createElement('td');
            // domTd.innerHTML = 0; // 添加数字

            domTd.pos = [i, j]; //把格子对应的行与列存在格子身上，为了下面的这个值去数组里取到的数据
            domTd.onmousedown = function () {
                self.play(event, this); //self 指的是实例对象 this指的是点击的td
            }
            this.tds[i][j] = domTd; // 把所有创建的td添加到数组当中

            // if (this.squares[i][j].type == "mine") {
            //     domTd.className = 'mine';
            // }
            // if (this.squares[i][j].type == 'number') {
            //     domTd.innerHTML = this.squares[i][j].value;
            // }

            domTr.appendChild(domTd);
        }
        table.appendChild(domTr);
    }
    this.parent.innerHTML = '';
    this.parent.appendChild(table);
}



// 找格子周围的八个格子
Mine.prototype.getAround = function (square) {
    var x = square.x;
    var y = square.y;
    var result = []; //  把找到的格子的坐标返回出去（二维数组）

    /*
      x-1,y-1       x,y-1       x+1,y-1
      x-1,y          x,y        x+1,y
      x-1,y+1       x,y+1       x+1,y+1
    */
    //  通过坐标循环九宫格 
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (i < 0 || //  格子超出来的左边范围
                j < 0 || //  格子超出的上边的范围
                i > this.td - 1 || // 格子超出的右边的范围
                j > this.tr - 1 || // 格子超出的下边的范围
                (i == x && j == y) || // 循环到的格子是自己
                (this.squares[j][i].type == 'mine') // 周围的格子是个雷
            ) {
                continue; //跳出
            }
            result.push([j, i]); // 要以行和列的行为返回出去
            // 因为需要他去取数组里的数据
        }
    }
    return result;
}


//  更新所有的数字
Mine.prototype.updateNum = function () {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            //只更新雷周围的数字
            if (this.squares[i][j].type == 'number') {
                continue;
            } else {
                var num = this.getAround(this.squares[i][j]); //获取每一个雷周围的数字
                // console.log(num);
                for (var k = 0; k < num.length; k++) {
                    /*
                        num[k] == [0,1]
                        num[k][0] == 0
                        num[k][1] == 1
                    */
                    this.squares[num[k][0]][num[k][1]].value += 1;
                }
            }
        }
    }
    // console.log(this.squares);
}

Mine.prototype.play = function (ev, obj) {
    var n1 = 0;
    var self = this;
    if (ev.which == 1 && obj.className != 'flag') { //限制用户点击完小红旗不能再点击成数字
        //点击的是左键
        // console.log(obj);
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];
        var cl = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
        // console.log(curSquare);
        if (curSquare.type == 'number') {
            // 点数字
            // console.log('number');
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];
            if (curSquare.value == 0) {
                obj.innerHTML = ''; //如果点到数字0就不显示
                /* 
                   1.显示字体
                   2.找四周
                       1.显示四周（如果四周的值不为0 那就显示到这里跳出递归）
                       2.如果值为0
                            1.显示自己
                            2.找四周
                                1. 显示自己
                                2. 找四周
                */
                function getAllZero(square) {
                    var around = self.getAround(square); //找到了周围的n个格子
                    for (var i = 0; i < around.length; i++) {
                        var x = around[i][0]; // 行
                        var y = around[i][1]; // 列
                        self.tds[x][y].className = cl[self.squares[x][y].value];
                        if (self.squares[x][y].value == 0) { //当找到的格子为0时递归
                            if (!self.tds[x][y].check) {
                                // 检测这个格子有没有被找到过，如果找到了就设置他的值为true下一次就不会找了
                                self.tds[x][y].check = true;
                                getAllZero(self.squares[x][y]);
                            }
                        } else {
                            // 如果以某个格子为中心找到的四周的格子的值不为0 那就把数字显示出来
                            self.tds[x][y].innerHTML = self.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare);
            }
        } else {
            // console.log('mine')
            // 点到雷
            this.gameOver(obj);
            console.log('游戏失败')

        }
        if (obj.className == 'number') {
            self.numNum - n1;
            self.numNum--;
            console.log(self.numNum);
            if (self.numNum == 0) {
                alert("恭喜你，过关！")
                this.gameOver(obj);
                self.numNum = self.tr * self.td - self.mineNum;
            }
        }
    }
    if (ev.which == 3) {
        if (obj.className && obj.className != 'flag') {
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag'; //切换class

        if (this.squares[obj.pos[0]][obj.pos[1]].type == 'mine') {
            this.allRight = true; //用户最后标小红旗都是雷
        } else {
            this.allRight = false;
        }
        if (obj.className == 'flag') {
            this.mineNumDom.innerHTML = --this.surplusMine;
        } else {
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }
        if (this.surplusMine == 0) {
            // 表示用户已经标完小红旗了 判断游戏是否结束
            if (this.allRight) {
                // 说明全部标对了
                alert('恭喜你，成功了')
            } else {
                alert('游戏结束')
                this.gameOver();
            }
        }
    }
}

// 游戏失败函数
Mine.prototype.gameOver = function (clickTd) {
    /*
         1. 显示所有雷
         2. 取消所有的点击事件
         3. 给点中的雷标上一个红
    */
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'mine') {
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
    }
    if (clickTd) { //检测是否传入这个点击对象
        clickTd.style.backgroundColor = '#f00';
    }
}

// 上边button的功能
var btns = document.querySelectorAll('.level button');
var mine = null; // 用来储存生成的实例
var ln = 0; // 用来处理当前选中的状态
var arr = [
    [9, 9, 10],
    [16, 16, 40],
    [28, 28, 99]
];
for (let i = 0; i < btns.length - 1; i++) {
    btns[i].onclick = function () {

        btns[ln].className = '';
        btns[i].className = 'active';
        mine = new Mine(...arr[i]);
        mine.init();
        ln = i;
    }
}
btns[0].onclick();
btns[3].onclick = function () {
    mine.init();
}

// var mine = new Mine(28, 28, 99);
// mine.init();
// console.log(mine.getAround(mine.squares[0][0]));