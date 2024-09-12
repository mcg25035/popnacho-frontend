class NetworkException extends Error {
    constructor(message) {
        super(message);
        this.name = 'NetworkException';
    }
}