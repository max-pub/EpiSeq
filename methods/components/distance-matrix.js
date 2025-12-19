
class DistanceMatrix extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._dimension = 5; // default dimension
        this._cellSize = '8px'; // default cell size
        this._values = true; // default show values
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['dimension', 'cell-size', 'values'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'dimension') {
            const v = parseInt(newValue, 10);
            this._dimension = Number.isFinite(v) && v > 0 ? v : 5;
            this.render();
        }
        else if (name === 'cell-size') {
            const v = parseFloat(newValue);
            this._cellSize = Number.isFinite(v) && v > 0 ? v + 'mm' : '8px';
            this.render();
        }
        else if (name === 'values') {
            this._values = newValue === 'true';
            this.render();
        }
    }

    get dimension() {
        return this._dimension;
    }

    set dimension(val) {
        const v = parseInt(val, 10);
        const out = Number.isFinite(v) && v > 0 ? v : 5;
        this._dimension = out;
        this.setAttribute('dimension', String(out));
    }

    get cellSize() {
        return this._cellSize;
    }

    set cellSize(val) {
        const v = parseFloat(val);
        const out = Number.isFinite(v) && v > 0 ? v + 'mm' : '8px';
        this._cellSize = out;
        this.setAttribute('cell-size', String(v));
    }

    get values() {
        return this._values;
    }

    set values(val) {
        this._values = val === true || val === 'true';
        this.setAttribute('values', String(this._values));
    }

    generateData() {
        const size = this.dimension || 5;
        const data = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                if (i === j) {
                    row.push({ type: 'diag', value: 'x' });
                } else if (i > j) {
                    // Lower triangle filled
                    row.push({ type: 'val', value: Math.floor(Math.random() * 100) });
                } else {
                    // Upper triangle empty
                    row.push({ type: 'empty', value: '' });
                }
            }
            data.push(row);
        }
        return data;
    }

    getColor(value) {
        // Heatmap: Low (0) = Green (120), High (100) = Red (0)
        const hue = 120 - (value * 1.2);
        return `hsl(${hue}, 75%, 60%)`;
    }

    render() {
        const data = this.generateData();

        const style = `
                <style>
                    :host {
                        display: inline-block;
                        /* Dynamic size based on dimension */
                        --dimension: ${this.dimension};
                        --cell-size: ${this._cellSize};
                        width: calc(var(--dimension) * var(--cell-size));
                        height: calc(var(--dimension) * var(--cell-size));
                        overflow: hidden;
                        // border-radius: 10%; /* Slight rounding for icon feel */
                        // box-shadow: 0 1px 2px rgba(0,0,0,0.2);
                        background: white;
                    }

                    table {
                        width: 100%;
                        height: 100%;
                        border-collapse: collapse;
                        table-layout: fixed; /* Ensures equal cell sizes */
                        border: none;
                        margin: 0;
                        padding: 0;
                    }

                    td {
                        padding: 0;
                        margin: 0;
                        text-align: center;
                        vertical-align: middle;
                        box-sizing: border-box;
                        /* Font size scales with cell height roughly */
                        font-size: 80%; 
                        /* Uses container query units if supported, otherwise generic fallback */
                        font-size: clamp(6px, 20cqw, 12px); 
                        line-height: 1;
                        // font-family: 'Courier New', monospace; /* Monospace for 'x' alignment */
                        font-weight: bold;
                        cursor: default;
                        overflow: hidden;
                        border: 0.5px solid rgba(255,255,255,0.2); /* Tiny border for grid separation */
                    }

                    /* Crucial for "icon size" readability:
                       At very small sizes, text disappears or becomes purely graphical.
                       We use container queries to hide text if the cell is too small,
                       turning it into a pure heatmap pixel.
                    */
                    .cell-content {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                    }
                    
                    /* Diagonal Styling */
                    .diag {
                        background-color: #e0e0e0;
                        color: #777;
                        font-size: 60%;
                    }

                    /* Empty Styling */
                    .empty {
                        background-color: #fff;
                    }

                    /* Value Styling */
                    .val {
                        color: rgba(0,0,0,0.7);
                        /* Text shadow to improve readability on colors */
                        text-shadow: 0 0 2px rgba(255,255,255,0.5); 
                    }
                    
                    /* At icon size (approx < 50px), hide numbers, keep colors and diagonal 'x' */
                    @container (max-width: 50px) {
                        .val { font-size: 0; } 
                        .diag { font-size: 0; }
                        /* Optional: Keep 'x' visible as a dot? No, pure color block is cleaner */
                    }

                </style>
                `;

        // Build HTML Table String
        let rows = '';
        data.forEach(row => {
            let cells = '';
            row.forEach(cell => {
                let bgStyle = '';
                if (cell.type === 'val') {
                    bgStyle = `background-color: ${this.getColor(cell.value)};`;
                }

                cells += `<td class="${cell.type}" style="${bgStyle}">
                                    <div class="cell-content">${cell.type === 'val' && !this._values ? '' : cell.value}</div>
                                  </td>`;
            });
            rows += `<tr>${cells}</tr>`;
        });

        this.shadowRoot.innerHTML = `
                    ${style}
                    <!-- Container wrapper to establish container query context if needed -->
                    <div style="width:100%; height:100%; container-type: size;">
                        <table>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                `;
    }
}

customElements.define('distance-matrix', DistanceMatrix);
