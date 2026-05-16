(function () {

    if (document.getElementById("ssi-live-overlay")) {
        document.getElementById("ssi-live-overlay").remove();
        clearInterval(window.ssiLiveInterval);
    }

    let overlay = document.createElement("div");
    overlay.id = "ssi-live-overlay";

    overlay.innerHTML = `
        <style>
            #ssi-live-overlay {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 520px;
                max-height: 80vh;
                background: #0d0d0d;
                border: 1px solid #00d2ff44;
                border-radius: 12px;
                box-shadow: 0 0 30px #00d2ff22, 0 8px 32px rgba(0,0,0,0.8);
                font-family: 'Courier New', monospace;
                font-size: 13px;
                color: #e0e0e0;
                z-index: 999999;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            #ssi-live-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 14px;
                background: #00d2ff14;
                border-bottom: 1px solid #00d2ff33;
                cursor: move;
                user-select: none;
            }

            #ssi-live-title {
                font-weight: bold;
                font-size: 14px;
                color: #00d2ff;
                letter-spacing: 1px;
            }

            #ssi-live-sub {
                font-size: 11px;
                color: #888;
            }

            #ssi-close {
                background: none;
                border: 1px solid #555;
                color: #aaa;
                border-radius: 6px;
                width: 24px;
                height: 24px;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            #ssi-close:hover {
                background: #ff4444;
                border-color: #ff4444;
                color: white;
            }

            #ssi-live-scroll {
                overflow-y: auto;
                max-height: calc(80vh - 48px);
            }

            #ssi-live-scroll::-webkit-scrollbar {
                width: 6px;
            }

            #ssi-live-scroll::-webkit-scrollbar-track {
                background: #111;
            }

            #ssi-live-scroll::-webkit-scrollbar-thumb {
                background: #00d2ff44;
                border-radius: 3px;
            }

            #ssi-live-table {
                width: 100%;
                border-collapse: collapse;
            }

            #ssi-live-table thead tr {
                background: #00d2ff0d;
            }

            #ssi-live-table th {
                padding: 7px 10px;
                text-align: left;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #00d2ff99;
                border-bottom: 1px solid #00d2ff22;
                position: sticky;
                top: 0;
                background: #131313;
            }

            #ssi-live-table td {
                padding: 6px 10px;
                border-bottom: 1px solid #ffffff08;
            }

            #ssi-live-table tbody tr:hover {
                background: #00d2ff0a;
            }

            #ssi-live-table .rank {
                color: #555;
                font-size: 11px;
                width: 28px;
            }

            #ssi-live-table tbody tr:first-child .rank {
                color: #ffd700;
                font-weight: bold;
            }

            #ssi-live-table tbody tr:nth-child(2) .rank {
                color: #c0c0c0;
            }

            #ssi-live-table tbody tr:nth-child(3) .rank {
                color: #cd7f32;
            }

            #ssi-live-table .hf {
                color: #00d2ff;
                font-weight: bold;
            }

            #ssi-live-table .navn {
                color: #f0f0f0;
            }

            #ssi-live-table .score {
                color: #aaa;
                font-size: 12px;
            }

            #ssi-no-data {
                padding: 20px;
                text-align: center;
                color: #555;
                font-size: 12px;
            }
        </style>

        <div id="ssi-live-header">
            <span id="ssi-live-title">⬤ SSI LIVE</span>
            <span id="ssi-live-sub">Laster...</span>
            <button id="ssi-close">✕</button>
        </div>

        <div id="ssi-live-scroll">
            <table id="ssi-live-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>HF</th>
                        <th>Tid</th>
                        <th>Navn</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody id="ssi-live-body"></tbody>
            </table>
            <div id="ssi-no-data" style="display:none;">Ingen data funnet – sjekk at SSI Live er åpen i en annen tab.</div>
        </div>
    `;

    document.body.appendChild(overlay);

    window.ssiLiveOverlay = overlay;

    // Drag-to-move
    (function makeDraggable() {
        let header = document.getElementById("ssi-live-header");
        let isDragging = false, startX, startY, startLeft, startTop;

        overlay.style.right = "auto";
        overlay.style.left = (window.innerWidth - 540) + "px";
        overlay.style.top = "20px";

        header.addEventListener("mousedown", e => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(overlay.style.left);
            startTop = parseInt(overlay.style.top);
        });

        document.addEventListener("mousemove", e => {
            if (!isDragging) return;
            overlay.style.left = (startLeft + e.clientX - startX) + "px";
            overlay.style.top  = (startTop  + e.clientY - startY) + "px";
        });

        document.addEventListener("mouseup", () => { isDragging = false; });
    })();

    function hentData() {

        let rows = Array.from(document.querySelectorAll("table tr"))
            .map(r => r.innerText.trim())
            .filter(t =>
                t &&
                t.includes("\t") &&
                !t.includes("Tid\tHit Factor") &&
                !t.includes("TidHitFactor") &&
                !t.includes("No data")
            )
            .map(t => {
                let p = t.split("\t");
                return {
                    tid:   parseFloat(p[0]),
                    hf:    parseFloat(p[1]),
                    navn:  p[2] || "–",
                    score: p[3] || "–"
                };
            })
            .filter(x => !isNaN(x.hf))
            .sort((a, b) => b.hf - a.hf);

        let tbody   = document.getElementById("ssi-live-body");
        let noData  = document.getElementById("ssi-no-data");
        let table   = document.getElementById("ssi-live-table");

        tbody.innerHTML = "";

        if (rows.length === 0) {
            table.style.display = "none";
            noData.style.display = "block";
        } else {
            table.style.display = "";
            noData.style.display = "none";

            rows.forEach((r, i) => {
                let tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="rank">${i + 1}</td>
                    <td class="hf">${r.hf.toFixed(4)}</td>
                    <td>${r.tid}</td>
                    <td class="navn">${r.navn}</td>
                    <td class="score">${r.score}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        document.getElementById("ssi-live-sub").innerText =
            "Oppdatert: " + new Date().toLocaleTimeString("nb-NO");
    }

    hentData();

    window.ssiLiveInterval = setInterval(hentData, 2000);

    document.getElementById("ssi-close").onclick = () => {
        clearInterval(window.ssiLiveInterval);
        overlay.remove();
    };

})();
