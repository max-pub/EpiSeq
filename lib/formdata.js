/**
 * Extracts form data, strictly enforcing specific output types.
 * - Checkboxes/Multi-Selects always return string[].
 * - Input type="number" returns number (or null).
 * - All others return string.
 * @param {HTMLFormElement} form The form element.
 * @returns {Object<string, (string|number|string[]|null)>} The extracted data.
 */
export function formExtractor(form) {
    if (!(form instanceof HTMLFormElement)) return {};

    const formData = new FormData(form);
    const result = {};
    
    // Create a set of all unique names that submitted data
    const submittedKeys = new Set(formData.keys());
    
    // Use the form.elements collection for efficient DOM lookup based on name
    const elements = Array.from(form.elements).filter(e => e.name);

    for (const key of submittedKeys) {
        const allValues = formData.getAll(key);
        const element = elements.find(e => e.name === key);
        
        // Safety check (should always find element if key is in submittedKeys)
        if (!element) {
            result[key] = allValues.length > 1 ? allValues : allValues[0];
            continue;
        }
        
        const tagName = element.tagName.toUpperCase();
        const type = element.type ? element.type.toLowerCase() : '';

        // --- 1. Force Array for Multi-Selects (Checkboxes & Select Multiple) ---
        // if (type === 'checkbox' || (tagName === 'SELECT' && element.multiple)) {
        //     result[key] = allValues; 
        // } 
        

        if (type === 'checkbox') {
            // Find all checkboxes with this name
            const allCheckboxes = elements.filter(e => e.name === key && e.type === 'checkbox');
            
            // A. Multiple Checkboxes OR Checkbox with Value (returns array of values)
            // e.g., <input type="checkbox" name="CS" value="room">
            // This also covers checkboxes that default to value="on" but are part of a group.
            if (allValues.length > 1 || element.value !== 'on' || allCheckboxes.length > 1) {
                 result[key] = allValues; 
            } 
            // B. Single, Valueless Checkbox (returns true/false)
            // e.g., <input type="checkbox" name="room" checked>
            else if (allCheckboxes.length === 1 && allCheckboxes[0].value === 'on') { 
                // Since we are in the submittedKeys loop, it must be checked (TRUE)
                result[key] = true;
            } else {
                 result[key] = allValues[0];
            }
        } 
        
        // C. Select Multiple Handling (Original Logic)
        else if (tagName === 'SELECT' && element.multiple) {
            result[key] = allValues;
        }


        // --- 2. Force Number for input[type="number"] ---
        else if (type === 'number') {
            const rawValue = allValues[0];
            const numValue = parseFloat(rawValue);
            result[key] = (rawValue === '' || isNaN(numValue)) ? null : numValue;
        }

        // --- 3. Default to Single String Value ---
        else {
            result[key] = allValues[0];
        }
    }

    return result;
}




// const checkboxData = form => {
//     let values = {}
//     for (let checkbox of form.$$('input[type="checkbox"]')) {
//         values[checkbox.name] ??= []
//         if (checkbox.checked) {
//             values[checkbox.name].push(checkbox.value)
//         }
//     }
//     return values
// }
// const formData = form => ({
//     ...Object.fromEntries(new FormData(form)),
//     ...checkboxData(form),
//     // ...Object.fromEntries(form.$$('input[type="checkbox"]').map(x => [x.name, x.value]))
// })