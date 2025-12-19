export async function loadHTML(querySelector, url) {
    const response = await fetch(url);
    const html = await response.text();
    // console.log('loaded HTML from', url, 'into', querySelector);
    for (let x of document.querySelectorAll(querySelector)) {
        x.innerHTML = html
    }
}