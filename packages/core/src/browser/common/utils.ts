export class Debouncer {
    
    private debounceTimeout: string | number | NodeJS.Timeout | undefined

    constructor(private callback: () => void, private timeout = 500) {
    }

    public debounce() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = undefined;
        }
        this.debounceTimeout = setTimeout(() => {
            this.callback();
        }, this.timeout);
    }

    public cancelAndReplaceCallback(callback: () => void) {
        this.callback = callback;
        this.debounce();
    }
}