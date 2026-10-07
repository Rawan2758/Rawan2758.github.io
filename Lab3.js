document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");

    // 1. SELECT DOM ELEMENTS
    const frame1 = document.getElementById("frame1");
    const frame2 = document.getElementById("frame2");
    const frame3 = document.getElementById("frame3");

    const caption1 = document.getElementById("caption1");
    const caption2 = document.getElementById("caption2");
    const caption3 = document.getElementById("caption3");

    const storyTitle = document.getElementById("story-title");
    const btnSeqA = document.getElementById("seqA-btn");
    const btnSeqB = document.getElementById("seqB-btn");

    // 2. STORE IMAGE FILE PATHS IN VARIABLES
    let imgReading = "img1.jpeg";
    let imgWalking = "img2.jpeg";
    let imgBread = "img3.jpeg";

    // 3. DEFINE FUNCTIONS
    function showSequenceA() {
        console.log("Sequence A button clicked!");

        if (storyTitle) storyTitle.innerHTML = "Sequence A: A Day in Jerusalem";

        if (frame1 && frame2 && frame3) {
            frame1.src = imgReading;
            frame2.src = imgWalking;
            frame3.src = imgBread;
        }

        if (caption1 && caption2 && caption3) {
            caption1.innerHTML = "1. Morning reading and praying.";
            caption2.innerHTML = "2. Walk through the old city.";
            caption3.innerHTML = "3. Buying fresh bread.";
        }

        if (btnSeqA && btnSeqB) {
            btnSeqA.classList.add("active");
            btnSeqB.classList.remove("active");
        }
    }

    function showSequenceB() {
        console.log("Sequence B button clicked!");

        if (storyTitle) storyTitle.innerHTML = "Sequence B: An Early Morning Breakfast Run";

        if (frame1 && frame2 && frame3) {
            frame1.src = imgBread;
            frame2.src = imgWalking;
            frame3.src = imgReading;
        }

        if (caption1 && caption2 && caption3) {
            caption1.innerHTML = "1. Buying fresh bread early.";
            caption2.innerHTML = "2. Walking to Mosque.";
            caption3.innerHTML = "3. Reading and eating.";
        }

        if (btnSeqA && btnSeqB) {
            btnSeqB.classList.add("active");
            btnSeqA.classList.remove("active");
        }
    }

    // 4. ATTACH EVENT LISTENERS
    if (btnSeqA) {
        btnSeqA.addEventListener("click", showSequenceA);
    } else {
        console.error("Could not find element with id 'seqA-btn'");
    }

    if (btnSeqB) {
        btnSeqB.addEventListener("click", showSequenceB);
    } else {
        console.error("Could not find element with id 'seqB-btn'");
    }

    // Initialize default view
    showSequenceA();
});