const Gpio = require('pigpio').Gpio
const BigNumber= require("bignumber.js")
const button = new Gpio(18, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.EITHER_EDGE
  })
const mag = new Gpio(23, {mode: Gpio.OUTPUT});
let timerFn=function(){}
function tuple2bn(tuple){
  return (new BigNumber(tuple[1])).shiftedBy(-9).plus(tuple[0])
}

exports.startTime=()=>new Promise((resolve,reject)=>{
  let prevFlag=!button.digitalRead()
  const times=[]
  timerFn= function (level) {
    level=!!level
    console.log(prevFlag,level,times.map(r=>+r));
    let time=tuple2bn(process.hrtime());
    if(!prevFlag===level){
      times.push(time)
      prevFlag=level

      if(times.length>=4){
        button.off("interrupt",timerFn)
        resolve(times[3].minus(times[0]).times(100).toNumber())
      }
    }else{
      if(times.length-1>0){
        times[times.length-1]=time
      }else{
        times[0]=time
      }
    }
  }
  button.on('interrupt',timerFn);
  mag.digitalWrite(0)
})

exports.enableMagnet=()=> new Promise((resolve, reject) => {
  mag.digitalWrite(1)
  resolve()
});

exports.reset=()=> new Promise((resolve, reject) => {
  mag.digitalWrite(0)
  button.off("interrupt",timerFn)
  resolve()
});

button.on('interrupt', function (level) {
  let time=process.hrtime();
  exports.io&&exports.io.emit("change",{
    value:level,
    ts:time[0]+"."+time[1]
  });
});
