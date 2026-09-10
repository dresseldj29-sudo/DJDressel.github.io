import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


import {
    firebaseConfig,
    OWNER_EMAIL
} from "./firebase-config.js";


// ==========================================
// FIREBASE STARTEN
// ==========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ==========================================
// ELEMENTE
// ==========================================

const serverStatus =
    document.getElementById("serverStatus");

const playerCount =
    document.getElementById("playerCount");

const serverDomain =
    document.getElementById("serverDomain");

const serverVersion =
    document.getElementById("serverVersion");

const socialLinks =
    document.getElementById("socialLinks");


// ==========================================
// STANDARD-DATEN
// ==========================================

const defaultServer = {

    domain: "play.deinserver.de",

    version: "1.21.x",

    players: 0,

    status: "online"

};


const defaultSocial = {

    youtube: "",

    tiktok: "",

    discord: ""

};


// ==========================================
// SERVERDATEN LADEN
// ==========================================

async function loadServer() {

    try {

        const reference =
            doc(db, "website", "server");

        const snapshot =
            await getDoc(reference);


        let data;


        if (snapshot.exists()) {

            data = snapshot.data();

        } else {

            data = defaultServer;

            await setDoc(reference, data);

        }


        serverDomain.textContent =
            data.domain;

        serverVersion.textContent =
            data.version;

        playerCount.textContent =
            data.players;


        serverStatus.className =
            "status " + data.status;


        if (data.status === "online") {

            serverStatus.textContent =
                "🟢 ONLINE";

        }

        else if (data.status === "offline") {

            serverStatus.textContent =
                "🔴 OFFLINE";

        }

        else {

            serverStatus.textContent =
                "🟠 WARTUNG";

        }


        // Owner-Felder

        const domain =
            document.getElementById("adminDomain");

        const version =
            document.getElementById("adminVersion");

        const players =
            document.getElementById("adminPlayers");

        const status =
            document.getElementById("adminStatus");


        if (domain) domain.value =
            data.domain;

        if (version) version.value =
            data.version;

        if (players) players.value =
            data.players;

        if (status) status.value =
            data.status;


    } catch (error) {

        console.error(error);

        serverDomain.textContent =
            "Fehler beim Laden";

    }

}


// ==========================================
// SOCIAL LINKS LADEN
// ==========================================

async function loadSocial() {

    const reference =
        doc(db, "website", "social");

    const snapshot =
        await getDoc(reference);


    let data;


    if (snapshot.exists()) {

        data = snapshot.data();

    } else {

        data = defaultSocial;

        await setDoc(reference, data);

    }


    socialLinks.innerHTML = "";


    if (data.youtube) {

        socialLinks.innerHTML += `

            <a
                class="social-card"
                href="${data.youtube}"
                target="_blank"
            >

                <div class="social-icon">
                    ▶️
                </div>

                <h3>YouTube</h3>

                <p>
                    Unsere YouTube-Kanäle
                </p>

            </a>

        `;

    }


    if (data.tiktok) {

        socialLinks.innerHTML += `

            <a
                class="social-card"
                href="${data.tiktok}"
                target="_blank"
            >

                <div class="social-icon">
                    🎵
                </div>

                <h3>TikTok</h3>

                <p>
                    Unsere TikTok-Kanäle
                </p>

            </a>

        `;

    }


    if (data.discord) {

        socialLinks.innerHTML += `

            <a
                class="social-card"
                href="${data.discord}"
                target="_blank"
            >

                <div class="social-icon">
                    💬
                </div>

                <h3>Discord</h3>

                <p>
                    Unser Discord Server
                </p>

            </a>

        `;

    }


    const youtube =
        document.getElementById("adminYoutube");

    const tiktok =
        document.getElementById("adminTiktok");

    const discord =
        document.getElementById("adminDiscord");


    if (youtube)
        youtube.value = data.youtube || "";


    if (tiktok)
        tiktok.value = data.tiktok || "";


    if (discord)
        discord.value = data.discord || "";

}


// ==========================================
// LOGIN
// ==========================================

const loginButton =
    document.getElementById("loginButton");


loginButton.addEventListener(
    "click",
    async () => {

        const email =
            document.getElementById("loginEmail")
                .value
                .trim();


        const password =
            document.getElementById("loginPassword")
                .value;


        const message =
            document.getElementById("loginMessage");


        if (!email || !password) {

            message.textContent =
                "Bitte E-Mail und Passwort eingeben.";

            return;

        }


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            message.textContent =
                "Login erfolgreich!";


        } catch (error) {

            console.error(error);

            message.textContent =
                "Login fehlgeschlagen.";

        }

    }
);


// ==========================================
// LOGIN STATUS
// ==========================================

