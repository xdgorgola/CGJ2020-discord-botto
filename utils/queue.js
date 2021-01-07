const fs = require('fs');

module.exports = class FileWritingQueue {
    constructor (filePath) {
        this.filePath = filePath;
        this.queue = []
    }

    peek () {
        if (this.queue.length === 0)
            return undefined;
        
        return this.queue[0];
    }

    dequeue () {
        if (this.queue.length === 0)
            return undefined;
        
        return this.queue.shift();
    }

    async writeNext () {
        if (this.queue.length === 0)
            return;

        await fs.promises.writeFile(this.filePath, this.peek(), 'utf-8')(err => {throw err});
        this.dequeue();
        this.writeNext();
    }

    queueToWrite (toEnqueue) {
        this.queue.push(toEnqueue);
        
        if (this.length === 1)
            this.writeNext();
    }
}