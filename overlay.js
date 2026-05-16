(function () {
                    <th>HF</th>
                    <th>Time</th>
                    <th>Name</th>
                    <th>Score</th>
                </tr>
            </thead>

            <tbody id="ssi-live-body"></tbody>
        </table>

    `;

    document.body.appendChild(overlay);

    window.ssiLiveOverlay = overlay;

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
                tid: parseFloat(p[0]),
                hf: parseFloat(p[1]),
                navn: p[2],
                score: p[3]
            };

        })
        .filter(x => !isNaN(x.hf))
        .sort((a,b)=>b.hf-a.hf);

        let tbody = document.getElementById("ssi-live-body");

        tbody.innerHTML = "";

        rows.forEach((r,i)=>{

            tbody.innerHTML += `
                <tr>
                    <td class="rank">${i+1}</td>
                    <td class="hf">${r.hf.toFixed(4)}</td>
                    <td>${r.tid}</td>
                    <td>${r.navn}</td>
                    <td>${r.score}</td>
                </tr>
            `;

        });

        document.getElementById("ssi-live-sub").innerText =
            "Updated: " + new Date().toLocaleTimeString();

    }

    hentData();

    window.ssiLiveInterval = setInterval(hentData, 2000);

    document.getElementById("ssi-close").onclick = ()=>{

        clearInterval(window.ssiLiveInterval);

        overlay.remove();

    };

})();
