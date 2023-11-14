import assets from './assets.js';
import FlappyBird from './FlappyBird.js';

function displayLeaderboard(leaderboard, currentUser) {
	const leaderboardContent = document.getElementById('leaderboardContent');
	leaderboardContent.innerHTML = '';
  
	const ol = document.createElement('ol');
	let topFiveleaderboard = leaderboard.slice(0,5)
	topFiveleaderboard.forEach((entry, index) => {
	  const li = document.createElement('li');
	  li.textContent = `${index + 1}. ${entry.username} - ${entry.score} points`;
  
	  // Bold the name if it matches the current user
	  if (entry.username === currentUser) {
		li.innerHTML = `<strong>${index + 1}. ${entry.username} - ${entry.score} points</strong>`;
	  }
  
	  ol.appendChild(li);
	});
  
	// Display user ranking if not in the top 5
	const userRanking = topFiveleaderboard.findIndex(entry => entry.username === currentUser);
	if (userRanking === -1) {
	  const dotLi = document.createElement('li');
	  dotLi.innerHTML = `.`

	  leaderboard.forEach((entry, index) => {
		const li = document.createElement('li');
		if (entry.username === currentUser) {
		  li.innerHTML = `<strong>${index + 1}. ${entry.username} - ${entry.score} points</strong>`;
		  ol.appendChild(dotLi);
		  ol.appendChild(li);
		} 
	  });

	}
  
	leaderboardContent.appendChild(ol);
  }
  
  
class FlappyBirdScene extends Phaser.Scene {
	constructor(){
		super("FlappyBird");
	}

	preload(){
		let game = this;

		this.load.html('inputForm', 'assets/inputForm.html');

		// scene assets
		this.load.image(assets.scene.background.day, 'assets/background-day.png');
		this.load.image(assets.scene.background.night, 'assets/background-night.png');
		this.load.spritesheet(assets.scene.ground, 'assets/ground-sprite.png', {
			frameWidth: 336,
			frameHeight: 112
		});

		this.load.image(assets.scene.startGame, 'assets/startgame1.png');
		this.load.image(assets.scene.gameOver, 'assets/gameover.png');
		this.load.image(assets.scene.restartGame, 'assets/restart-button.png');
		this.load.image(assets.scene.leaderBoard, 'assets/leaderboard-button.png');

		
		[assets.obstacle.pipe.green, assets.obstacle.pipe.red].forEach(function(pipe){
			game.load.image(pipe.top, `assets/${pipe.top}.png`);
			game.load.image(pipe.bottom, `assets/${pipe.bottom}.png`);
		});

		Object.keys(assets.bird).forEach(function(key){
			let bird = assets.bird[key].name;
			game.load.spritesheet(bird, `assets/bird-gluay-re.png`, {
				frameWidth: 34,
				frameHeight: 24
			});
		});
		this.load.image(assets.scoreboard.score, 'assets/score.png');
	}

