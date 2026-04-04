const canvas = document.getElementById("simCanvas");
      const ctx = canvas.getContext("2d");
      const hudBar = document.getElementById("strength-meter");
      const hudVal = document.getElementById("strength-val");
      const statusText = document.getElementById("status-text");
      const switchEl = document.getElementById("circuit-switch");

      // --- State Variables ---
      let width, height;
      let draggingItem = null;
      let dragOffset = { x: 0, y: 0 };
      let lastMousePos = { x: 0, y: 0 };
      let mouseVelocity = 0;
      let time = 0; // For floating animation

      // --- Physics Objects ---

      // 1. The Magnet
      const magnet = {
        x: 0,
        y: 0,
        w: 200,
        h: 50,
        strength: 100,
        temp: 0,
        colorN: "#e74c3c",
        colorS: "#2980b9",
        isDragging: false,
        update: function () {
          if (this.strength > 0) this.strength -= 0.005; // Natural decay
          if (this.temp > 0) this.temp -= 0.1;
          this.strength = Math.max(0, Math.min(100, this.strength));

          hudBar.style.width = this.strength + "%";
          hudVal.innerText = Math.floor(this.strength) + "%";
        },
        draw: function (ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);

          if (this.temp > 10) {
            ctx.shadowBlur = this.temp;
            ctx.shadowColor = `rgba(255, 100, 50, ${this.temp / 100})`;
          }

          ctx.fillStyle = this.colorS;
          ctx.fillRect(-this.w / 2, -this.h / 2, this.w / 2, this.h);
          ctx.fillStyle = this.colorN;
          ctx.fillRect(0, -this.h / 2, this.w / 2, this.h);

          ctx.fillStyle = "#fff";
          ctx.font = "bold 24px Arial";
          ctx.fillText("S", -this.w / 4 - 10, 8);
          ctx.fillText("N", this.w / 4 - 10, 8);
          ctx.restore();
        },
      };

      // 2. The AC Coil Tool (like candle and hammer)
      const coilTool = {
        x: 0,
        y: 0,
        w: 250,
        h: 120,
        visible: false,
        isDragging: false,
        active: false, // Whether it's powered on
        animationStep: 0,
        draw: function (ctx) {
          if (!this.visible) return;
          
          ctx.save();
          
          // Floating Effect when not dragging
          let floatY = 0;
          if (!this.isDragging) floatY = Math.sin(time * 0.05) * 10;
          
          ctx.translate(this.x, this.y + floatY);
          
          // Draw coil base (wooden stand)
          ctx.fillStyle = "#8B4513";
          ctx.fillRect(-this.w/2 - 15, 50, this.w + 30, 20);
          ctx.fillStyle = "#A0522D";
          ctx.fillRect(-this.w/2 - 10, 30, this.w + 20, 20);
          
          // Draw coil windings
          ctx.strokeStyle = this.active ? "#00ff00" : "#b87333";
          ctx.lineWidth = 4;
          
          if (this.active) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#00ff00";
            this.animationStep++;
          }
          
          // Draw back windings
          for (let i = -this.w/2; i < this.w/2; i += 15) {
            ctx.beginPath();
            ctx.arc(i, 0, 50, Math.PI, 0);
            ctx.stroke();
          }
          
          // Draw front windings
          for (let i = -this.w/2; i < this.w/2; i += 15) {
            ctx.beginPath();
            ctx.arc(i, 0, 50, 0, Math.PI);
            ctx.stroke();
          }
          
          // Draw electric sparks when active
          if (this.active && this.animationStep % 3 === 0) {
            ctx.strokeStyle = "#ffff00";
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ffff00";
            
            for (let i = 0; i < 2; i++) {
              const startX = -this.w/2 + 30 + Math.random() * (this.w - 60);
              const startY = -30 + Math.random() * 60;
              const endX = startX + (Math.random() - 0.5) * 40;
              const endY = startY + (Math.random() - 0.5) * 40;
              
              ctx.beginPath();
              ctx.moveTo(startX, startY);
              ctx.quadraticCurveTo(
                (startX + endX)/2 + (Math.random() - 0.5) * 30,
                (startY + endY)/2 + (Math.random() - 0.5) * 30,
                endX, endY
              );
              ctx.stroke();
            }
          }
          
          // Draw power indicator
          if (this.active) {
            ctx.fillStyle = "#00ff00";
            ctx.beginPath();
            ctx.arc(this.w/2 + 20, -40, 8, 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
        }
      };

      // 3. The Candle
      const candle = {
        x: 100,
        y: 100,
        w: 30,
        h: 80,
        visible: false,
        isDragging: false,
        draw: function (ctx) {
          if (!this.visible) return;
          ctx.save();

          // Floating Effect when not dragging
          let floatY = 0;
          if (!this.isDragging) floatY = Math.sin(time * 0.05) * 10;

          ctx.translate(this.x, this.y + floatY);

          // Wax
          ctx.fillStyle = "#f5f5f5";
          ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
          // Wick
          ctx.fillStyle = "#000";
          ctx.fillRect(-1, -this.h / 2 - 5, 2, 5);
          // Flame
          const flicker = Math.random() * 5;
          ctx.fillStyle = "rgba(255, 165, 0, 0.8)";
          ctx.beginPath();
          ctx.ellipse(
            0,
            -this.h / 2 - 20,
            10 + flicker / 2,
            20 + flicker,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "rgba(255, 255, 0, 0.8)";
          ctx.beginPath();
          ctx.ellipse(0, -this.h / 2 - 15, 5, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        },
      };

      // 4. The Hammer
      const hammer = {
        x: 200,
        y: 100,
        w: 60,
        h: 60,
        visible: false,
        isDragging: false,
        angle: 0,
        draw: function (ctx) {
          if (!this.visible) return;
          ctx.save();

          // Floating Effect when not dragging
          let floatY = 0;
          if (!this.isDragging) floatY = Math.sin(time * 0.05) * 10;

          ctx.translate(this.x, this.y + floatY);

          let swing = Math.min(Math.max(mouseVelocity * 2, -1), 1);
          ctx.rotate(this.angle + swing);

          ctx.fillStyle = "#8e44ad";
          ctx.fillRect(-5, -50, 10, 100);
          ctx.fillStyle = "#95a5a6";
          ctx.fillRect(-20, -60, 40, 30);

          ctx.restore();
        },
      };

      // 5. Metal Nails
      let nails = [];
      class Nail {
        constructor() {
          // Start floating in air, gently oscillating
          this.baseX = Math.random() * width;
          this.baseY = Math.random() * (height * 0.4) + height * 0.1;
          this.x = this.baseX;
          this.y = this.baseY;
          this.floatPhase = Math.random() * Math.PI * 2;
          this.vx = 0;
          this.vy = 0;
          this.angle = Math.random() * 6.28;
          this.w = 30;
          this.h = 4;
          this.stuck = false;
          this.stuckOffset = { x: 0, y: 0 };
          this.floating = true;
        }
        update() {
          if (this.stuck) {
            if (magnet.strength < 10) {
              this.stuck = false;
            } else {
              this.x = magnet.x + this.stuckOffset.x;
              this.y = magnet.y + this.stuckOffset.y;
              this.vx = 0;
              this.vy = 0;
              this.floating = false;
              return;
            }
          }
          // Floating gently in air if not yet attracted
          if (this.floating && magnet.strength > 0) {
            this.x = this.baseX + Math.sin(time * 0.03 + this.floatPhase) * 18;
            this.y = this.baseY + Math.cos(time * 0.025 + this.floatPhase) * 12;
          }
          if (!this.stuck && magnet.strength > 0) {
            const dx = magnet.x - this.x;
            const dy = magnet.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 400) {
              const force =
                (magnet.strength / 100) * (2000 / (dist * dist + 100));
              this.vx += (dx / dist) * force;
              this.vy += (dy / dist) * force;
              const targetAngle = Math.atan2(dy, dx);
              this.angle += (targetAngle - this.angle) * 0.1;
              // If close enough, stop floating
              if (dist < 120) this.floating = false;
            }
          }
          this.vx *= 0.92;
          this.vy *= 0.92;
          if (magnet.strength < 20 || !this.stuck) {
            const dist = Math.hypot(magnet.x - this.x, magnet.y - this.y);
            if (dist > 50 || magnet.strength < 20) {
              if (!this.floating) this.vy += 0.2; // Gravity
            }
          }
          this.x += this.vx;
          this.y += this.vy;
          if (this.y > height - 20) {
            this.y = height - 20;
            this.vy *= -0.5;
            this.vx *= 0.8;
          }
          if (magnet.strength > 10 && !this.stuck) {
            if (
              Math.abs(this.x - magnet.x) < magnet.w / 2 &&
              Math.abs(this.y - magnet.y) < magnet.h / 2
            ) {
              this.stuck = true;
              this.stuckOffset.x = this.x - magnet.x;
              this.stuckOffset.y = this.y - magnet.y;
              this.floating = false;
            }
          }
        }
        draw(ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.angle);
          ctx.fillStyle = "#bdc3c7";
          ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
          ctx.fillStyle = "#7f8c8d";
          ctx.fillRect(-this.w / 2, -this.h, 4, this.h * 2);
          ctx.restore();
        }
      }

      // --- Tool Toggle Logic ---
      function toggleTool(tool) {
        if (tool === 'candle') {
          candle.visible = !candle.visible;
          if (candle.visible) {
            // Spawn in lower left center
            candle.x = width * 0.25;
            candle.y = height * 0.7;
            statusText.innerText = "Candle spawned. Drag it under the magnet.";
          } else {
            statusText.innerText = "Candle removed.";
          }
          document.getElementById('btn-candle').classList.toggle('active');
        }
        
        if (tool === 'hammer') {
          hammer.visible = !hammer.visible;
          if (hammer.visible) {
            // Spawn in lower left center
            hammer.x = width * 0.25;
            hammer.y = height * 0.7;
            statusText.innerText = "Hammer spawned. Drag fast to hit!";
          } else {
            statusText.innerText = "Hammer removed.";
          }
          document.getElementById('btn-hammer').classList.toggle('active');
        }
        
        if (tool === 'coil') {
          coilTool.visible = !coilTool.visible;
          if (coilTool.visible) {
            // Spawn in lower left center
            coilTool.x = width * 0.25;
            coilTool.y = height * 0.7;
            statusText.innerText = "AC Coil spawned. Drag it around the magnet.";
          } else {
            coilTool.active = false;
            switchEl.classList.remove('on');
            statusText.innerText = "AC Coil removed.";
          }
          document.getElementById('btn-coil').classList.toggle('active');
        }
      }

      function toggleCircuitSwitch() {
        // Only toggle if coil is visible
        if (coilTool.visible) {
          coilTool.active = !coilTool.active;
          if (coilTool.active) {
            switchEl.classList.add('on');
            statusText.innerText = "Coil powered ON! Place it around magnet.";
          } else {
            switchEl.classList.remove('on');
            statusText.innerText = "Coil powered OFF.";
          }
        }
      }

      // --- Core Functions ---

      function init() {
        resize();
        window.addEventListener("resize", resize);
        resetSim();
        loop();
      }

      function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        magnet.x = width / 2;
        magnet.y = height / 2;
      }

      function resetSim() {
        magnet.strength = 100;
        magnet.temp = 0;
        magnet.x = width / 2;
        magnet.y = height / 2;
        magnet.isDragging = false;
        magnet.colorN = "#e74c3c";
        magnet.colorS = "#2980b9";

        candle.visible = false;
        hammer.visible = false;
        coilTool.visible = false;
        coilTool.active = false;
        switchEl.classList.remove("on");

        // Reset buttons CSS
        document.getElementById("btn-candle").classList.remove("active");
        document.getElementById("btn-hammer").classList.remove("active");
        document.getElementById("btn-coil").classList.remove("active");

        draggingItem = null;
        nails = [];
        // Spawn nails floating in air initially
        for (let i = 0; i < 30; i++) {
          nails.push(new Nail());
        }
        statusText.innerText = "Simulation Reset. Ready.";
      }

      // --- Interaction Logic ---

      function getMousePos(evt) {
        const rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top,
        };
      }

      function checkHit(obj, mx, my) {
        let hitSize = 50;
        if (obj === magnet) {
          return (
            mx > obj.x - obj.w / 2 &&
            mx < obj.x + obj.w / 2 &&
            my > obj.y - obj.h / 2 &&
            my < obj.y + obj.h / 2
          );
        } else {
          // Adjust hit check for floating offset
          let currentY = obj.y;
          if (!obj.isDragging && obj !== coilTool) currentY += Math.sin(time * 0.05) * 10;
          // For coil, check larger area since it's bigger
          const checkWidth = obj === coilTool ? obj.w + 100 : hitSize * 2;
          const checkHeight = obj === coilTool ? obj.h + 100 : hitSize * 2;
          
          return (
            mx > obj.x - checkWidth/2 &&
            mx < obj.x + checkWidth/2 &&
            my > currentY - checkHeight/2 &&
            my < currentY + checkHeight/2
          );
        }
      }

      canvas.addEventListener("mousedown", (e) => {
        const pos = getMousePos(e);

        if (candle.visible && checkHit(candle, pos.x, pos.y))
          draggingItem = candle;
        else if (hammer.visible && checkHit(hammer, pos.x, pos.y))
          draggingItem = hammer;
        else if (coilTool.visible && checkHit(coilTool, pos.x, pos.y))
          draggingItem = coilTool;
        else if (checkHit(magnet, pos.x, pos.y)) draggingItem = magnet;

        if (draggingItem) {
          draggingItem.isDragging = true;
          // Fix offset calculation to prevent jumping
          let currentY = draggingItem.y;
          if (draggingItem !== magnet && draggingItem !== coilTool) currentY += Math.sin(time * 0.05) * 10;

          dragOffset.x = pos.x - draggingItem.x;
          dragOffset.y = pos.y - currentY;
        }
      });

      window.addEventListener("mouseup", () => {
        if (draggingItem) draggingItem.isDragging = false;
        draggingItem = null;
      });

      window.addEventListener("mousemove", (e) => {
        const pos = getMousePos(e);
        const dx = pos.x - lastMousePos.x;
        const dy = pos.y - lastMousePos.y;
        mouseVelocity = Math.sqrt(dx * dx + dy * dy);
        lastMousePos = pos;

        if (draggingItem) {
          draggingItem.x = pos.x - dragOffset.x;
          draggingItem.y = pos.y - dragOffset.y;
        }
      });

      // --- Simulation Loop ---

      function updateLogic() {
        time++;
        magnet.update();
        nails.forEach((n) => n.update());

        // Candle heating effect
        if (candle.visible) {
          let candleY =
            candle.y + (candle.isDragging ? 0 : Math.sin(time * 0.05) * 10);
          const dist = Math.hypot(candle.x - magnet.x, candleY - 40 - magnet.y);
          if (dist < 80) {
            magnet.temp += 0.8;
            magnet.strength -= 0.3;
            statusText.innerText = "Heating... Domains randomizing.";
          }
        }

        // Hammer hitting effect
        if (hammer.visible && draggingItem === hammer) {
          const dist = Math.hypot(hammer.x - magnet.x, hammer.y - magnet.y);
          if (dist < 80 && mouseVelocity > 15) {
            magnet.strength -= 5;
            statusText.innerText = "IMPACT! Disorienting domains!";
            magnet.x += (Math.random() - 0.5) * 10;
            magnet.y += (Math.random() - 0.5) * 10;
          }
        }

        // AC Coil demagnetization effect
        if (coilTool.visible && coilTool.active) {
          const dist = Math.hypot(coilTool.x - magnet.x, coilTool.y - magnet.y);
          if (dist < 120) {
            // Strong demagnetization when magnet is inside coil
            magnet.strength -= 0.8;
            
            // Make magnet vibrate slightly
            if (time % 3 === 0) {
              magnet.x += (Math.random() - 0.5) * 3;
              magnet.y += (Math.random() - 0.5) * 2;
            }
            
            // Flash magnet colors
            if (time % 10 < 5) {
              magnet.colorN = "#ffff00";
              magnet.colorS = "#00ffff";
            } else {
              magnet.colorN = "#e74c3c";
              magnet.colorS = "#2980b9";
            }
            
            statusText.innerText = "AC Field active! Randomizing domains...";
          }
        }
      }

      function draw() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw nails
        nails.forEach((n) => n.draw(ctx));
        
        // Draw magnet
        magnet.draw(ctx);
        
        // Draw tools
        candle.draw(ctx);
        hammer.draw(ctx);
        coilTool.draw(ctx);
      }

      function loop() {
        updateLogic();
        draw();
        requestAnimationFrame(loop);
      }

      init();