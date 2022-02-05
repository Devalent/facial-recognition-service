import React from 'react';

export default class NoiseComponent extends React.Component {
  private canvas:HTMLCanvasElement;
  private interval;

  componentDidMount() {
    const context = this.canvas.getContext('2d');
    let time = 0;

    const makeNoise = () => {
      const imgd = context.createImageData(this.canvas.width, this.canvas.height);
      const pix = imgd.data;
    
      for (var i = 0, n = pix.length; i < n; i += 4) {
        const c = 7 + Math.sin(i / 50000 + time / 7);
        pix[i] = pix[i + 1] = pix[i + 2] = 40 * Math.random() * c;
        pix[i + 3] = 255;
      }
    
      context.putImageData(imgd, 0, 0);
      time = (time + 1) % this.canvas.height;
    };

    this.interval = setInterval(makeNoise, 50);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  render() {
    return (
      <canvas
        ref={ref => this.canvas = ref}
        width="640"
        height="480"
        style={{ width: '100%', maxWidth: 640 }}
      ></canvas>
    )
  }
}