	create(){
		let game = this;

		// background
		this.backgroundDay = this.add.image(assets.scene.width, 256, assets.scene.background.day).setInteractive();
		this.backgroundNight = this.add.image(assets.scene.width, 256, assets.scene.background.night).setInteractive();
		this.backgroundNight.visible = false;

		this.gaps = this.physics.add.group(); // gaps between pipes
		this.pipes = this.physics.add.group();

		// birds animation 
		Object.keys(assets.bird).forEach(function(key){
			game.anims.create({
					key: assets.bird[key].clapWings,
					frames: game.anims.generateFrameNumbers(assets.bird[key].name, {
							start: 0,
							end: 2
					}),
					frameRate: 10,
					repeat: -1
			});

			game.anims.create({
					key: assets.bird[key].stop,
					frames: [{
							key: assets.bird[key].name,
							frame: 1
					}],
					frameRate: 20
			});
		});

		// ground 
		this.ground = this.physics.add.sprite(assets.scene.width, 468, assets.scene.ground);
		this.ground.setCollideWorldBounds(true);
		this.ground.setDepth(20);
		// ajust collision box for the ground
		this.ground.setSize(0, 100, 0, 0).setOffset(0, 10);

		this.anims.create({ key: assets.animation.ground.moving, 
			frames: this.anims.generateFrameNumbers(assets.scene.ground, {
				start: 0,
				end: 2
			}),
			frameRate: 15,
			repeat: -1
		});

		this.anims.create({ key: assets.animation.ground.moving, 
			frames:[{
				key: assets.scene.ground,
				frame: 0
			}],
			frameRate: 20
		});
		
		// start, over, repeat
		this.start = this.add.image(assets.scene.width, 156, assets.scene.startGame);
		this.start.setDepth(30);
		this.start.visible = false;

		this.gameOver = this.add.image(assets.scene.width, 100, assets.scene.gameOver);
		this.gameOver.setDepth(20);
		this.gameOver.visible = false;

		this.showLeaderboard = this.add.image(assets.scene.width, 290, assets.scene.leaderBoard).setInteractive();
		this.showLeaderboard.setDisplaySize(120, 40);
		this.showLeaderboard.setDepth(20);
		this.showLeaderboard.visible = false;
		this.showLeaderboard.on('pointerdown', () => this.showLeaderboardFunction(this));

		this.restart = this.add.image(assets.scene.width, 340, assets.scene.restartGame).setInteractive();
		this.restart.setDepth(20);
		this.restart.setDisplaySize(120, 40);
		this.restart.visible = false;
		this.restart.on('pointerdown', () => this.restartGame(this));

		this.scoreboard = this.add.image(assets.scene.width, 200, assets.scoreboard.score);
		this.scoreboard.scale = 0.5;
		this.scoreboard.setDepth(30);

		this.scoreTxt = this.add.text(assets.scene.width, 40, 
			'0', { 
					fontFamily: 'font1', 
					fontSize: '38px', 
					fill: '#fff', 
					stroke: '#000',
					strokeThickness: 4,
					strokeLinecap: 'square',
					shadow: {
						offsetX: 2.5,
						offsetY: 3,
						color: '#000',
						blur: 0,
						stroke: true,
						fill: true
					}
				}
			);
		this.scoreTxt.setDepth(30);
		this.scoreTxt.setOrigin(0.5); //center text
		this.scoreTxt.alpha = 0;

		this.scored = this.add.text(assets.scene.width+5, 186, 
			'0', { 
					fontFamily: 'font1', 
					fontSize: '18px', 
					fill: '#fff', 
					stroke: '#000',
					strokeThickness: 3,
				}
			);
		this.scored.setDepth(30);
		this.scored.setOrigin(0.5);

		this.bestScore = this.add.text(assets.scene.width+5, 225, 
			'0', { 
					fontFamily: 'font1', 
					fontSize: '18px', 
					fill: '#fff', 
					stroke: '#000',
					strokeThickness: 3,
				}
			);
		this.bestScore.setDepth(30);
		this.bestScore.setOrigin(0.5, 0.5);

		this.initGame();
	}

	update(time, delta){
		if (this.isGameOver) return;
		if (!this.hasGameStarted) return;

		this.flappyBird.falls();

		this.pipes.children.iterate(function(pipe){
			if (pipe == undefined) return;
			if (pipe.x < -50) pipe.destroy();
			else pipe.setVelocityX(-100);
		});

		this.gaps.children.iterate(function(gap){
			gap.body.setVelocityX(-100);
		});

		this.nextPipes++;

		if (this.nextPipes === 250){
			this.makePipes();
			this.nextPipes = 0;
		}

	}

	initGame(){
		this.nextPipes = 0;
		this.score = 0;
		this.isGameOver = false;
		this.currentPipe = assets.obstacle.pipe.green;

		this.start.visible = true;
		this.gameOver.visible = false;
		this.scoreboard.visible = false;
		this.scored.visible = false;
		this.bestScore.visible = false;
		this.backgroundDay.visible = true;
		this.backgroundNight.visible = false;
		this.currentPipe = assets.obstacle.pipe.green;
		this.flappyBird = new FlappyBird(this, 60, 265);

		// controls: works for mobile too
		this.input.on('pointerdown', function () {
			this.flapBird();
		}, this);

		this.physics.add.collider(this.flappyBird, this.ground, this.hitBird, null, this);
		this.physics.add.overlap(this.flappyBird, this.pipes, this.hitBird, null, this);
		this.physics.add.overlap(this.flappyBird, this.gaps, this.updateScore, null, this);
		this.ground.anims.play( assets.animation.ground.moving, true );
	}

