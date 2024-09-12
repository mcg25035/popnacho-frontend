import axios from "axios";

export class accountApi{
    static uid;
    static loginToken;
    static sessionAuthed = false;

    /** @returns {void} */
    static syncToLocalStorage() {
        localStorage.setItem("uid", this.uid);
        localStorage.setItem("loginToken", this.loginToken);
    }

    /** @returns {void} */
    static syncFromLocalStorage() {
        this.uid = localStorage.getItem("uid");
        this.loginToken = localStorage.getItem("loginToken");
    }

    /** @returns {boolean} */
    static isLocalStorageLoggedIn() {
        return (!!localStorage.getItem("uid") && (!!localStorage.getItem("loginToken")));
    }

    /**
     *  @throws {NetworkException}
     *  @returns {void}
     */
    static async initNewUeser() {
        var res = await axios.post("/api/user");
        if (res.status != 200) {
            throw new NetworkException(`Failed to create new user, network error ${res.status}`);
        }
        var data = res.data;
        this.uid = data.uid;
        this.loginToken = data.login_token;
        accountApi.syncToLocalStorage();
    }

    /**
     * @throws {NetworkException}
     * @returns {void}
     */
    static async keepSessionAlive() {
        accountApi.sessionAuthed = false;
        if (await this.checkSession()) {
            return;
        }
        if (await this.authSession()) {
            accountApi.sessionAuthed = true;
            return;
        }
    }

    /**
     *  @throws {NetworkException}
     *  @returns {boolean}
     */
    static async checkSession() {
        var res = await axios.get("/api/session");
        if (res.status == 200) return true;
        if (res.status == 401) return false;
        throw new NetworkException(`Failed to check session, network error ${res.status}`);
    }

    /**
     *  @throws {NetworkException} 
     *  @returns {boolean} 
     */
    static async authSession() {
        var res = await axios.put("/api/session", {
            uid: this.uid,
            login_token: this.loginToken
        });
        if (res.status == 200) return true;
        if (res.status == 401) return false;
        throw new NetworkException(`Failed to auth session, network error ${res.status}`);
    }

    static async init() {
        axios.defaults.withCredentials = true;

        if (!this.isLocalStorageLoggedIn()) {
            await this.initNewUeser();
        }
        this.syncFromLocalStorage();

        await this.keepSessionAlive();
        if (!accountApi.sessionAuthed) {
            await this.initNewUeser();
            await this.keepSessionAlive();
        }
        
        if (!accountApi.sessionAuthed) {
            throw new ServiceException("Backend serivce has some problem, failed to auth session");
        }

        

    }
}