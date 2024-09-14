import axios from "axios";
import { ServiceException } from "./exceptions/ServiceException";
import { NetworkException } from "./exceptions/NetworkException";


const apiPath = "http://localhost:8080"

export class AccountApi{
    static uid;
    static loginToken;
    static sessionAuthed = false;

    /** @returns {void} */
    static syncToLocalStorage() {
        localStorage.setItem("uid", AccountApi.uid);
        localStorage.setItem("loginToken", AccountApi.loginToken);
    }

    /** @returns {void} */
    static syncFromLocalStorage() {
        AccountApi.uid = localStorage.getItem("uid");
        AccountApi.loginToken = localStorage.getItem("loginToken");
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
        var res = await axios.post(`${apiPath}/user`);
        if (res.status != 200) {
            throw new NetworkException(`Failed to create new user, network error ${res.status}`);
        }
        var data = res.data;
        AccountApi.uid = data.uid;
        AccountApi.loginToken = data.login_token;
        AccountApi.syncToLocalStorage();
    }

    /**
     * @throws {NetworkException}
     * @returns {void}
     */
    static async keepSessionAlive() {
        AccountApi.sessionAuthed = false;
        if (await AccountApi.checkSession()) {
            AccountApi.sessionAuthed = true;
            return;
        }
        if (await AccountApi.authSession()) {
            AccountApi.sessionAuthed = true;
            return;
        }
    }

    /**
     *  @throws {NetworkException}
     *  @returns {boolean}
     */
    static async checkSession() {
        var res = await axios.get(`${apiPath}/session`);
        if (res.status == 200) return true;
        if (res.status == 401) return false;
        throw new NetworkException(`Failed to check session, network error ${res.status}`);
    }

    /**
     *  @throws {NetworkException} 
     *  @returns {boolean} 
     */
    static async authSession() {
        var res = await axios.put(`${apiPath}/session`, {
            uid: AccountApi.uid,
            login_token: AccountApi.loginToken
        });
        if (res.status == 200) return true;
        if (res.status == 401) return false;
        throw new NetworkException(`Failed to auth session, network error ${res.status}`);
    }

    static async init() {
        axios.defaults.withCredentials = true;
        axios.defaults.validateStatus = () => true;

        if (!AccountApi.isLocalStorageLoggedIn()) {
            await AccountApi.initNewUeser();
        }
        AccountApi.syncFromLocalStorage();

        await AccountApi.keepSessionAlive();
        if (!AccountApi.sessionAuthed) {
            await AccountApi.initNewUeser();
            await AccountApi.keepSessionAlive();
        }

        if (!AccountApi.sessionAuthed) {
            throw new ServiceException("Backend serivce has some problem, failed to auth session");
        }
    }
}