onAuthStateChanged(
    auth,
    async (user) => {

        const ownerPanel =
            document.getElementById("ownerPanel");


        if (!user) {

            ownerPanel.classList.add("hidden");

            return;

        }


        if (
            user.email.toLowerCase()
            !== OWNER_EMAIL.toLowerCase()
        ) {

            await signOut(auth);

            alert(
                "Dieser Account ist kein Owner."
            );

            return;

        }


        ownerPanel.classList.remove(
            "hidden"
        );


        document
            .getElementById("owner")
            .scrollIntoView();


        loadAdminWishes();

    }
);


// ==========================================
// SERVER SPEICHERN
// ==========================================

document
    .getElementById("saveServer")
    .addEventListener(
        "click",
        async () => {

            const data = {

                domain:
                    document
                    .getElementById("adminDomain")
                    .value
                    .trim(),

                version:
                    document
                    .getElementById("adminVersion")
                    .value
                    .trim(),

                players:
                    Number(
                        document
                        .getElementById("adminPlayers")
                        .value
                    ),

                status:
                    document
                    .getElementById("adminStatus")
                    .value

            };


            await setDoc(
                doc(
                    db,
                    "website",
                    "server"
                ),
                data
            );


            await loadServer();


            alert(
                "Serverdaten gespeichert!"
            );

        }
    );


// ==========================================
// SOCIAL LINKS SPEICHERN
// ==========================================

document
    .getElementById("saveSocial")
    .addEventListener(
        "click",
        async () => {

            const data = {

                youtube:
                    document
                    .getElementById("adminYoutube")
                    .value
                    .trim(),

                tiktok:
                    document
                    .getElementById("adminTiktok")
                    .value
                    .trim(),

                discord:
                    document
                    .getElementById("adminDiscord")
                    .value
                    .trim()

            };


            await setDoc(
                doc(
                    db,
                    "website",
                    "social"
                ),
                data
            );


            await loadSocial();


            alert(
                "Social Links gespeichert!"
            );

        }
    );


// ==========================================
// WUNSCH ABSENDEN
// ==========================================

document
    .getElementById("sendWish")
    .addEventListener(
        "click",
        async () => {

            const name =
                document
                .getElementById("wishName")
                .value
                .trim();


            const wish =
                document
                .getElementById("wishText")
                .value
                .trim();


            const message =
                document
                .getElementById("wishMessage");


            if (!name || !wish) {

                message.textContent =
                    "Bitte Name und Wunsch eingeben.";

                return;

            }


            try {

                await addDoc(
                    collection(
                        db,
                        "wishes"
                    ),
                    {

                        name: name,

                        wish: wish,

                        created:
                            Date.now()

                    }
                );


                document
                    .getElementById("wishName")
                    .value = "";


                document
                    .getElementById("wishText")
                    .value = "";


                message.textContent =
                    "✅ Dein Wunsch wurde abgeschickt!";


            } catch (error) {

                console.error(error);

                message.textContent =
                    "Fehler beim Absenden.";

            }

        }
    );


// ==========================================
// OWNER WÜNSCHE LADEN
// ==========================================

async function loadAdminWishes() {

    const container =
        document.getElementById(
            "adminWishes"
        );


    container.innerHTML =
        "Wünsche werden geladen...";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "wishes"
                )
            );


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>Noch keine Wünsche vorhanden.</p>";

            return;

        }


        snapshot.forEach(
            (wishDocument) => {

                const data =
                    wishDocument.data();


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "wish-admin";


                item.innerHTML = `

                    <strong>
                        👤 ${escapeHTML(data.name)}
                    </strong>

                    <p>
                        ${escapeHTML(data.wish)}
                    </p>

                    <button
                        class="delete-wish"
                        data-id="${wishDocument.id}"
                    >
                        🗑️ Löschen
                    </button>

                `;


                container.appendChild(item);

            }
        );


        document
            .querySelectorAll(".delete-wish")
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const id =
                                button.dataset.id;


                            await deleteDoc(
                                doc(
                                    db,
                                    "wishes",
                                    id
                                )
                            );


                            loadAdminWishes();

                        }
                    );

                }
            );


    } catch (error) {

        console.error(error);

        container.innerHTML =
            "Fehler beim Laden der Wünsche.";

    }

}


// ==========================================
// SICHERHEIT FÜR WÜNSCHE
// ==========================================

function escapeHTML(text) {

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ==========================================
// AUSLOGGEN
// ==========================================

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        async () => {

            await signOut(auth);

            location.reload();

        }
    );


// ==========================================
// SERVER KOPIEREN
// ==========================================

document
    .getElementById("copyServer")
    .addEventListener(
        "click",
        async () => {

            const domain =
                serverDomain.textContent;


            if (
                !domain ||
                domain.includes("Fehler") ||
                domain.includes("geladen")
            ) {

                return;

            }


            await navigator.clipboard.writeText(
                domain
            );


            alert(
                "Server-Adresse kopiert!"
            );

        }
    );


// ==========================================
// START
// ==========================================

loadServer();

loadSocial();
