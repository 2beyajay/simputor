window.addEventListener('DOMContentLoaded', (event) => {
	init();
});

let starter, player0, player1, whoseTurn, fighters;
let clock = 1000;
let turnsSet = false;


// a promise used for delay
const timer = ms => new Promise(res => setTimeout(res, ms))



async function init() {

	// fetching data from json
	let data = await fetch('fighters.json')
		.then(response => response.json())
		.catch(err => {
			console.log(err);
		});

	// setting all fighters
	let allFighters = data.fighters;

	// both HTML select elements
	let fighterSelects = document.querySelectorAll('select');

	// pushing options into both HTML selects 
	allFighters.forEach(fighter => {
		let option = `<option value="${fighter.code}">${fighter.name}</option>`;
		fighterSelects.forEach(fighterSelect => {
			fighterSelect.innerHTML += option;
		})
	});


	let fighter0code, fighter1code;
	let form = document.querySelector('form')
	form.addEventListener('submit', (e) => {
		turnsSet = false;
		e.preventDefault();
		let select0 = document.querySelector("#fighter1");
		let select1 = document.querySelector("#fighter2");
		fighter0code = select0.value;
		fighter1code = select1.value;

		if (fighter0code == -1 || fighter1code == -1) {
			console.log('please select 2 fighters');
		} else {
			// getting selected fighters from the json data 
			let fighter0 = allFighters.filter(fighter => {
				return fighter.code == fighter0code;
			})
			let fighter1 = allFighters.filter(fighter => {
				return fighter.code == fighter1code;
			})

			// initiating the fight sequence
			// let fight = new Fight(fighter0[0], fighter1[0]);

			player0 = new Fighter(fighter0[0]);
			player1 = new Fighter(fighter1[0]);

			fighters = [player0, player1]

			fighttt(player0, player1);
		}
	})
}

async function fighttt(player0, player1) {

	// setting the starter based on the speed stat
	if (player0.speed > player1.speed) {
		starter = 0;
	} else if (player0.speed < player1.speed) {
		starter = 1;
	} else {
		// if the speed stats are the same, randomly choosing the starter
		starter = (Math.ceil(Math.random() * 2) === 1) ? 0 : 1
	}

	if (!turnsSet) {
		await setTurns();
		turnsSet = true;
	}


	do {

		// turn player determining damage 
		let move = fighters[whoseTurn].doDamage();
		let moveDamage = move.power;
		let moveName = move.name;

		// losing HP for out of turn player
		fighters[1 - whoseTurn].takeDamage(moveDamage);

		console.log(`${fighters[whoseTurn].name}(${fighters[whoseTurn].health}) did ${moveName}(${moveDamage}) to ${fighters[1 - whoseTurn].name}(${fighters[1 - whoseTurn].health}) \n`);

		// changing turns
		whoseTurn = 1 - whoseTurn;

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
		this.damage = fighter.damage;
		this.speed = fighter.speed;
		this.accuracy = fighter.accuracy;
		this.ospecial = fighter.ospecial;
		this.dspecial = fighter.dspecial;
		this.isAlive = true;
	}

	doDamage() {
		/* let isSpecial = (Math.floor(Math.random() * 2) === 1) ? true : false;
		if (!isSpecial) { // no dspecial
			return this.damage;
		}else{ // for dspecial
			console.log('ospecial:' + this.ospecial);
			return 0;
		} */

		// getting the total of weights of all moves 
		let totalChance = 1;
		this.ospecial.forEach(move => {
			totalChance += move.chance;
		});

		const threshold = Math.floor(Math.random() * totalChance);

		totalChance = 0;

		for (let i = 0; i < this.ospecial.length; ++i) {
			// Add the weight to our running total.
			totalChance += this.ospecial[i].chance;

			// If this value falls within the threshold, we're done!
			if (totalChance >= threshold) {
				return this.ospecial[i];
			}
		}


	}

	takeDamage(incomingDamage) {
		let isSpecial = (Math.floor(Math.random() * 2) === 1) ? true : false;
		this.health -= incomingDamage;

		/* if (!isSpecial) { // no dspecial
			this.health -= incomingDamage;
		} else { // for dspecial
			console.log(this.dspecial);
		} */
	}
}













/* ************************************ */

class Fight {
	constructor(fighter0, fighter1) {
		this.fighter0 = fighter0;
		this.fighter1 = fighter1;
		this.turnNum = 0;
		this.whoseTurn = 0;
		this.turnsSet = false;

		// who will hit first based on the 'speed' stat
		this.starter;

		if (this.fighter0.speed > this.fighter1.speed) {
			this.starter = 0;
		} else if (this.fighter0.speed < this.fighter1.speed) {
			this.starter = 1;
		} else {
			// if the speed stats are the same, randomly choosing the starter
			this.starter = (Math.ceil(Math.random() * 2) === 1) ? 0 : 1
		}

		this.fightStart()

	}

	// promise to return the turnSequence
	setTurns() {
		return new Promise((resolve, reject) => {
			let turnSequence = [];
			if (this.starter == 0) {
				turnSequence = [this.fighter0, this.fighter1]
				this.whoseTurn = 0;
			} else {
				turnSequence = [this.fighter1, this.fighter0]
				this.whoseTurn = 1;
			}
			resolve(turnSequence)
		})
	}

	doDamage() {

	}

	async fightStart() {
		let self = this; // duplicating the object because setTimeout changes the meaning of 'this'


		// array for saving turn sequence
		if (!this.turnsSet) {
			let turnSequence = await this.setTurns();
			console.log(turnSequence);
			this.turnsSet = true;
		}


		// check if dead, stop the recursion if dead
		if (turnSequence.health <= 0) {
			// start death function
			console.log(turnSequence[0].name + ' is dead');
		}
		// pick normal or special damage
		// pick special defense or not

		// change turn
		this.whoseTurn = 1 - this.whoseTurn;

	}
}