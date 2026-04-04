
        document.addEventListener("DOMContentLoaded", () => {
            // Load real images with fallbacks
            const phoneImg = new Image();
            phoneImg.src = "mobile.jpg"; // High-quality smartphone in hand
            phoneImg.className = "device-image";
            phoneImg.onload = () => { document.getElementById("phone-img").innerHTML = ''; document.getElementById("phone-img").appendChild(phoneImg); };

            const routerImg = new Image();
            routerImg.src = "router.jpg"; // Modern router
            routerImg.className = "device-image";
            routerImg.onload = () => { document.getElementById("router-img").innerHTML = ''; document.getElementById("router-img").appendChild(routerImg); };

            const laptopImg = new Image();
            laptopImg.src = "laptop.jpg";  // Open laptop on desk
            laptopImg.className = "device-image";
            laptopImg.onload = () => { document.getElementById("laptop-img").innerHTML = ''; document.getElementById("laptop-img").appendChild(laptopImg); };

            const wifiWaves = document.getElementById("wifiWaves");
            const dataPackets = document.getElementById("dataPackets");
            const positions = { phone: {x: 200, y: 300}, router: {x: 600, y: 300}, laptop: {x: 1000, y: 300} };
            let running = false, streaming = false, packetId = 0, sent = 0, received = 0;
            let intervals = [];

            function createWave() {
                const wave = document.createElement("div");
                wave.className = "wifi-wave";
                wifiWaves.appendChild(wave);
                setTimeout(() => wave.remove(), 4000);
            }

            function updateSignal(barsId, base) {
                const bars = document.getElementById(barsId).children;
                const strength = Math.floor(base + Math.random() * 0.8);
                for (let i = 0; i < 4; i++) bars[i].classList.toggle("active", i < strength);
            }

            function updateOverallSignal() {
                const phone = Array.from(document.getElementById("phone-signal").children).filter(b => b.classList.contains("active")).length;
                const laptop = Array.from(document.getElementById("laptop-signal").children).filter(b => b.classList.contains("active")).length;
                const avg = (phone + laptop + 4) / 3; // Router always strong
                document.getElementById("signal").textContent = avg > 3.5 ? "Strong" : avg > 2.5 ? "Good" : "Fair";
            }

            function sendPacket(from, to, isAck = false) {
                packetId++;
                const packet = document.createElement("div");
                packet.className = "data-packet active";
                packet.innerHTML = `<div class="packet-header">${isAck ? "ACK ✓" : "DATA #" + packetId}</div><div class="packet-body">${from} → ${to}</div>`;
                const start = positions[from], end = positions[to];
                packet.style.left = `${start.x - 50}px`; packet.style.top = `${start.y - 35}px`;
                packet.style.setProperty('--dx', `${end.x - start.x}px`); packet.style.setProperty('--dy', `${end.y - start.y}px`);
                dataPackets.appendChild(packet);

                if (!isAck) { sent++; received++; document.getElementById("sent").textContent = sent; document.getElementById("received").textContent = received; }

                setTimeout(() => { packet.remove(); if (!isAck) sendPacket(to, from, true); }, 3000);
            }

            function transfer() {
                createWave();
                updateSignal("phone-signal", 3.6);
                updateSignal("laptop-signal", 3.6);
                updateOverallSignal();

                const from = Math.random() > 0.5 ? "phone" : "laptop";
                const to = from === "phone" ? "laptop" : "phone";
                sendPacket(from, "router");
                setTimeout(() => sendPacket("router", to), 1000);
            }

            document.getElementById("start-btn").onclick = () => {
                running = !running;
                document.getElementById("start-btn").textContent = running ? "⏸️ Pause" : "▶️ Start Normal Transfer";
                if (running) intervals.push(setInterval(transfer, 4000));
                else intervals.forEach(clearInterval); intervals = [];
            };

            document.getElementById("stream-btn").onclick = () => {
                streaming = !streaming;
                document.getElementById("stream-btn").textContent = streaming ? "⏸️ Stop Streaming" : "⚡ Fast Streaming (like Video)";
                if (streaming) intervals.push(setInterval(transfer, 1200));
                else intervals.forEach(clearInterval); intervals = [];
            };

            document.getElementById("packet-btn").onclick = transfer;
            document.getElementById("reset-btn").onclick = () => location.reload();

            setInterval(createWave, 2000);
            updateSignal("phone-signal", 4);
            updateSignal("laptop-signal", 4);
            updateOverallSignal();
        });