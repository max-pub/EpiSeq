export function download(filename, data, type = 'text/tab-separated-values') {
    let blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a1 = document.createElement('a');
    a1.href = url;
    a1.download = filename || 'download';
    a1.click();
    a1.remove();
    return a1;
}