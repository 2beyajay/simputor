window.addEventListener('DOMContentLoaded', (event) => {

});

var firebaseConfig = {
    apiKey: "AIzaSyBa4bXMvkUtbHiYEubr5StWzXKHxxWjZ5M",
    authDomain: "crunchy-sim.firebaseapp.com",
    databaseURL: "https://crunchy-sim.firebaseio.com",
    projectId: "crunchy-sim",
    storageBucket: "crunchy-sim.appspot.com",
    messagingSenderId: "295858081829",
    appId: "1:295858081829:web:4adff1a02b1408c9e52fcc",
    measurementId: "G-0DSW1GHFDC"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let ref = firebase.database().ref('/');

let allData;
let select0 = document.querySelector('#select0');
let select1 = document.querySelector('#select1');

let select = document.querySelectorAll(".select");


ref.once('value', (snapshot) => {
    allData = snapshot.val();

    for (const franchises in allData) {
        // getting the franchise names
        let franchiseLi = document.createElement('li');
        franchiseLi.classList.add('oneFranchise');
        let franchiseA = document.createElement('a'); //creating the franchise anchor
        franchiseA.href = "#";
        franchiseA.innerText = franchises; //setting the anchor text
        franchiseLi.appendChild(franchiseA);

        let characterUl = document.createElement('ul'); //creating the character UL
        franchiseLi.appendChild(characterUl);
        characterUl.classList.add('vertical', 'nested', 'menu');

        let characters = allData[franchises];
        for (const chars in characters) {
            // getting the character names
            let characterLi = document.createElement('li');
            characterLi.classList.add('oneCharacter');
            characterUl.appendChild(characterLi);

            let characterA = document.createElement('a'); //creating the character anchor
            characterA.href = "#";
            characterA.innerText = chars;
            characterLi.appendChild(characterA);

            let formUl = document.createElement('ul');
            formUl.classList.add('vertical', 'nested', 'menu');
            characterLi.appendChild(formUl);

            let forms = characters[chars];
            for (const frms in forms) {
                let oneFormContent = `<li class="oneForm" data-franchise="${franchises}" data-character="${chars}" data-form="${frms}">
                                        <a href="#">${frms}</a>
                                    </li>`
                formUl.innerHTML += oneFormContent;
            }
        }

        select0.appendChild(franchiseLi);

        
    }
    
    select1.innerHTML = select0.innerHTML

    
    let allForms = document.querySelectorAll('.oneForm');
    allForms.forEach(form => {
        form.addEventListener('click', (e) => {
            console.log(form);
        })
    });
    
    
    // console.log(select0);
    // console.log(select1);
    
    $(document).foundation(); // getting the foundation at the last so it can run on dynamically created HTML elements
});