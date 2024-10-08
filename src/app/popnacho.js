import { useEffect, useRef, useState } from "react";
import styles from "./popnacho.module.css";
import { AccountApi } from "./AccountApi";
import TransferPrompt from "./transferPrompt";

var countGlobal;

/**
 * @param {Function} setClickCount 
 * @param {MutableRefObject<HTMLElement>} nacho
 * @param {MutableRefObject<HTMLParagraphElement>} dataView
 */
function initialize(setClickCount, nacho, dataView) {
    var sound = new Sound();
    var nacho = new Nacho(nacho);

    var count = Utils.cookieLoadCount();
    if (count > 0) {
        setClickCount(count);
    }

    var start = Utils.isMobile() ? "touchstart" : "mousedown";
    var end = Utils.isMobile() ? "touchend" : "mouseup";

    document.addEventListener(start, async function (event) {
        /** @type {HTMLParagraphElement} */
        var dataViewElement = dataView.current;
        if (dataViewElement.contains(event.target)) return;

        nacho.open();
        sound.playPop();
        setClickCount(++countGlobal);
        console.log("add click");
        if (countGlobal % 100 == 0) {
            sound.playHmm();
        }
        if (countGlobal % 10 === 0) {
            await AccountApi.addClick(10);
        }

    });

    document.addEventListener(end, function (event) {
        nacho.close();
    });
}



class TransferIdManager {
    /** @type {Function} */
    setTransferIdButtonShow;

    /** @type {Function} */
    setTransferId;

    constructor(setTransferIdButtonShow, setTransferId) {
        this.setTransferIdButtonShow = setTransferIdButtonShow;
        this.setTransferId = setTransferId;
    }

    /** @private */
    async generate() {
        var transferId = await AccountApi.getTransferId();
        this.setTransferId(transferId);
    }

    /** @param {import("react").SyntheticEvent} event */
    generateTrigger(event) {
        this.setTransferIdButtonShow(false);
        this.generate();
    }
}

export default function PopNachoPage() {
    var [clickCount, setClickCount] = useState(0);
    var [uidView, setUidView] = useState("");
    var [transferId, setTransferId] = useState("generating...");
    var [transferIdButtonShow, setTransferIdButtonShow] = useState(true);
    var [transferPromptShow, setTransferPromptShow] = useState(false);
    var initialized = useRef(false);
    var tim = new TransferIdManager(setTransferIdButtonShow, setTransferId);

    var dataView = useRef();
    var nacho = useRef();
    
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        initialize(setClickCount, nacho, dataView);
    }, []);

    useEffect(() => {
        var fetchUidTask = async () => {
            await AccountApi.init();
            setUidView(AccountApi.uid);
            var count = await AccountApi.getClickCount();
            if (count != 0) {
                setClickCount(count);
                return;
            }
            
            var countFromCookie = Utils.cookieLoadCount();
            if (countFromCookie == 0) return;

            await AccountApi.addClick(countFromCookie);
            Utils.cookieSaveCount(0);
        }
        fetchUidTask();
    }, [])

    useEffect(() => {
        countGlobal = clickCount;
    }, [clickCount]);
        

    function toggleTransferPrompt() {
        setTransferPromptShow(!transferPromptShow);
    }

    /**
     * @param {String} uid 
     * @param {String} transferId 
     */
    async function transfer(uid, transferId) {
        var transferResult = await AccountApi.transferUser(uid, transferId);
        setTransferIdButtonShow(true);
        setUidView(transferResult.uid);
        setTransferPromptShow(false);
    }

    return (
        <>
            <p ref={dataView} className={styles['user-data']}>
                {`UID : ${uidView}`}<br />
                {'Transfer ID : '}
                {transferIdButtonShow && 
                 <button onClick={tim.generateTrigger.bind(tim)} className={styles['generate-transfer-id']}>
                    Show
                 </button>}
                {!transferIdButtonShow && transferId}<br />
                <button onClick={toggleTransferPrompt} className={styles['accept-transfer-button']}>
                    Transfer {transferPromptShow ? "▲" : "▼"}
                </button>
                {transferPromptShow && <TransferPrompt acceptCallback={transfer} />}
            </p>
            <div className={styles['number-container']}>
                <p className={styles['click-count']}>
                    {clickCount}
                </p>
            </div>
            <div className={styles['nacho-container']}>
                <div ref={nacho} className={styles['nacho']} />
            </div>
        </>
    );
}

class Nacho {
    /** @type {MutableRefObject<HTMLElement>}*/
    nacho;

    /** @param {MutableRefObject<HTMLElement>} nacho */
    constructor(nacho) {
        this.nacho = nacho;
        this.close();
    }
    
    open() {
        this.nacho.current.classList.remove(styles['close']);
        this.nacho.current.classList.add(styles['open']);
    }

    close() {
        this.nacho.current.classList.remove(styles['open']);
        this.nacho.current.classList.add(styles['close']);
    }
}

class Sound {
    /** @type {Array<Audio>} */
    hmmSounds = [];
    /** @type {Array<Audio>} */
    popSounds = [];

    constructor() {
        for (var i = 1; i <= 5; i++) {
            var popSound = new Audio(`/pop${i}.mp3`);
            this.popSounds.push(popSound);
            if (i > 3) continue;
            var hmmSound = new Audio(`/hmm${i}.mp3`);
            this.hmmSounds.push(hmmSound);
        }
    }

    playHmm () {
        var randomIndex = Math.floor(Math.random() * this.hmmSounds.length);
        this.hmmSounds[randomIndex].play();
    }

    playPop() {
        var randomIndex = Math.floor(Math.random() * this.popSounds.length);
        this.popSounds[randomIndex].play();
    }

}

class Utils {
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    }

    /** @param {Number} count */
    static cookieSaveCount(count) {
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 100);
        document.cookie = `count=${count}; expires=${expirationDate.toUTCString()}; path=/`;
    }

    /** @returns {Number} */
    static cookieLoadCount() {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (!cookie.startsWith("count=")) continue;

            var count = parseInt(cookie.substring(6));
            return count;
        }
        return 0;
    }
}