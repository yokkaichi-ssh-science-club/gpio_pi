const Gpio = require('pigpio').Gpio

const button = new Gpio(18, {
    mode: Gpio.INPUT,
    pullUpDown: Gpio.PUD_DOWN,
    edge: Gpio.EITHER_EDGE
  })
const mag = new Gpio(17, {mode: Gpio.OUTPUT});

exports.startTime=()=>new Promise((resolve,reject)=>{
  let prevFlag=false
  const times=[]
  const timerFn= function (level) {
    let time=process.hrtime.bigint();
    if(!prevFlag===level){
      times.push(time)
      prevFlag=level

      if(times.length>=4){
        button.off(timerFn)
        resolve(Math.floor((times[3]-times[0])*100))
      }
    }else{
      times[times.length-1]=time
    }
  }
  button.on('interrupt',timerFn);
    mag.digitalWrite(0)
})

exports.enableMagnet=()=> new Promise((resolve, reject) => {
  mag.digitalWrite(1)
  resolve()
});
button.on('interrupt', function (level) {
  let time=process.hrtime();
  exports.io&&exports.io.emit("change",{
    value:level,
    ts:time[0]+"."+time[1]
  });
});
