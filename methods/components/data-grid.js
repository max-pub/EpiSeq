
// --- WEB COMPONENT DEFINITION ---
class DataGrid extends HTMLElement {
    static get observedAttributes() {
        return ['rows', 'cols', 'base-color', 'text', 'cell-size'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    // --- Content Generators ---
    getRandomChars(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    getRandomNums(length) {
        let result = '';
        const characters = '0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    render() {
        // Parse attributes
        const rows = parseInt(this.getAttribute('rows') || '7');
        const cols = parseInt(this.getAttribute('cols') || '5');
        const baseColor = this.getAttribute('base-color') || 'orange';
        const text = this.getAttribute('text') !== 'false'; // default true
        const cellSize = parseInt(this.getAttribute('cell-size') || '1');

        // CSS Variables for configuration
        const style = `
                    :host {
                        display: block;
                        container-type: size; /* Crucial for scaling font to container size */
                        overflow: hidden;
                        background: white;
                        border: 1px solid rgba(0,0,0,0.1);
                        --base-color: ${baseColor};
                        --rows: ${rows};
                        --cols: ${cols};
                        --cell-size: ${cellSize};
                        width: calc(var(--cols) * 1.5mm * var(--cell-size));
                        height: calc(var(--rows) * 1mm * var(--cell-size) + 1mm * var(--cell-size));
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                        // font-family: 'Courier New', monospace; /* Monospace for alignment */
                        /* Dynamic Font Size Calculation:
                           100cqh = 100% of container height.
                           Divided by rows+1 (header + data).
                           Multiplied by 0.6 to fit within the cell line-height.
                           Clamp ensures it doesn't disappear completely or get absurdly huge.
                        */
                        font-size: clamp(2px, calc(100cqh / (var(--rows) + 1) * 0.6), 100px); 
                        cursor: default;
                        user-select: none;
                    }

                    /* Header Styling */
                    thead th {
                        background-color: var(--base-color);
                        color: rgba(255,255,255,0.9);
                        font-weight: 700;
                        // border-bottom: 2px solid rgba(0,0,0,0.2);
                        height: calc(1mm * var(--cell-size));
                        padding: calc(0.5mm * var(--cell-size));
                        overflow: hidden;
                        vertical-align: middle;
                        text-align: center;
                        box-sizing: border-box;
                    }

                    /* Cell Styling */
                    tbody td {
                        height: calc(1mm * var(--cell-size));
                        border: 1px solid color-mix(in srgb, var(--base-color), white 70%);
                        color: #333;
                        padding: 0;
                        text-align: center;
                        vertical-align: middle;
                        overflow: hidden;
                        white-space: nowrap;
                        /* Alternating column background hint */
                        background-color: color-mix(in srgb, var(--base-color), white 95%);
                    }

                    /* Zebra striping for visual density */
                    tbody tr:nth-child(even) td {
                        background-color: color-mix(in srgb, var(--base-color), white 85%);
                    }
                `;

        // --- Generate Table HTML ---

        // Header Row
        let headerHTML = '<thead><tr>';
        for (let c = 0; c < cols; c++) {
            // Use header text or empty based on text attribute
            const headerContent = text ? `H${c + 1}` : '';
            headerHTML += `<th>${headerContent}</th>`;
        }
        headerHTML += '</tr></thead>';

        // Body Rows
        let bodyHTML = '<tbody>';
        for (let r = 0; r < rows; r++) {
            bodyHTML += '<tr>';
            for (let c = 0; c < cols; c++) {
                // Use random text or empty based on text attribute
                const cellContent = text ? this.getRandomChars(3) : '';

                bodyHTML += `<td>${cellContent}</td>`;
            }
            bodyHTML += '</tr>';
        }
        bodyHTML += '</tbody>';

        this.shadowRoot.innerHTML = `
                    <style>${style}</style>
                    <table cellpadding="0" cellspacing="0">
                        ${headerHTML}
                        ${bodyHTML}
                    </table>
                `;
    }
}

customElements.define('data-grid', DataGrid);

