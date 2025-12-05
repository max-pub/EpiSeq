import { Thread } from './ext/bundle.js'

// export class Progress {
//     percent = 0

//     constructor(total, text = '') {
//         this.total = total
//         this.text = text
//     }
//     update(done) {
//         let percent = (done / this.total * 100).toFixed(0) * 1
//         if (percent == this.percent) return
//         Thread.post.progress(percent, 100, this.text)
//         this.percent = percent
//     }
// }


export function postProgress(text = '') {
    let lastPercentage = 0
    // console.log('postProgress initialized:', text)
    Thread.post.showProgress(true, text)
    return (done, total) => {
        let percent = (done / total * 100).toFixed(0) * 1
        if (percent == lastPercentage) return
        // console.log('progress', percent, text)
        Thread.post.updateProgress(percent, 100)
        lastPercentage = percent
        // Thread.post.progress(done, total, text)
    }
}