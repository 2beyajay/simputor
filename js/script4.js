window.addEventListener('DOMContentLoaded', (event) => {
	init();
});

// Initialize Firebase
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
firebase.initializeApp(firebaseConfig);
let ref = firebase.database().ref('/');



let franchiceUL0 = document.querySelector('.selection-sect #p0')
let franchiceUL1 = document.querySelector('.selection-sect #p1')

let submit = document.querySelector('#submit button');

let player0NameHtml = document.querySelectorAll('.showSelection .player1Name')
let player1NameHtml = document.querySelectorAll('.showSelection .player2Name')

let logs = document.querySelector('#logs');


let player0, player1, fighter0, fighter1;

let starter, whoseTurn, fighters, clock = 2000,
	turnsSet = false;


// speed clock
let slider = document.querySelector('#clock');
let clockValue = document.querySelector('#clockValue');
clockValue.innerText = slider.value;
slider.addEventListener('change', (e) => {
	// console.log(slider.value);
	clock = clock / slider.value
	clockValue.innerText = slider.value;
});

// a promise used for delay
const timer = ms => new Promise(res => setTimeout(res, ms))



// fetching data to populate character list
ref.once('value', (snapshot) => {
	let allData;
	allData = snapshot.val();

	for (const franchises in allData) {
		// getting the franchise names
		let franchisesLi = document.createElement('li');
		franchisesLi.classList.add('franchises-li', 'accordion-item');
		franchisesLi.setAttribute('data-accordion-item', '');

		let franchiseTitle = document.createElement('a'); //creating the franchise anchor
		franchiseTitle.href = "#";
		franchiseTitle.classList.add('accordion-title');
		franchiseTitle.innerText = franchises; //setting the anchor text
		franchisesLi.appendChild(franchiseTitle);

		let charactersAccordionDiv = document.createElement('div');
		charactersAccordionDiv.classList.add('accordion-content');
		charactersAccordionDiv.setAttribute('data-tab-content', '');
		franchisesLi.appendChild(charactersAccordionDiv);

		let charactersAccordionUL = document.createElement('ul');
		charactersAccordionUL.classList.add('accordion', 'characters-accordion');
		charactersAccordionUL.setAttribute('data-accordion', '')
		charactersAccordionUL.setAttribute('data-multi-expand', 'true')
		charactersAccordionUL.setAttribute('data-allow-all-closed', 'true')
		charactersAccordionDiv.appendChild(charactersAccordionUL);



		let characters = allData[franchises];
		for (const chars in characters) {

			let characterLi = document.createElement('li');
			characterLi.classList.add('character-li', 'accordion-item');
			characterLi.setAttribute('data-accordion-item', '');
			charactersAccordionUL.appendChild(characterLi);

			let characterTitle = document.createElement('a'); //creating the franchise anchor
			characterTitle.href = "#";
			characterTitle.classList.add('accordion-title');
			characterTitle.innerText = chars; //setting the anchor text
			characterLi.appendChild(characterTitle);

			let formsAccordionDiv = document.createElement('div');
			formsAccordionDiv.classList.add('accordion-content');
			formsAccordionDiv.setAttribute('data-tab-content', '');
			characterLi.appendChild(formsAccordionDiv);


			let forms = characters[chars];
			for (const frms in forms) {

				let formDiv = document.createElement('div');
				formDiv.classList.add('form-div');
				formDiv.setAttribute('data-franchise', franchises);
				formDiv.setAttribute('data-character', chars);
				formDiv.setAttribute('data-form', frms);
				formsAccordionDiv.appendChild(formDiv);

				let formIconImg = document.createElement('img');

				formIconImg.setAttribute('src', 
					(imageExists(`../img/franchises/${franchises}/${chars}/${frms}.png`) ? `../img/franchises/${franchises}/${chars}/${frms}.png` : 'https://via.placeholder.com/50')
				)


				formIconImg.setAttribute('alt', `${franchises} -> ${chars} -> ${frms}`)
				formIconImg.className = "form-selection-icon"
				formDiv.appendChild(formIconImg);

				let formTitle = document.createElement('p'); //creating the franchise anchor
				formTitle.innerText = frms; //setting the anchor text
				formDiv.appendChild(formTitle);


				// working on showing stats
				let formStatsDiv = document.createElement('div');
				formStatsDiv.className = "formStatsDiv"
				formStatsDiv.innerHTML = 
				`<div class="formStatsDiv">
					<div class="formHPDiv">
						<h6 class="formHPTitle">HP</h6>
						<p class="formHPValue">${forms[frms].health}</p>
					</div>
					<div class="formSpeedDiv">
						<h6 class="formSpeedTitle">Speed</h6>
						<p class="formSpeedValue">${forms[frms].speed}</p>
					</div>
				</div>`

				formDiv.appendChild(formStatsDiv)

			}
		}


		franchiceUL0.appendChild(franchisesLi);
	}

	franchiceUL1.innerHTML = franchiceUL0.innerHTML;


	let p0Forms = document.querySelectorAll('#p0 .form-div');
	let p1Forms = document.querySelectorAll('#p1 .form-div');


	p0Forms.forEach(form => {
		form.addEventListener('click', (e) => {
			let player0ref = firebase.database().ref(form.dataset.franchise + '/' + form.dataset.character + '/' + form.dataset.form);

			player0ref.once('value', (player0data) => {
				fighter0 = player0data.val();
				fighter0.name = `${form.dataset.character}(${form.dataset.form})`;
				// console.log('player 1:' + fighter0.name);

				// showing the selected name in html
				player0NameHtml.forEach(element => {
					element.innerHTML = fighter0.name;
				});
			})
		})
	});

	p1Forms.forEach(form => {
		form.addEventListener('click', (e) => {
			let player1ref = firebase.database().ref(form.dataset.franchise + '/' + form.dataset.character + '/' + form.dataset.form);

			player1ref.once('value', (player1data) => {
				fighter1 = player1data.val();
				fighter1.name = `${form.dataset.character}(${form.dataset.form})`;
				// console.log('player 2:' + fighter1.name);
				
				// showing the selected name in html
				player1NameHtml.forEach(element => {
					element.innerHTML = fighter1.name;
				});
			})
		})
	});

	$(document).foundation(); // getting the foundation at the last so it can run on dynamically created HTML elements
});




