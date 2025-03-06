(function () {
    var canvas = $("#canvas");
  
    if (!canvas[0].getContext) {
      $("#error").show();
      return false;
    }
  
    var width = canvas.width();
    var height = canvas.height();
    canvas.attr("width", width);
    canvas.attr("height", height);
    var opts = {
      seed: {
        x: width / 2 - 20,
        color: "rgb(190, 26, 37)",
        scale: 2,
      },
      branch: [
        [ 535, 680, 570, 250, 500, 200, 30, 100,
          [
            [ 540,500,455,417,340, 400, 13, 100,
              [[450, 435, 434, 430, 394, 395, 2, 40]],
            ],
            [ 550, 445, 600, 356, 680, 345, 12, 100,
              [[578, 400, 648, 409, 661, 426, 3, 80]],
            ],
            [539, 281, 537, 248, 534, 217, 3, 40],
            [ 546, 397, 413, 247, 328, 244, 9, 80,
              [
                [427, 286, 383, 253, 371, 205, 2, 40],
                [498, 345, 435, 315, 395, 330, 4, 60],
              ],
            ],
            [ 546, 357, 608, 252, 678, 221, 6, 100,
              [[590, 293, 646, 277, 648, 271, 2, 80]],
            ],
          ],
        ],
      ],
      bloom: {
        num: 700,
        width: 1080,
        height: 650,
      },
      footer: {
        width: 1200,
        height: 5,
        speed: 10,
      },
    };
  
    var tree = new Tree(canvas[0], width, height, opts);
    var seed = tree.seed;
    var foot = tree.footer;
    var hold = 1;
    

    canvas
      .click(function (e) {
        var offset = canvas.offset(),
          x,
          y;
        x = e.pageX - offset.left;
        y = e.pageY - offset.top;
        if (seed.hover(x, y)) {
          hold = 0;
          canvas.unbind("click");
          canvas.unbind("mousemove");
          canvas.removeClass("hand");
        }
      })
      .mousemove(function (e) {
        var offset = canvas.offset(),
          x,
          y;
        x = e.pageX - offset.left;
        y = e.pageY - offset.top;
        canvas.toggleClass("hand", seed.hover(x, y));
      });
  
    var seedAnimate = eval(
      Jscex.compile("async", function () {
        seed.draw();
        while (hold) {
          $await(Jscex.Async.sleep(10));
        }
        while (seed.canScale()) {
          seed.scale(0.95);
          $await(Jscex.Async.sleep(10));
        }
        while (seed.canMove()) {
          seed.move(0, 2);
          foot.draw();
          $await(Jscex.Async.sleep(10));
        }
      })
    );
  
    var growAnimate = eval(
      Jscex.compile("async", function () {
        do {
          tree.grow();
          $await(Jscex.Async.sleep(10));
        } while (tree.canGrow());
      })
    );
    ////////////////////////////
   
 ///////////////////   
    var images = [];
    $("#image-list img").each(function () {
        images.push($(this).attr("src"));
    });
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    shuffleArray(images);

    var usedImages = new Set(); // Tạo tập hợp để lưu ảnh đã dùng

    function getUniqueImage() {
    if (images.length === 0) return null; // Nếu hết ảnh thì không lấy nữa
    return images.pop(); // Lấy ảnh cuối danh sách (đã xáo trộn)
    }
    var canopyArea = {
        minX: 350,
        maxX: 850,
        minY: 100,
        maxY: 400
    };
    function drawHeartImage(imgSrc, ctx, x, y, size) {
      var img = new Image();
      img.src = imgSrc;
  
      img.onload = function () {
          ctx.save();
          
          // Vẽ hình trái tim
          ctx.beginPath();
          ctx.moveTo(x, y + size / 4);
          ctx.quadraticCurveTo(x, y, x + size / 4, y);
          ctx.quadraticCurveTo(x + size / 2, y, x + size / 2, y + size / 4);
          ctx.quadraticCurveTo(x + size / 2, y + size / 2, x, y + size);
          ctx.quadraticCurveTo(x - size / 2, y + size / 2, x - size / 2, y + size / 4);
          ctx.quadraticCurveTo(x - size / 2, y, x, y);
          ctx.closePath();
          
          // Cắt theo hình trái tim
          ctx.clip();
          
          // Vẽ ảnh vào vùng cắt
          ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  
          ctx.restore();
      };
  }
  
    ////////////////////////////////
    var flowAnimate = eval(
        Jscex.compile("async", function () {
            var imageList = []; // Danh sách vị trí ảnh đã vẽ
            var minSpacing = 60; // Khoảng cách tối thiểu giữa các ảnh
            var imageList = []; // Danh sách vị trí ảnh đã vẽ
            var minSpacing = 120; // Khoảng cách tối thiểu giữa các ảnh (tăng lên để tránh chồng)
            
            function isOverlapping(x, y, size) {
                for (var i = 0; i < imageList.length; i++) {
                    var imgObj = imageList[i];
                    var dx = imgObj.x - x;
                    var dy = imgObj.y - y;
                    var distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < size * 1.5) { // Khoảng cách tối thiểu để ảnh không chồng lên nhau
                        return true;
                    }
                }
                return false;
            }
            
            function loadImage(imgSrc) {
                var img = new Image();
                img.src = imgSrc;
                img.className = "heart-shape";
                
                img.onload = function () {
                    var maxAttempts = 100;
                    var x, y, isValidPosition;
                    var imageSize = 100; // Kích thước ảnh
            
                    for (var attempt = 0; attempt < maxAttempts; attempt++) {
                        x = Math.random() * (canopyArea.maxX - canopyArea.minX) + canopyArea.minX;
                        y = Math.random() * (canopyArea.maxY - canopyArea.minY) + canopyArea.minY;
            
                        if (!isOverlapping(x, y, imageSize)) {
                            var imgElement = document.createElement("img");
                            imgElement.src = imgSrc;
                            imgElement.className = "heart-shape";
                            imgElement.style.left = x + "px";
                            imgElement.style.top = y + "px";
                            document.body.appendChild(imgElement);
            
                            imageList.push({ element: imgElement, x: x, y: y });
            
                            break;
                        }
                    }
                };
            }
          
            
    
          do {
            tree.flower(2); // Vẽ hoa cùng lúc với ảnh
        
            var imgSrc = getUniqueImage();
            if (imgSrc) {
                loadImage(imgSrc); // Ảnh xuất hiện đồng thời với hoa
            }
        
            $await(Jscex.Async.sleep(10)); // Điều chỉnh tốc độ vẽ đồng bộ
        } while (tree.canFlower());

      }))
    
    
    
    // var flowAnimate = eval(
    //   Jscex.compile("async", function () {
    //     do {
    //       tree.flower(2);
    //       $await(Jscex.Async.sleep(10));
    //     } while (tree.canFlower());
    //   })
    // );
  
    var moveAnimate = eval(
      Jscex.compile("async", function () {
        tree.snapshot("p1", 240, 0, 610, 680);
    
        var images = document.querySelectorAll(".heart-shape"); // Lấy danh sách ảnh trên cây
        
        while (tree.move("p1", 500, 0)) {
          foot.draw();
    
          // Cập nhật vị trí ảnh theo cây
          images.forEach(function (img) {
            var currentX = parseFloat(img.style.left) || 0;
            img.style.left = (currentX + 5) + "px"; // Dịch chuyển ảnh theo cây
          });
    
          $await(Jscex.Async.sleep(10));
        }
    
        foot.draw();
        tree.snapshot("p2", 500, 0, 610, 680);
    
        canvas
          .parent()
          .css("background", "url(" + tree.toDataURL("image/png") + ")");
        canvas.css("background", "#ffe");
        $await(Jscex.Async.sleep(300));
        canvas.css("background", "none");
      })
    );
  
    var jumpAnimate = eval(
      Jscex.compile("async", function () {
        var ctx = tree.ctx;
        while (true) {
          tree.ctx.clearRect(0, 0, width, height);
          tree.jump();
          foot.draw();
          $await(Jscex.Async.sleep(25));
        }
      })
    );
  
    var textAnimate = eval(
      Jscex.compile("async", function () {
        // var together = new Date();
        // together.setFullYear(2024,10 , 18);
        // together.setHours(0);
        // together.setMinutes(0);
        // together.setSeconds(0);
        // together.setMilliseconds(0);
  
        $("#code").show().typewriter();
        $("#clock-box").fadeIn(500);
        while (true) {
          timeElapse(together);
          $await(Jscex.Async.sleep(1000));
        }
      })
    );
  
    var runAsync = eval(
      Jscex.compile("async", function () {
        $await(seedAnimate());
        $await(growAnimate());
        $await(flowAnimate());
        $await(moveAnimate());
  
        textAnimate().start();
  
        $await(jumpAnimate());
      })
    );
  
    runAsync().start();
  })();
  
  document.addEventListener("click", function() {
      var audio = document.getElementById("myAudio");
      audio.play();
  });