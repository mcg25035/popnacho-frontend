export class TransferException extends Error {
    constructor(message) {
        super(message);
        this.name = 'TransferException';
    }
}