async function init() {

	submit.addEventListener('click', (e) => {
		if (!fighter0 || !fighter1) {
			// console.log('please select 2 fighters');
		} else {

			logs.innerHTML = '';

			player0 = new Fighter(fighter0);
			player1 = new Fighter(fighter1);
			fighters = [player0, player1]

			let fighterPictures = document.querySelector(".fighter-pictures")

			let fighterPicture0 = document.querySelector(".fighter-pictures .zero")
			// fighterPicture0.src = fighter0.imgURL
			let fighterPicture1 = document.querySelector(".fighter-pictures .one")
			// fighterPicture1.src = fighter1.imgURL

			fighterPicture0.src = (imageExists(`../img/franchises/${fighter0.imgURL}.png`) ? `../img/franchises/${fighter0.imgURL}.png` : 'https://via.placeholder.com/150')
			
			fighterPicture1.src = (imageExists(`../img/franchises/${fighter1.imgURL}.png`) ? `../img/franchises/${fighter1.imgURL}.png` : 'https://via.placeholder.com/150')


			fighterPictures.style.display = "flex";



			/* ******* starting the fight sequence ********* */
			fight(player0, player1);

			
			logs.scrollIntoView({behavior: "smooth", inline: "nearest"});

		}
	})

}

async function fight(player0, player1) {

	// setting the starter based on the speed stat
	if (player0.speed > player1.speed) {
		starter = 0;
	} else if (player0.speed < player1.speed) {
		starter = 1;
	} else {
		// if the speed stats are the same, randomly choosing the starter
		starter = (Math.ceil(Math.random() * 2) === 1) ? 0 : 1
	}

	// setting turns if not set
	if (!turnsSet) {
		await setTurns();
		turnsSet = true;
	}

	do {

		// turn player determining damage 
		let move = fighters[whoseTurn].doDamage();
		let movePower = move.power;
		let moveName = move.name;

		// determining the defense move for out of turn player
		let defenseTaken = fighters[1 - whoseTurn].defend();
		let defensePower = defenseTaken.power;
		let defenseName = defenseTaken.name;


		// console.log('\n');
		// console.log(moveName, movePower);
		// console.log(defenseName, defensePower);

		// no defense
		if (defensePower <= 0) {
			fighters[1 - whoseTurn].health -= movePower
			// console.log(`${fighters[1 - whoseTurn].name} damaged by ${moveName} and now at ${fighters[1 - whoseTurn].health} \n`);

			logs.innerHTML += 
			`<p>
				<span class="character-name">${fighters[1 - whoseTurn].name}</span> 
				damaged by 
				<span class="atk-move">${moveName}</span> 
				and now at 
				<span class="hp">${fighters[1 - whoseTurn].health}</span> \n
			</p>`
		} else {
			// simple defense
			if (defensePower < movePower) {
				fighters[1 - whoseTurn].health -= (movePower - defensePower)
				// console.log(`${fighters[1 - whoseTurn].name} reduced ${moveName} by ${defensePower} with ${defenseName} and now at ${fighters[1 - whoseTurn].health} \n`);

				logs.innerHTML += 
				`<p>
					<span class="character-name">${fighters[1 - whoseTurn].name}</span> 
					reduced 
					<span class="atk-move">${moveName}</span> 
					by 
					<span class="number">${defensePower}</span> 
					with 
					<span class="def-move">${defenseName}</span> 
					and now at 
					<span class="hp">${fighters[1 - whoseTurn].health}</span> \n
				</p>`;
			}
			// counter
			else {
				fighters[whoseTurn].health -= defensePower;
				// console.log(`${fighters[1 - whoseTurn].name} countered ${moveName} with ${defenseName} and did ${defensePower} damage`);

				logs.innerHTML += `
				<p>
					<span	class="character-name">${fighters[1 - whoseTurn].name}</span> 
					<span class="counter">countered</span> 
					<span class="atk-move">${moveName}</span> 
					with 
					<span class="def-move">${defenseName}</span> 
					and did 
					<span class="number">${defensePower}</span> 
					damage
				</p>`;
			}
		}

		// changing turns
		whoseTurn = 1 - whoseTurn;

		// sending the death and winner message
		if (player0.health <= 0) {
			// console.log(`${player0.name} died. The winner is ${player1.name}`);
			logs.innerHTML += `<p class="win">${player0.name} died. The winner is ${player1.name}</p>`

		}
		if (player1.health <= 0) {
			// console.log(`${player1.name} died. The winner is ${player0.name}`);
			logs.innerHTML += `<p class="win">${player1.name} died. The winner is ${player0.name}</p>`
			
		}

		// delay for the next turn
		await timer(clock);
	} while (player0.health > 0 && player1.health > 0);
}