	flapBird(){
		if (this.isGameOver) return;
		if (!this.hasGameStarted) this.startGame();
		this.flappyBird.flap();
	}

	saveScore() {
		const username = localStorage.getItem('username')
		let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
	  
		if (this.score > bestScore) {
		  // Update local storage
		  localStorage.setItem('bestScore', this.score);
		  this.bestScore.setText(this.score);
		  
		  // Update backend (MySQL)
		  // Assuming you have a route to update the score in your MySQL database
		  fetch('/updateScore', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username: username, score: this.score }),
		  })
			.then(response => response.json())
			.then(data => console.log('Score updated in MySQL:', data))
			.catch(error => console.error('Error updating score in MySQL:', error));
		} else {
		  this.bestScore.setText(bestScore);
		}
	  
		this.scored.setText(this.score);
		this.scored.visible = true;
		this.bestScore.visible = true;
	  }
	  

	hitBird(){
		// stop the pipes
		this.pipes.children.iterate(function(pipe){
			if (pipe == undefined) return;
			pipe.setVelocityX(0);
		});

		this.saveScore();
		this.isGameOver = true;
		this.scoreboard.visible = true;
		this.hasGameStarted = false;
		this.flappyBird.die();
		this.ground.anims.stop(assets.animation.ground.moving, true);
		this.gameOver.visible = true;
		this.restart.visible = true;
		this.showLeaderboard.visible = true;
		this.scoreTxt.setText('');
	}

	restartGame(scene){
		scene.pipes.clear(true, true);
		scene.gaps.clear(true, true);
		scene.flappyBird.destroy();
		scene.gameOver.visible = false;
		scene.scoreboard.visible = false;
		scene.restart.visible = false;
		scene.showLeaderboard.visible = false;
		scene.scoreTxt.setText('0');
		scene.initGame();
	}
	// Add this method in your FlappyBirdScene class
	showLeaderboardFunction(scene) {
			
		const userInstagramUsername = localStorage.getItem('username');

		fetch('http://localhost:3000/leaderboard')
			.then(response => response.json())
			.then(data => {
				$('#leaderboardModal').modal('show');	
				const leaderboardData = data.leaderboard; 

				displayLeaderboard(data.leaderboard, userInstagramUsername);

				leaderboardData.sort((a, b) => b.score - a.score);
			})
			.catch(error => console.error('Error fetching leaderboard:', error));
			
	}

	updateScore(_, gap){
		this.score++;
		gap.destroy();

		if (this.score % 10 == 0){
			this.backgroundDay.visible = !this.backgroundDay.visible;
			this.backgroundNight.visible = !this.backgroundNight.visible;
			if (this.currentPipe === assets.obstacle.pipe.green){
				this.currentPipe = assets.obstacle.pipe.red;
			} else {
				this.currentPipe = assets.obstacle.pipe.green;
			}
		}
		this.scoreTxt.setText(this.score);
	}

	startGame(){
		this.scoreTxt.alpha = 1;
		this.hasGameStarted = true;
		this.start.visible = false;
		this.makePipes();
	}

	makePipes(){
		if (!this.hasGameStarted) return;
		if (this.isGameOver) return;

		const top = Phaser.Math.Between(-120, 120);
		const gap = this.add.line(288, top + 210, 0, 0, 0, 98);
		this.gaps.add(gap);
		gap.body.allowGravity = false;
		gap.visible = false;

		const pipeTop = this.pipes.create(288, top, this.currentPipe.top).setImmovable(true);
		pipeTop.body.allowGravity = false;

		const pipeBottom = this.pipes.create(288, top + 420, this.currentPipe.bottom).setImmovable(true);
		pipeBottom.body.allowGravity = false;			
	}
}

export default FlappyBirdScene;