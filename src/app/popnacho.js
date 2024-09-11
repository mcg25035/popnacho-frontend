import { useEffect, useRef, useState } from "react";
import styles from "./popnacho.module.css";

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
            if (cookie.startsWith("count=")) {
                var count = parseInt(cookie.substring(6));
                return count;
            }
        }
        return 0;
    }
}

/**
 * @param {Number} clickCount 
 * @param {Function} setClickCount 
 * @param {MutableRefObject<HTMLElement>} nacho
 */
function initialize(clickCount, setClickCount, nacho) {
    var sound = new Sound();
    var nacho = new Nacho(nacho);

    var count = Utils.cookieLoadCount();
    if (count > 0) {
        setClickCount(count);
        clickCount = count;
    }

    var start = Utils.isMobile() ? "touchstart" : "mousedown";
    var end = Utils.isMobile() ? "touchend" : "mouseup";

    document.addEventListener(start, function (event) {
        nacho.open();
        sound.playPop();
        setClickCount(++clickCount);
        if (clickCount % 100 == 0) {
            sound.playHmm();
        }
        if (clickCount % 10 === 0) {
            Utils.cookieSaveCount(clickCount);
        }

    });

    document.addEventListener(end, function (event) {
        nacho.close();
    });
}

export default function PopNachoPage() {
    var [clickCount, setClickCount] = useState(0);
    var [uidView, setUidView] = useState("");
    var initialized = useRef(false);

    var nacho = useRef();
    
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        initialize(clickCount, setClickCount, nacho);
    }, []);

    return (
        <>
            <p className={styles['user-info-uid']}>
                {`UID : ${uidView}`}
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
