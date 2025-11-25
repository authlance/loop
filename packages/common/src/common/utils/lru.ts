
class Node<T> {
    item: T;
    next?: Node<T>;
    prev?: Node<T>;
}

export class LinkedList<T> implements Iterable<T> {
    private n: number;
    private first?: Node<T>;
    private last?: Node<T>;
    private nodes: Map<T, Node<T>> = new Map();

    constructor() {
        this.first = undefined;
        this.last = undefined;
        this.n = 0;
    }
    isEmpty(): boolean {
        return this.first === undefined;
    }
    size(): number {
        return this.n;
    }
    peek(): T | undefined {
        if (this.first) {
            return this.first.item;
        }
    }
    getLast(): T | undefined {
        if (this.last) {
            return this.last.item;
        }
    }
    push(item: T): void {
        const oldLast = this.last;
        this.last = new Node();
        this.last.item = item;
        this.last.prev = oldLast;
        this.last.next = undefined;
        if (this.isEmpty()) {
            this.first = this.last;
        } else if (oldLast) {
            oldLast.next = this.last;
        }
        this.nodes.set(item, this.last);
        this.n++;
    }
    addFirst(item: T): void {
        const currentSize = this.size();
        if (currentSize === 0) {
            this.push(item);
            return;
        }
        if (this.contains(item)) {
            this.remove(item);
        }
        const oldFirst = this.first;
        this.first = new Node();
        this.first.item = item;
        this.first.next = oldFirst;
        if (oldFirst) {
            oldFirst.prev = this.first;
        }
        this.nodes.set(item, this.first);
        this.n++;
    }
    remove(item: T): void {
        const node = this.nodes.get(item);
        if (node) {
            if (this.first === node && this.last === node) {
                this.first = undefined;
                this.last = undefined;
            } else if (this.first === node) { 
                this.first = node.next;
            } else if (node.prev) {
                if (this.last === node) {
                    this.last = node.prev;
                }
                node.prev.next = node.next;
                if (node.next) {
                    node.next.prev = node.prev;
                }
            }
            this.n--;
            this.nodes.delete(item);
        }
    }
    markAccessed(item: T): void {
        this.remove(item);
        this.addFirst(item);
    }
    contains(item: T): boolean {
        return this.nodes.has(item);
    }
    poll(): T | undefined {
        if (this.isEmpty() || !this.first) {
            return undefined;
        }
        const item = this.first.item;
        this.first = this.first.next;
        this.n--;
        if (this.isEmpty()) {
            this.last = undefined;
        }
        this.nodes.delete(item);
        return item;
    }
    [Symbol.iterator](): Iterator<T> {
        if (this.isEmpty()) {
            const iterator:  Iterator<T> = {
                next: () => {
                    return {
                        done: true,
                        value: undefined
                    };
                }
            };
            return iterator;
        }
        let current: Node<T> | undefined = this.first;
        const iterator:  Iterator<T> = {
            next: () => {
                if (!current) {
                    return {
                        done: true,
                        value: undefined
                    };
                }
                const nValue: T = current.item;
                current = current?.next;
                return {
                    done: nValue === undefined,
                    value: nValue
                };
            }
        };
        return iterator;
    }

}