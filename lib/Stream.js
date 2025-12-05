export class Stream {
    /** @type {{done: number, total: number | null}} Der aktuelle Ladefortschritt in Bytes. */
    progress = { done: 0, total: null };

    /** @type {Response} Die interne Response, die den iterierbaren Stream enthält. */
    #response;

    /**
     * Privater Konstruktor. Instanziierung erfolgt nur über Factory-Methoden.
     * @param {Response} response - Die HTTP-Response oder die künstliche File-Response.
     * @private
     */
    constructor(response) {
        if (!response.body) {
             throw new Error("Response body is not a readable stream.");
        }
        
        // **Wichtig:** Machen Sie den Stream-Body iterierbar sofort nach der Instanziierung.
        // Wir erstellen eine neue Response mit dem iterierbaren Body.
        this.#response = new Response(
            makeReadableStreamAsyncIterable(response.body), 
            response
        );
        
        // Initialisiert die Gesamtgröße aus dem Header oder auf null.
        this.progress.total = Number(this.#response.headers.get('content-length')) || null;
    }

    // --- Statische Erzeuger (Factory Methods) ---

    /**
     * Erstellt einen Stream aus einer URL.
     * @param {string} url 
     * @returns {Promise<Stream>}
     */
    static async fromURL(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                // Real Error Handling
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }
            return new this(response);
        } catch (error) {
            console.error("Failed to fetch URL:", url, error);
            throw error;
        }
    }

    /**
     * Erstellt einen Stream aus einem File/Blob-Objekt.
     * @param {File | Blob} file
     * @returns {Stream}
     */
    static fromFile(file) {
        if (!(file instanceof Blob)) {
            throw new TypeError("Input must be a File or Blob object.");
        }
        // Das File/Blob wird in eine Response verpackt.
        const response = new Response(file);
        // Setze die Content-Length manuell, da es keine HTTP-Header gibt.
        response.headers.set('content-length', file.size.toString());
        return new this(response);
    }

    static fromString(string) {
        // new Blob(['your string']).stream();
        const blob = new Blob([string], { type: 'text/plain' });
        return this.fromFile(blob);
    }

    // --- Interne Hilfsfunktionen ---

    /**
     * Teilt eine Zeichenkette in Zeilen, behandelt verschiedene Zeilenenden.
     * @param {string} string 
     * @returns {string[]}
     */
    splitLines(string) {
        // Nutzt ein einzelnes Regex für CR/LF/CRLF
        return string?.split(/\r\n|\r|\n/) ?? [];
    }

    // --- Stream-Generatoren ---

    /**
     * Liefert rohe Byte-Chunks (Uint8Array) aus dem Stream.
     * Nutzt die elegante 'for await...of' Syntax.
     * @returns {AsyncGenerator<Uint8Array>}
     */
    async * bytes() {
        for await (const bytes of this.#response.body) {
            // Sicherstellen, dass der Wert ein Uint8Array ist (standardmäßig der Fall im Web API)
            const byteChunk = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
            this.progress.done += byteChunk.length;
            yield byteChunk;
        }
    }

    /**
     * Liefert dekodierte Zeichenketten-Chunks aus dem Stream.
     * @returns {AsyncGenerator<string>}
     */
    async * chars() {
        const decoder = new TextDecoder();
        for await (const bytes of this.bytes()) {
            // stream: true ist wichtig, um unvollständige Multibyte-Zeichen zu puffern
            yield decoder.decode(bytes, { stream: true });
        }
        // Abschluss des Decoders (gibt alle gepufferten, verbleibenden Zeichen aus)
        yield decoder.decode(); 
    }

    /**
     * Liefert vollständige Zeilen (mit Pufferung unvollständiger Zeilen über Chunks hinweg).
     * @returns {AsyncGenerator<string>}
     */
    async * lines() {
        let line = '';
        for await (const chars of this.chars()) {
            let parts = this.splitLines(chars);
            
            // Der erste Teil des neuen Chunks wird zum aktuellen Zeilenpuffer hinzugefügt
            line += parts[0]; 

            // Wenn es mehr als einen Teil gibt, haben wir mindestens eine vollständige Zeile/n
            if (parts.length > 1) {
                // Gib die aufgebaute Zeile und alle vollständigen Zwischenzeilen zurück
                yield line;
                yield* parts.slice(1, -1);
                
                // Der letzte Teil ist die neue unvollständige Zeile (der Puffer für den nächsten Chunk)
                line = parts.slice(-1)[0];
            }
        }
        // Gib die letzte gepufferte Zeile zurück (falls sie nicht leer ist)
        if (line.length > 0) {
            yield line;
        }
    }
}












/**
 * Ergänzt das Asynchrone Iteratoren Protokoll zu einem ReadableStream,
 * indem der getReader().read() Mechanismus in den Iterator verpackt wird.
 *
 * @param {ReadableStream} stream 
 * @returns {ReadableStream} Der erweiterte Stream.
 */
function makeReadableStreamAsyncIterable(stream) {
    // Wenn das Protokoll bereits vorhanden ist (z.B. in Node.js), wird der Stream unverändert zurückgegeben.
    if (stream[Symbol.asyncIterator]) {
        return stream;
    }

    stream[Symbol.asyncIterator] = async function* () {
        const reader = stream.getReader();
        try {
            while (true) {
                // Polling-Mechanismus: wartet auf den nächsten Chunk
                const { done, value } = await reader.read();
                
                if (done) {
                    return; // Stream beendet
                }
                
                yield value;
            }
        } finally {
            // Wichtig: Stellt sicher, dass der Reader bei normaler Beendigung oder Fehler freigegeben wird.
            reader.releaseLock();
        }
    };
    return stream;
}