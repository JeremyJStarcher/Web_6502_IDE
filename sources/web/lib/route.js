const makeOnloadState = (action, value) => {
    const state = {};
    state[action] = value;

    history.pushState(state, null, window.location.href);
    history.pushState(state, null, window.location.href);
}

const onload = function () {
    showSection("main");
    return;

    hideAllSections();

    // Check if this is a reload, in which case you are already on a slide.
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("section")) {
        const section = urlParams.get("section");
        makeOnloadState("section", section);
        showSection(section);
    } else {
        const defaultSection = "main";
        makeOnloadState("section", defaultSection);
        showSection(defaultSection);
    }
}

// Fires when the user goes back or forward in the history.
window.onpopstate = function (e) {
    const section = e.state && e.state.section;
    const routesToSkip = ["filelist"];

    if (section) {
        if (routesToSkip.includes(section)) {
            this.history.back();
            return;
        }
        showSection(section);
    }
}

// Wire up the section handling too
const hideAllSections = () => {
    const sections = document.querySelectorAll("section");
    Array.from(sections).forEach(section => {
        section.style.display = "none";
    })
};

const showSection = (sectionId => {
    hideAllSections();
    const selector = `section[data-section-id='${sectionId}']`;
    const el = document.querySelector(selector);
    el.style.display = "";
});

const gotoSection = (section) => {
    if (section) {
        const state = {
            "section": section,
        };

        history.pushState(state, null, "/?section=" + section);
        showSection(section);
    }

};

document.body.addEventListener("click", (event) => {
    const t = event.target;
    if (t.dataset.goto) {
       // gotoSection(t.dataset.goto);
       showSection(t.dataset.goto);
    }
});

export default {
    onload,
    hideAllSections,
    gotoSection,
};