function setTurns() {
	return new Promise((resolve, reject) => {
		if (starter == 0) {
			whoseTurn = 0;
		} else {
			whoseTurn = 1;
		}
		resolve()
	})
}


class Fighter {
	constructor(fighter) {
		this.name = fighter.name;
		this.code = fighter.code;
		this.health = fighter.health;
		this.speed = fighter.speed;
		this.accuracy = fighter.accuracy;
		this.ospecial = fighter.ospecial;
		this.dspecial = fighter.dspecial;
		this.isAlive = true;

		this.damageTotalChance = 1;
		this.ospecial.forEach(move => {
			this.damageTotalChance += move.chance;
		});

		this.defenseTotalChance = 1;
		this.dspecial.forEach(move => {
			this.defenseTotalChance += move.chance;
		});
	}

	doDamage() {
		const threshold = Math.floor(Math.random() * this.damageTotalChance);
		let totalChance = 0;

		for (let i = 0; i < this.ospecial.length; ++i) {
			// Add the weight to our running total.
			totalChance += this.ospecial[i].chance;

			// If this value falls within the threshold, the move will be selected
			if (totalChance >= threshold) {
				return this.ospecial[i];
			}
		}
	}

	defend() {
		const threshold = Math.floor(Math.random() * this.defenseTotalChance);
		let totalChance = 0;

		for (let i = 0; i < this.dspecial.length; ++i) {
			// Add the weight to our running total.
			totalChance += this.dspecial[i].chance;

			// If this value falls within the threshold, the move will be selected
			if (totalChance >= threshold) {
				return this.dspecial[i];
			}
		}
	}
}

// checking if image exists, if not, returning false(404) and using placeholder image
function imageExists(image_url){

	var http = new XMLHttpRequest();

	http.open('HEAD', image_url, false);
	http.send();

	return http.status != 404;

}