import Phaser from "phaser"
import piano88 from '../assets/piano88.json'
import currentMusic from '../assets/musics/千本樱.json'

// 计算全局游戏宽高
if(window.innerHeight > window.innerWidth){
  if(innerHeight / innerWidth >= 16 / 9){
    var gameWidth = innerWidth
    var gameHeight = gameWidth * 16 / 9
  } else {
    var gameHeight = innerHeight * 0.98
    var gameWidth = gameHeight * 9 / 16
  }
} else {
  if(innerWidth / innerHeight >= 16 / 9){
    var gameHeight = innerHeight * 0.98
    var gameWidth = gameHeight * 16 / 9
  } else {
    var gameWidth = innerWidth
    var gameHeight = gameWidth * 9 / 16
  }
}


const scene1 = {
  preload() {
    this.load.image('keyImg', '../assets/pic/keyImg.png')
    this.load.image('background', '../assets/pic/background.jpg')
    this.load.image('star', '../assets/pic/star.png')
  },
  create() {
    // 竖屏设备旋转
      if (window.innerHeight > window.innerWidth) {
        [gameWidth, gameHeight] = [gameHeight, gameWidth]
        this.cameras.main.rotation = Phaser.Math.DegToRad(90)
        this.cameras.main.x = gameHeight * -0.77
        this.cameras.main.width *= 1.75
      }

    // 背景图
    this.add.image(0, 0, 'background').setOrigin(0, 0).setScale(gameWidth/1280)
    const gra4 = this.add.graphics()
    gra4.fillStyle(0x111111, 0.4)
    gra4.fillRect(0, 0, gameWidth, gameHeight)

    // 划分界线
    const gra1 = this.add.graphics()
    gra1.lineStyle(2, 0xaaccee, 0.8)
    for (let i = 0; i < 5; i++) {
      gra1.moveTo(i * gameWidth / 8 + gameWidth / 4, 0)
      gra1.lineTo(i * gameWidth / 8 + gameWidth / 4, gameHeight)
      gra1.strokePath()
    }
    // 判定线
    const gra2 = this.add.graphics()
    gra2.fillStyle(0xbbeeff, 0.6)
    gra2.fillRect(0, 0, gameWidth/2, gameHeight/22.5)
    gra2.generateTexture('decision', gameWidth/2, gameHeight/22.5)
    const decision = this.physics.add.sprite(gameWidth*0.25, gameHeight*0.95, 'decision')
    decision.setOrigin(0, 0).setSize(gameWidth*0.5, gameHeight/9)
    gra2.clear()

    // 分数
    this.score = 0
    const scoreText = this.scoreText = this.add.text(gameWidth*0.5, gameHeight*0.2, this.score, {
      fontSize: '40px', color: '#aed', fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0)

    // 递归播放音频
    let key;
    const keys = ['d', 'f', 'j', 'k'];
    const keyPositions = [gameWidth*2/8, gameWidth*3/8, gameWidth*4/8, gameWidth*5/8];
    const next = (i) => {
      if (!currentMusic.musics[i]) return;
      let timeLength = currentMusic.musics[i].length * 60 / currentMusic.bpm * 1000;

      // 判断是否为空拍
      if (currentMusic.musics[i].key !== '0') {
        let currentX = Phaser.Math.Between(0, 3);
        key = this.physics.add.sprite(keyPositions[currentX], 0, 'keyImg')
          .setScale(gameWidth*0.0019, gameHeight*0.0006)
          .setSize(gameWidth*0.0625, gameHeight*0.15)
          .setOrigin(0, 0)
          .setVelocityY(gameHeight)
          .setInteractive()

        // 生成粒子
        const particle = this.add.particles(keyPositions[currentX] + gameWidth*0.0625, gameHeight*0.97, 'star', {
          frequency: 1,
          lifespan: 150,
          speed: { min: 100, max: gameWidth },
          alpha: { start: 1, end: 0}
        }).stop();

        // 分数判定
        const handleHit = (keyItem) => {
          let gap = Math.abs(decision.y - keyItem.y);
          this.score += gap < gameHeight*0.05 ? ((gameHeight*0.05 - gap)/gameHeight*20.375)*100 : 20;
          particle.start();
          this.time.delayedCall(100, () => particle.stop());
          keyItem.destroy();
        }

        // 碰撞 & 键盘 & 触摸检测
        this.physics.add.overlap(decision, key, (decision, keyItem) => {
          const pressedKey = keys.find((k, idx) => this.input.keyboard.addKey(k).isDown && keyItem.x === keyPositions[idx]);
          if (pressedKey){handleHit(keyItem)}
          keyItem.on('pointerdown', () => {
            handleHit(keyItem)
          })
        });


        // 播放音效
        let audio = new Audio(piano88[currentMusic.musics[i].key]);
        setTimeout(() => {
          audio.load();
          audio.play();
        }, gameHeight / key.body.speed * 900);
      }

      // 递归调用生成下一个音符
      setTimeout(() => next(i + 1), timeLength);
    };

    // 开始按钮
    const gra3 = this.add.graphics()
    gra3.fillStyle(0x99eeee, 0.6)
    gra3.fillRect(gameWidth*0.8125, gameHeight*0.7, gameWidth*0.125, gameHeight*0.1)
    const startText = this.add.text(gameWidth*0.82, gameHeight*0.72, 'start!', {
      fontSize: gameWidth*0.03+'px', color: '#559', fontStyle: 'bold'
    }).setInteractive().on('pointerdown', () => {
      next(0)
      startText.setAlpha(0)
      scoreText.setAlpha(1)
      gra3.clear()
    })

    // 歌曲信息
    this.add.text(gameWidth*0.025, gameHeight*0.025,
      'name: ' + currentMusic.name + '\n\nsinger: ' + currentMusic.singer + '\n\nBPM: ' + currentMusic.bpm, {
      color: '#ccf', fontSize: gameWidth*0.018+'px', fontStyle: 'bold'
    })

    // 按键提示
    this.add.text(gameWidth*5/16, gameHeight*0.97, 'D', { color: '#11f', fontSize: gameWidth*0.02+'px', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(gameWidth*7/16, gameHeight*0.97, 'F', { color: '#11f', fontSize: gameWidth*0.02+'px', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(gameWidth*9/16, gameHeight*0.97, 'J', { color: '#11f', fontSize: gameWidth*0.02+'px', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(gameWidth*11/16, gameHeight*0.97, 'K', { color: '#11f', fontSize: gameWidth*0.02+'px', fontStyle: 'bold' }).setOrigin(0.5)
  },
  update() {
    this.scoreText.setText(this.score.toFixed(1))
  }
}

const config = {
  width: gameWidth,
  height: gameHeight,
  scene: scene1,
  backgroundColor: '#99b',
  physics: {
    default: 'arcade',
    arcade: {
      debug: true
    }
  }
}
new Phaser.Game(config)