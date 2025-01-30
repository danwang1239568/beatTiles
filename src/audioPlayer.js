import Phaser from "phaser";
import piano88 from '../assets/piano88.json'
import currentMusic from '../assets/musics/千本樱.json'

// const audio = document.getElementById('audio')
const btn = document.getElementById('btn')

// audio.src = piano88.A_sh3
btn.addEventListener('click', () => {
  next()
})

const audio = new Audio()
let i = 0
// 递归播放音频
function next(){
  if(currentMusic.musics[i]){
    let timeLength = currentMusic.musics[i].length * 60 / currentMusic.bpm * 1000

    // 判断是否为空拍
    if(currentMusic.musics[i].key !== '0'){
      audio.src = piano88[`${currentMusic.musics[i].key}`]
      audio.play()
      btn.style.backgroundColor = '#caa'
      setTimeout(() => {
        btn.style.backgroundColor = '#fff'
      }, 100);
    }
    setTimeout(() => {
      audio.load()
      next()
    }, timeLength);
  }
  i++
}